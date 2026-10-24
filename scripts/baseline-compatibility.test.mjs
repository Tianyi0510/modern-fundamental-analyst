import assert from "node:assert/strict";
import test from "node:test";
import { analyzeBaselineTrace, baselineMarkdown } from "./baseline-compatibility.mjs";

const event = (feature, url = "https://example.com/app.js") => ({
  cat: "blink.webdx_feature_usage",
  args: { feature, url, lineNumber: 2, columnNumber: 4 },
});

test("classifies observed features with pinned Lighthouse data and preserves unknown features", () => {
  const result = analyzeBaselineTrace(
    { traceEvents: [event("grid"), event("text-wrap-pretty"), event("unmapped-feature")] },
    new Date("2026-10-23"),
  );
  assert.equal(result.features.find((f) => f.id === "grid").status, "high");
  assert.equal(result.features.find((f) => f.id === "text-wrap-pretty").status, "limited");
  assert.equal(result.features.find((f) => f.id === "unmapped-feature").status, "unknown");
  assert.equal(result.status, "review-required");
});

test("keeps application and instrumentation occurrences of the same feature", () => {
  const result = analyzeBaselineTrace({
    traceEvents: [event("scheduler", "_lighthouse-eval.js"), event("scheduler"), event("scheduler")],
  });
  assert.equal(result.features.length, 1);
  assert.equal(result.features[0].sources.length, 2);
  assert.equal(result.features[0].sources[1].line, 2);
  assert.equal(result.status, "review-required");
});

test("missing, empty or malformed feature evidence fails instead of reporting compatibility", () => {
  for (const trace of [
    null,
    {},
    { traceEvents: [] },
    { traceEvents: [{ cat: "blink.webdx_feature_usage", args: {} }] },
  ]) {
    assert.throws(() => analyzeBaselineTrace(trace));
  }
});

test("widely available observations do not certify the whole application", () => {
  const result = analyzeBaselineTrace({ traceEvents: [event("grid")] });
  assert.equal(result.status, "only-widely-available-features-observed");
  const markdown = baselineMarkdown({
    status: result.status,
    dataDate: "2026-09-17",
    analyzedAt: "2026-10-23",
    samples: [{ route: "/", ...result }],
    errors: [],
  });
  assert.match(markdown, /does not certify/);
  assert.match(markdown, /grid/);
});

for (const id of [
  "event-timing",
  "fetch-priority",
  "largest-contentful-paint",
  "registered-custom-properties",
  "relative-color",
  "scrollbar-width",
  "scrollend",
  "text-wrap",
  "text-wrap-balance",
]) {
  test(`${id} alone requires review when Newly available`, () => {
    const result = analyzeBaselineTrace({ traceEvents: [event(id)] }, new Date("2026-10-24"));
    assert.equal(result.features[0].status, "low");
    assert.equal(result.status, "review-required");
    assert.equal(result.features[0].sources[0].url, "https://example.com/app.js");
  });
}
