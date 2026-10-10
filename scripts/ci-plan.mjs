import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Reuse only a recent full run of the identical repository tree, never a partial check.
export async function findReusableCI({ event, sha, repository, get, now = Date.now() }) {
  if (event !== "push" || !/^[a-f0-9]{40}$/.test(sha ?? "")) return null;
  try {
    const commit = await get(`/commits/${sha}`);
    if (commit.parents?.length !== 2) return null;
    const source = commit.parents[1].sha;
    const original = await get(`/commits/${source}`);
    if (!commit.commit?.tree?.sha || commit.commit.tree.sha !== original.commit?.tree?.sha) return null;
    const data = await get(`/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${source}&per_page=100`);
    const run = data.workflow_runs
      .filter(
        (item) =>
          item.head_sha === source && item.event === "pull_request" && item.head_repository?.full_name === repository,
      )
      .sort((a, b) => b.id - a.id)[0];
    const age = now - Date.parse(run?.updated_at);
    if (
      run?.status !== "completed" ||
      run.conclusion !== "success" ||
      !Number.isFinite(age) ||
      age < 0 ||
      age > 86_400_000
    )
      return null;
    const { jobs } = await get(`/actions/runs/${run.id}/attempts/${run.run_attempt}/jobs?per_page=100`);
    const required = ["static", "chromium-shard-1", "chromium-shard-2", "webkit-shard-1", "webkit-shard-2"];
    if (
      !required.every((name) =>
        jobs.some((job) => job.name === name && job.status === "completed" && job.conclusion === "success"),
      )
    )
      return null;
    return { id: run.id, sha: source, tree: commit.commit.tree.sha };
  } catch {
    // Missing, malformed or unavailable evidence means run the full suite.
    return null;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repository = process.env.GITHUB_REPOSITORY;
  const evidence = await findReusableCI({
    event: process.env.GITHUB_EVENT_NAME,
    sha: process.env.GITHUB_SHA,
    repository,
    get: async (path) => {
      const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
        headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      return response.json();
    },
  });
  await appendFile(process.env.GITHUB_OUTPUT, `reuse=${Boolean(evidence)}\n`);
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    evidence
      ? `Reused full [PR CI](https://github.com/${repository}/actions/runs/${evidence.id}) for ${evidence.sha}; identical tree ${evidence.tree}. Release SHA: ${process.env.GITHUB_SHA}.\n`
      : "Full CI required: no recent successful full PR run with an identical tree was verified.\n",
  );
}
