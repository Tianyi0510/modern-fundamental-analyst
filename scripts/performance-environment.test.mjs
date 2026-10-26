import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  assert.equal(evidence.commit, execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
  assert.equal(evidence.eventCommit, "release-sha");
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

test("performance evidence records a detached PR checkout separately from the event merge commit", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "performance-revision-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init");
  git(
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--allow-empty",
    "--no-gpg-sign",
    "-m",
    "PR head",
  );
  const head = git("rev-parse", "HEAD");
  git("checkout", "--detach", head);
  const evidence = performanceEnvironment({ GITHUB_SHA: "synthetic-merge-sha" }, cwd);
  assert.equal(evidence.commit, head);
  assert.equal(evidence.eventCommit, "synthetic-merge-sha");
  const local = performanceEnvironment({}, cwd);
  assert.equal(local.commit, head);
  assert.equal(local.eventCommit, null);
});

test("performance evidence fails when checkout identity is unavailable instead of substituting the event SHA", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "performance-no-repository-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  assert.throws(() => performanceEnvironment({ GITHUB_SHA: "event-sha" }, cwd));
});
