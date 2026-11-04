import assert from "node:assert/strict";
import test from "node:test";
import config, {
  performanceOrigin,
  preparationUrl,
  validatePreparationResponse,
  validateNavigationTrace,
} from "./performance-navigation.mjs";

const target = `${performanceOrigin}/performance`;
function trace() {
  return {
    traceEvents: [
      {
        name: "TracingStartedInBrowser",
        args: { data: { frames: [{ frame: "main", processId: 42, isOutermostMainFrame: true, url: preparationUrl }] } },
      },
      { name: "FrameCommittedInBrowser", args: { data: { frame: "main", processId: 42, url: target } } },
      { name: "navigationStart", pid: 42, args: { frame: "main", data: { documentLoaderURL: target } } },
    ],
  };
}

test("preparation retains Lighthouse defaults and cold storage reset", () => {
  assert.deepEqual(config, {
    extends: "lighthouse:default",
    settings: { blankPage: preparationUrl, disableStorageReset: false, onlyAudits: ["baseline"] },
  });
});

test("rejects redirects, HTML, errors and mismatched opener policy before auditing", () => {
  const response = (overrides = {}) => ({
    status: 200,
    url: preparationUrl,
    headers: new Headers({ "content-type": "text/plain; charset=utf-8", "cross-origin-opener-policy": "same-origin" }),
    ...overrides,
  });
  validatePreparationResponse(response());
  for (const change of [
    { status: 404 },
    { url: target },
    { headers: new Headers({ "content-type": "text/html", "cross-origin-opener-policy": "same-origin" }) },
    { headers: new Headers({ "content-type": "text/plain" }) },
  ])
    assert.throws(() => validatePreparationResponse(response(change)));
});

test("accepts a complete measured navigation in the prepared renderer", () => {
  validateNavigationTrace(trace(), target);
});

test("rejects the CI failure signature: committed document but only unrelated navigation events", () => {
  const failed = trace();
  failed.traceEvents[2].args.frame = "iframe";
  assert.throws(() => validateNavigationTrace(failed, target), /navigationStart/);
});

test("renderer swaps, missing evidence and wrong URLs fail closed", () => {
  const swapped = trace();
  swapped.traceEvents[1].args.data.processId = 99;
  assert.throws(() => validateNavigationTrace(swapped, target), /changed renderer/);
  assert.throws(() => validateNavigationTrace({}, target), /Missing prepared/);
  assert.throws(() => validateNavigationTrace(trace(), `${performanceOrigin}/`), /changed renderer/);
  const wrongProcess = trace();
  wrongProcess.traceEvents[2].pid = 99;
  assert.throws(() => validateNavigationTrace(wrongProcess, target), /navigationStart/);
});

// Resolve the installed Lighthouse configuration, without starting a browser.
test("performance selection includes the native Baseline audit without unrelated audits", async () => {
  const { initializeConfig } = await import("lighthouse/core/config/config.js");
  const flags = { onlyCategories: ["performance"] };
  const { resolvedConfig } = await initializeConfig("navigation", config, flags);
  const { resolvedConfig: performanceOnly } = await initializeConfig("navigation", undefined, flags);
  const ids = (value) => value.audits.map((audit) => audit.implementation.meta.id).sort();
  assert.deepEqual(ids(resolvedConfig), [...ids(performanceOnly), "baseline"].sort());
  assert.ok(resolvedConfig.audits.find((audit) => audit.implementation.meta.id === "baseline"));
});
