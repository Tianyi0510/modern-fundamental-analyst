import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const workflow = parse(await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"));

test("performance failures retain raw Lighthouse reports and native audit results", () => {
  assert.equal(workflow.jobs.performance["runs-on"], "ubuntu-24.04");
  const steps = workflow.jobs.performance.steps;
  const performance = steps.findIndex((step) => step.run === "npm run test:performance");
  const uploadIndex = steps.findIndex((step) => step.uses?.startsWith("actions/upload-artifact@"));
  assert.ok(performance >= 0 && uploadIndex > performance);
  assert.equal(steps[performance]["continue-on-error"], undefined);
  const upload = steps[uploadIndex];
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

test("checkout credentials are not retained for repository scripts", () => {
  const checkouts = Object.values(workflow.jobs).flatMap((job) =>
    (job.steps ?? []).filter((step) => step.uses?.startsWith("actions/checkout@")),
  );
  assert.ok(checkouts.length > 0);
  for (const step of checkouts) assert.equal(step.with?.["persist-credentials"], false);
});

test("aggregate gates fail closed for unsuccessful planner and required jobs", () => {
  for (const [name, dependencies] of [
    ["verify", ["STATIC", "CHROMIUM", "PERFORMANCE"]],
    ["webkit", ["WEBKIT"]],
  ]) {
    const step = workflow.jobs[name].steps[0];
    assert.equal(step.shell, "bash");
    const success = Object.fromEntries(dependencies.map((key) => [key, "success"]));
    const run = (overrides) => {
      const result = spawnSync("bash", ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", step.run], {
        env: { PATH: process.env.PATH, PLAN: "success", REUSE: "false", ...success, ...overrides },
        encoding: "utf8",
      });
      assert.ifError(result.error);
      return result.status;
    };
    assert.equal(run({}), 0, name);
    assert.equal(run({ REUSE: "true", ...Object.fromEntries(dependencies.map((key) => [key, "skipped"])) }), 0);
    for (const state of ["failure", "cancelled", "skipped", ""]) {
      for (const reuse of ["true", "false", ""]) {
        assert.notEqual(run({ PLAN: state, REUSE: reuse }), 0, `${name}: planner ${state}, reuse ${reuse}`);
      }
      for (const dependency of dependencies) {
        for (const reuse of ["false", ""]) {
          assert.notEqual(run({ [dependency]: state, REUSE: reuse }), 0, `${name}: ${dependency} ${state}`);
        }
      }
    }
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
