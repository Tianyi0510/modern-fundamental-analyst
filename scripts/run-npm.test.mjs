import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { npmEnvironment } from "./run-npm.mjs";

test("normalizes legacy cache variables without mutating the source or other settings", () => {
  const source = { NPM_CONFIG_CACHE_DIR: "/cache with spaces", CI: "1" };
  assert.deepEqual(npmEnvironment(source), { npm_config_cache: "/cache with spaces", CI: "1" });
  assert.equal(source.NPM_CONFIG_CACHE_DIR, "/cache with spaces");
  assert.deepEqual(npmEnvironment({ ...source, npm_config_cache_dir: "/other", NPM_CONFIG_CACHE: "/explicit" }), {
    NPM_CONFIG_CACHE: "/explicit",
    CI: "1",
  });
  assert.deepEqual(npmEnvironment({ npm_config_cache_dir: "" }), {});
});

test("forwards arguments and the pinned npm version, sanitizes the child environment and preserves failure", () => {
  const directory = mkdtempSync(join(tmpdir(), "npm-wrapper-"));
  try {
    writeFileSync(
      join(directory, "npx"),
      `#!/bin/sh\nprintf '%s\\n' "$@" "$npm_config_cache"\nif [ -n "$NPM_CONFIG_CACHE_DIR" ]; then exit 99; fi\nexit 7\n`,
      { mode: 0o755 },
    );
    const result = spawnSync(process.execPath, ["scripts/run-npm.mjs", "run", "build"], {
      encoding: "utf8",
      env: { ...process.env, PATH: directory, NPM_CONFIG_CACHE_DIR: "/legacy" },
    });
    assert.equal(result.status, 7);
    assert.match(result.stdout, /^--yes\nnpm@12\.2\.1\nrun\nbuild\n/);
    assert.doesNotMatch(result.stderr, /Unknown env config/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Vercel normalizes npm for both commands and keeps CI ahead of the production build", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.installCommand, "node scripts/run-npm.mjs ci");
  assert.equal(config.buildCommand, "node scripts/require-ci.mjs && node scripts/run-npm.mjs run build");
});
