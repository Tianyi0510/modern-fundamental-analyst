import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));

function inventory(project, args = []) {
  const result = spawnSync(
    process.execPath,
    [require.resolve("@playwright/test/cli"), "test", `--project=${project}`, "--list", "--reporter=json", ...args],
    {
      cwd: root,
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: "", PLAYWRIGHT_JSON_OUTPUT_FILE: "" },
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.errors, []);
  const ids = [];
  function visit(suite) {
    for (const spec of suite.specs ?? []) ids.push(spec.id);
    for (const child of suite.suites ?? []) visit(child);
  }
  for (const suite of report.suites) visit(suite);
  return ids.sort();
}

for (const project of ["chromium", "webkit"]) {
  test(`${project} shards cover the full discovered suite exactly once`, () => {
    const all = inventory(project);
    const shards = [1, 2].map((shard) =>
      inventory(project, [
        ...(project === "chromium" ? ["--fully-parallel"] : []),
        `${shard === 1 ? "--test-list" : "--test-list-invert"}=scripts/${project}-shard-1.txt`,
      ]),
    );
    for (const shard of shards) assert.ok(shard.length > 0);
    const combined = shards.flat().sort();
    assert.equal(new Set(combined).size, combined.length, "shards must not overlap");
    assert.deepEqual(combined, all, "shards must not omit any discovered tests");
  });
}

for (const project of ["chromium", "webkit"]) {
  test(`${project} shard list contains unique existing files`, () => {
    const selected = readFileSync(new URL(`./${project}-shard-1.txt`, import.meta.url), "utf8")
      .trim()
      .split("\n");
    assert.equal(new Set(selected).size, selected.length, "list must not duplicate files");
    for (const file of selected) assert.ok(existsSync(`${root}src/${file}`), `stale shard entry: ${file}`);
  });
}
