import assert from "node:assert/strict";
import test from "node:test";
import { findReusableCI } from "./ci-plan.mjs";

const sha = "a".repeat(40);
const source = "b".repeat(40);
const now = Date.parse("2026-10-02T12:00:00Z");
function fixture() {
  return {
    [`/commits/${sha}`]: { parents: [{ sha: "c".repeat(40) }, { sha: source }], commit: { tree: { sha: "tree" } } },
    [`/commits/${source}`]: { commit: { tree: { sha: "tree" } } },
    [`/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${source}&per_page=100`]: {
      workflow_runs: [
        {
          id: 42,
          run_attempt: 1,
          head_sha: source,
          event: "pull_request",
          head_repository: { full_name: "owner/repo" },
          status: "completed",
          conclusion: "success",
          updated_at: new Date(now - 1000).toISOString(),
        },
      ],
    },
    "/actions/runs/42/attempts/1/jobs?per_page=100": {
      jobs: ["static", "chromium-shard-1", "chromium-shard-2", "webkit-shard-1", "webkit-shard-2"].map((name) => ({
        name,
        status: "completed",
        conclusion: "success",
      })),
    },
  };
}
const evaluate = (data, event = "push") =>
  findReusableCI({ event, sha, repository: "owner/repo", now, get: (path) => Promise.resolve(data[path]) });
const runsKey = `/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${source}&per_page=100`;
test("identical merge tree reuses recent complete same-repository PR evidence", async () => {
  assert.deepEqual(await evaluate(fixture()), { id: 42, sha: source, tree: "tree" });
});
test("PR events always run complete CI", async () => {
  assert.equal(await evaluate({}, "pull_request"), null);
});
test("changed trees, non-merge commits and missing evidence require full CI", async () => {
  for (const mutate of [
    (d) => {
      d[`/commits/${source}`].commit.tree.sha = "different";
    },
    (d) => {
      d[`/commits/${sha}`].parents.pop();
    },
    (d) => {
      delete d[runsKey];
    },
  ]) {
    const data = fixture();
    mutate(data);
    assert.equal(await evaluate(data), null);
  }
});
test("failed, cancelled, pending, stale, malformed and fork runs cannot authorize reuse", async () => {
  for (const patch of [
    { conclusion: "failure" },
    { conclusion: "cancelled" },
    { status: "in_progress" },
    { updated_at: new Date(now - 86_400_001).toISOString() },
    { updated_at: "invalid" },
    { head_sha: sha },
    { head_repository: { full_name: "fork/repo" } },
  ]) {
    const data = fixture();
    Object.assign(data[runsKey].workflow_runs[0], patch);
    assert.equal(await evaluate(data), null);
  }
});
test("a newer failed run overrides an older success", async () => {
  const data = fixture();
  data[runsKey].workflow_runs.push({ ...data[runsKey].workflow_runs[0], id: 43, conclusion: "failure" });
  assert.equal(await evaluate(data), null);
});
test("missing, skipped or failed test jobs require full CI", async () => {
  for (const conclusion of ["skipped", "failure", "cancelled"]) {
    const data = fixture();
    data["/actions/runs/42/attempts/1/jobs?per_page=100"].jobs[3].conclusion = conclusion;
    assert.equal(await evaluate(data), null);
  }
  const data = fixture();
  data["/actions/runs/42/attempts/1/jobs?per_page=100"].jobs.pop();
  assert.equal(await evaluate(data), null);
});
test("each browser shard is required for reuse", async () => {
  for (let index = 1; index < 5; index++) {
    const data = fixture();
    data["/actions/runs/42/attempts/1/jobs?per_page=100"].jobs.splice(index, 1);
    assert.equal(await evaluate(data), null);
  }
});
test("API failures fall back to full testing", async () => {
  assert.equal(
    await findReusableCI({
      event: "push",
      sha,
      repository: "owner/repo",
      get: () => {
        throw new Error("unavailable");
      },
    }),
    null,
  );
});
