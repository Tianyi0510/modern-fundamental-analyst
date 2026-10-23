import assert from "node:assert/strict";
import test from "node:test";
import { performanceEnvironment } from "./performance-environment.mjs";

test("performance evidence identifies the host and tools without exposing provider configuration", () => {
  const evidence = performanceEnvironment({
    GITHUB_SHA: "release-sha",
    GITHUB_RUN_ID: "run-id",
    ImageOS: "ubuntu24",
    ImageVersion: "image-version",
    SENTRY_AUTH_TOKEN: "private-token",
    NEXT_PUBLIC_SENTRY_DSN: "private-dsn",
  });
  assert.equal(evidence.commit, "release-sha");
  assert.equal(evidence.workflowRun, "run-id");
  assert.equal(evidence.runnerImage, "ubuntu24");
  assert.equal(evidence.architecture, process.arch);
  assert.equal(evidence.platform, process.platform);
  assert.ok(evidence.cpuModels.length > 0);
  assert.ok(evidence.logicalCpus > 0);
  assert.ok(evidence.memoryBytes > 0);
  assert.match(evidence.lighthouseVersion, /^\d+\./);
  assert.match(evidence.playwrightVersion, /^\d+\./);
  assert.doesNotMatch(JSON.stringify(evidence), /private-|SENTRY/);
  assert.equal(performanceEnvironment({}).workflowRun, null);
});
