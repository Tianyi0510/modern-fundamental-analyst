import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "yaml";

const workflow = parse(await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"));

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
