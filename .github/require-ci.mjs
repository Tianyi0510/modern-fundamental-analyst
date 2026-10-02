import { pathToFileURL } from "node:url";

// The longest CI job allows 20 minutes; leave room for queueing and the
// remaining Vercel build steps within its 45-minute build limit.
const CI_WAIT_MS = 30 * 60_000;

export async function requireSuccessfulCI({
  env = process.env,
  fetcher = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = Date.now,
} = {}) {
  if (env.VERCEL_ENV !== "production") return;
  const sha = env.VERCEL_GIT_COMMIT_SHA;
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Production requires an exact Git commit SHA.");
  const deadline = now() + CI_WAIT_MS;
  const endpoint = `https://api.github.com/repos/Tianyi0510/modern-fundamental-analyst/actions/workflows/ci.yml/runs?head_sha=${sha}&event=push&per_page=20`;
  let failures = 0;
  const wait = (ms) => sleep(Math.min(ms, Math.max(0, deadline - now())));
  const backoff = () => Math.min(60_000 * 2 ** Math.min(failures++, 2), 240_000);
  while (now() < deadline) {
    let response;
    try {
      response = await fetcher(endpoint, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(Math.min(10_000, deadline - now())),
      });
    } catch {
      await wait(backoff());
      continue;
    }
    if (!response.ok) {
      const retryAfter = response.headers.get("retry-after");
      const reset = response.headers.get("x-ratelimit-reset");
      const limited =
        response.status === 429 ||
        (response.status === 403 && (retryAfter !== null || response.headers.get("x-ratelimit-remaining") === "0"));
      if (limited) {
        const retryMs =
          retryAfter === null
            ? 0
            : /^\d+$/.test(retryAfter)
              ? Number(retryAfter) * 1000
              : Date.parse(retryAfter) - now();
        const resetMs = reset === null ? 0 : Number(reset) * 1000 - now();
        await wait(Math.max(backoff(), Number.isFinite(retryMs) ? retryMs : 0, Number.isFinite(resetMs) ? resetMs : 0));
        continue;
      }
      if (response.status >= 500) {
        await wait(backoff());
        continue;
      }
      throw new Error(`Cannot verify CI: GitHub returned ${response.status}.`);
    }
    let runs;
    try {
      const body = await response.json();
      if (
        !Array.isArray(body?.workflow_runs) ||
        body.workflow_runs.some(
          (run) =>
            !run ||
            !Number.isSafeInteger(run.id) ||
            typeof run.head_sha !== "string" ||
            (typeof run.head_branch !== "string" && run.head_branch !== null) ||
            typeof run.event !== "string" ||
            typeof run.status !== "string" ||
            (typeof run.conclusion !== "string" && run.conclusion !== null),
        )
      ) {
        throw new Error("Invalid CI response.");
      }
      runs = body.workflow_runs;
    } catch {
      await wait(backoff());
      continue;
    }
    // Receiving headers alone does not confirm a usable GitHub response.
    failures = 0;
    const run = runs
      ?.filter((run) => run.head_sha === sha && run.head_branch === "main" && run.event === "push")
      .sort((a, b) => b.id - a.id)[0];
    if (run?.status === "completed") {
      if (run.conclusion !== "success") throw new Error(`Production blocked: CI concluded ${run.conclusion}.`);
      console.log(`CI verified for ${sha}: ${run.html_url}`);
      return;
    }
    await wait(60_000);
  }
  throw new Error("Production blocked: CI did not succeed within 30 minutes.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await requireSuccessfulCI();
}
