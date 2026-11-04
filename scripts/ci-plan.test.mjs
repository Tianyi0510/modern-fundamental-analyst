import assert from "node:assert/strict";
import test from "node:test";
import { findReusableCI } from "./ci-plan.mjs";

const sha = "a".repeat(40);
const source = "b".repeat(40);
const now = Date.parse("2026-10-02T12:00:00Z");
function fixture() {
  return {
    [`/git/commits/${sha}`]: { parents: [{ sha: "c".repeat(40) }, { sha: source }], tree: { sha: "tree" } },
    [`/git/commits/${source}`]: { tree: { sha: "tree" } },
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
      jobs: ["static", "chromium-shard-1", "chromium-shard-2", "webkit-shard-1", "webkit-shard-2", "performance"].map(
        (name) => ({
          name,
          status: "completed",
          conclusion: "success",
        }),
      ),
    },
  };
}
const evaluate = (data, event = "push") =>
  findReusableCI({ event, sha, repository: "owner/repo", now, get: (path) => Promise.resolve(data[path]) });
const runsKey = `/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${source}&per_page=100`;
test("identical merge tree reuses evidence using Git commit metadata without fetching file diffs", async () => {
  const data = fixture();
  const paths = [];
  const evidence = await findReusableCI({
    event: "push",
    sha,
    repository: "owner/repo",
    now,
    get: async (path) => {
      paths.push(path);
      assert.ok(Object.hasOwn(data, path), `Unexpected endpoint: ${path}`);
      return data[path];
    },
  });
  assert.deepEqual(evidence, { id: 42, sha: source, tree: "tree" });
  assert.deepEqual(paths, [
    `/git/commits/${sha}`,
    `/git/commits/${source}`,
    runsKey,
    "/actions/runs/42/attempts/1/jobs?per_page=100",
  ]);
});
test("PR events always run complete CI", async () => {
  assert.equal(await evaluate({}, "pull_request"), null);
});
test("changed trees, non-merge commits and missing evidence require full CI", async () => {
  for (const mutate of [
    (d) => {
      d[`/git/commits/${source}`].tree.sha = "different";
    },
    (d) => {
      d[`/git/commits/${sha}`].parents.pop();
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

test("performance evidence is required for reuse", async () => {
  for (const conclusion of ["failure", "skipped", "cancelled"]) {
    const data = fixture();
    data["/actions/runs/42/attempts/1/jobs?per_page=100"].jobs.find((job) => job.name === "performance").conclusion =
      conclusion;
    assert.equal(await evaluate(data), null);
  }
});

test("missing commit parents or either tree requires full CI", async () => {
  for (const mutate of [
    (data) => {
      delete data[`/git/commits/${sha}`].parents;
    },
    (data) => {
      data[`/git/commits/${sha}`].parents[1] = null;
    },
    (data) => {
      delete data[`/git/commits/${sha}`].tree;
    },
    (data) => {
      delete data[`/git/commits/${source}`].tree;
    },
    (data) => {
      data[`/git/commits/${sha}`].tree.sha = "";
    },
  ]) {
    const data = fixture();
    mutate(data);
    assert.equal(await evaluate(data), null);
  }
});

test("reuse expires after 24 hours and rejects future timestamps", async () => {
  for (const [age, reusable] of [
    [0, true],
    [86_400_000, true],
    [86_400_001, false],
    [-1, false],
  ]) {
    const data = fixture();
    data[runsKey].workflow_runs[0].updated_at = new Date(now - age).toISOString();
    assert.equal(Boolean(await evaluate(data)), reusable, `Evidence age: ${age}`);
  }
});

test("only the latest run attempt can provide all six successful jobs", async () => {
  const data = fixture();
  data[runsKey].workflow_runs[0].run_attempt = 2;
  data["/actions/runs/42/attempts/2/jobs?per_page=100"] = structuredClone(
    data["/actions/runs/42/attempts/1/jobs?per_page=100"],
  );
  assert.deepEqual(await evaluate(data), { id: 42, sha: source, tree: "tree" });
  data["/actions/runs/42/attempts/2/jobs?per_page=100"].jobs.pop();
  assert.equal(await evaluate(data), null);
});
