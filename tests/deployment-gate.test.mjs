import assert from "node:assert/strict";
import test from "node:test";
import { requireSuccessfulCI } from "../scripts/require-ci.mjs";

const sha = "a".repeat(40);
const env = { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: sha };
const run = { id: 1, head_sha: sha, head_branch: "main", event: "push", status: "completed", conclusion: "success" };
test("production gate requires successful CI for the exact commit", async () => {
  let clock = 0, calls = 0;
  await requireSuccessfulCI({ env, now: () => clock, sleep: async ms => { clock += ms; }, fetcher: async () => {
    calls++;
    return Response.json({ workflow_runs: calls === 1 ? [{ ...run, head_sha: "b".repeat(40) }] : [run] });
  } });
  assert.equal(calls, 2);
});
test("production gate fails closed on failed CI, missing SHA, API errors and timeout", async () => {
  await assert.rejects(requireSuccessfulCI({ env: { VERCEL_ENV: "production" } }), /exact Git commit/);
  await assert.rejects(requireSuccessfulCI({ env, fetcher: async () => Response.json({ workflow_runs: [{ ...run, conclusion: "failure" }] }) }), /blocked/);
  await assert.rejects(requireSuccessfulCI({ env, fetcher: async () => new Response(null, { status: 403 }) }), /403/);
  let clock = 0;
  await assert.rejects(requireSuccessfulCI({ env, now: () => clock, sleep: async ms => { clock += ms; }, fetcher: async () => Response.json({ workflow_runs: [] }) }), /10 minutes/);
});
test("preview and local builds do not require production CI", async () => {
  await requireSuccessfulCI({ env: {}, fetcher: () => assert.fail("must not fetch") });
});
