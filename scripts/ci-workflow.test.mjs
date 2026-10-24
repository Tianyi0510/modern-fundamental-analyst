import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const workflow = parse(await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"));

test("Baseline analyzes evidence after budget failures and retains its reports", () => {
  const steps = workflow.jobs.performance.steps;
  const performance = steps.findIndex((step) => step.id === "performance");
  const compatibility = steps.findIndex((step) => step.run === "npm run test:compatibility");
  assert.ok(compatibility > performance && performance >= 0);
  assert.equal(steps[compatibility].if, "${{ !cancelled() && steps.performance.outcome != 'skipped' }}");
  assert.equal(steps[compatibility]["continue-on-error"], undefined);
  const upload = steps.find((step) => step.uses?.startsWith("actions/upload-artifact@"));
  assert.equal(upload.if, "always()");
  assert.equal(upload.with.path, "node_modules/.cache/performance/");
});

test("protected branch check names retain all release verification dependencies", () => {
  for (const name of ["verify", "webkit"]) {
    const job = workflow.jobs[name];
    assert.equal(job.name ?? name, name);
    assert.equal(job.if, "always()");
  }
  assert.deepEqual(workflow.jobs.verify.needs, ["plan", "static", "chromium", "performance"]);
  assert.deepEqual(workflow.jobs.webkit.needs, ["plan", "webkit-shards"]);
});

test("remote CI actions use immutable full commit references", () => {
  const references = Object.values(workflow.jobs).flatMap((job) => [
    ...(job.uses ? [job.uses] : []),
    ...(job.steps ?? []).flatMap((step) => (step.uses ? [step.uses] : [])),
  ]);
  assert.ok(references.length > 0);
  for (const reference of references) {
    if (reference.startsWith("./")) continue;
    assert.match(reference, /^[\w.-]+\/[\w./-]+@[a-f0-9]{40}$/, reference);
  }
});

test("only the evidence planner receives Actions API permission", () => {
  assert.deepEqual(workflow.permissions, { contents: "read" });
  for (const [name, job] of Object.entries(workflow.jobs)) {
    // A job permission map replaces, rather than merges with, workflow permissions.
    const effective = job.permissions ?? workflow.permissions;
    assert.deepEqual(effective, name === "plan" ? { contents: "read", actions: "read" } : { contents: "read" }, name);
  }
  assert.equal(workflow.jobs.plan.steps.find((step) => step.id === "plan").env.GH_TOKEN, "${{ github.token }}");
});

test("Chromium CI uses complementary timing-based file lists without changing parallel mode", () => {
  const job = Object.values(workflow.jobs).find((job) => job.name === "chromium-shard-${{ matrix.shard }}");
  assert.deepEqual(job.strategy.matrix.shard, [1, 2]);
  assert.equal(job.strategy["fail-fast"], false);
  assert.equal(
    job.steps.find((step) => step.name === "Verify Chromium").run,
    "npm run test:computed-style:production -- --fully-parallel ${{ matrix.shard == 1 && '--test-list' || '--test-list-invert' }}=scripts/chromium-shard-1.txt",
  );
});
