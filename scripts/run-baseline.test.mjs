import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { checkBaseline } from "./run-baseline.mjs";
import { performanceRoutes } from "./performance-budgets.mjs";
const require = createRequire(import.meta.url);
const lighthouseVersion = require("lighthouse/package.json").version;

async function fixture(t, feature = "text-wrap-pretty") {
  const dir = await mkdtemp(join(tmpdir(), "baseline-evidence-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const json = (name, data) => writeFile(join(dir, name), JSON.stringify(data));
  await json("environment.json", { commit: "tested-commit", lighthouseVersion });
  for (const [index, route] of performanceRoutes.entries()) {
    for (let sample = 1; sample <= 3; sample++) {
      await json(`route-${index}-${sample}.json`, {
        lighthouseVersion,
        finalDisplayedUrl: `http://127.0.0.1:3211${route.path}`,
      });
      await json(`route-${index}-${sample}-0.trace.json`, {
        traceEvents: [{ cat: "blink.webdx_feature_usage", args: { feature } }],
      });
    }
  }
  return { dir, json };
}

test("all twelve samples produce reviewable evidence and a CI summary without claiming a compatibility pass", async (t) => {
  const { dir } = await fixture(t);
  const summary = join(dir, "summary.md");
  const result = await checkBaseline(dir, summary);
  assert.equal(result.samples.length, 12);
  assert.equal(result.status, "review-required");
  assert.equal(result.environment.commit, "tested-commit");
  assert.match(result.dataDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(await readFile(summary, "utf8"), /review-required/);
});

test("one missing trace fails and replaces a stale successful report with incomplete evidence", async (t) => {
  const { dir, json } = await fixture(t);
  await json("baseline.json", { status: "only-widely-available-features-observed" });
  await rm(join(dir, "route-2-2-0.trace.json"));
  await assert.rejects(checkBaseline(dir, null), /route-2-2/);
  const report = JSON.parse(await readFile(join(dir, "baseline.json"), "utf8"));
  assert.equal(report.status, "incomplete");
  assert.equal(report.samples.length, 11);
});

test("wrong route and mismatched tool versions cannot be accepted as current evidence", async (t) => {
  const { dir, json } = await fixture(t);
  await json("route-0-1.json", { lighthouseVersion, finalDisplayedUrl: "https://example.com/" });
  await assert.rejects(checkBaseline(dir, null), /Invalid route/);
  await json("environment.json", { commit: "tested-commit", lighthouseVersion: "0.0.0" });
  await assert.rejects(checkBaseline(dir, null), /mismatched Lighthouse/);
});

test("Newly available observations require review in the JSON report and CI summary", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-24") });
  const { dir } = await fixture(t, "text-wrap-balance");
  const summary = join(dir, "summary.md");
  const result = await checkBaseline(dir, summary);
  assert.equal(result.status, "review-required");
  assert.ok(result.samples.every((sample) => sample.features[0].status === "low"));
  const saved = JSON.parse(await readFile(join(dir, "baseline.json"), "utf8"));
  assert.equal(saved.status, "review-required");
  const markdown = await readFile(summary, "utf8");
  assert.match(markdown, /Status: review-required/);
  assert.match(markdown, /Newly available, Limited and unknown features require/);
});

test("only Widely available samples receive the observation-only success status", async (t) => {
  const { dir } = await fixture(t, "grid");
  const result = await checkBaseline(dir, null);
  assert.equal(result.status, "only-widely-available-features-observed");
});
