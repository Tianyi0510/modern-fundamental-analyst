import { pathToFileURL } from "node:url";

export async function requireSuccessfulCI({ env = process.env, fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), now = Date.now } = {}) {
  if (env.VERCEL_ENV !== "production") return;
  const sha = env.VERCEL_GIT_COMMIT_SHA;
  if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Production requires an exact Git commit SHA.");
  const deadline = now() + 10 * 60_000;
  const endpoint = `https://api.github.com/repos/Tianyi0510/modern-fundamental-analyst/actions/workflows/ci.yml/runs?head_sha=${sha}&event=push&per_page=20`;
  while (now() < deadline) {
    const response = await fetcher(endpoint, { headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Cannot verify CI: GitHub returned ${response.status}.`);
    const { workflow_runs: runs } = await response.json();
    const run = runs?.filter(run => run.head_sha === sha && run.head_branch === "main" && run.event === "push")
      .sort((a, b) => b.id - a.id)[0];
    if (run?.status === "completed") {
      if (run.conclusion !== "success") throw new Error(`Production blocked: CI concluded ${run.conclusion}.`);
      console.log(`CI verified for ${sha}: ${run.html_url}`);
      return;
    }
    await sleep(15_000);
  }
  throw new Error("Production blocked: CI did not succeed within 10 minutes.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await requireSuccessfulCI();
}
