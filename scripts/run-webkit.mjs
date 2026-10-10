import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));

// Keep separate processes and output directories, even when a test shard fails.
export function runWebKit({ args = [], env = process.env, spawn = spawnSync } = {}) {
  const selected = args.filter((arg) => arg.startsWith("--shard="));
  if (args.includes("--shard") || selected.length > 1 || selected.some((arg) => !/^--shard=[12]$/.test(arg))) {
    throw new Error("Use --shard=1 or --shard=2, or omit it to run both.");
  }
  const forwarded = args.filter((arg) => !arg.startsWith("--shard="));
  // These settings are owned by this runner; overrides could omit coverage or overwrite evidence.
  if (
    forwarded.some(
      (arg) =>
        /^--(?:project|workers|fully-parallel|output|config|grep|test-list|test-list-invert)(?:=|$)/.test(arg) ||
        arg === "-c" ||
        arg.startsWith("-g"),
    )
  ) {
    throw new Error("WebKit mobile selection, project, workers, configuration and output are managed by this runner.");
  }
  const shards = selected.length ? [selected[0].slice(-1)] : ["1", "2"];
  let failed = false;
  for (const shard of shards) {
    const result = spawn(
      process.execPath,
      [
        require.resolve("@playwright/test/cli"),
        "test",
        ...forwarded,
        "--project=webkit",
        "--workers=1",
        `${shard === "1" ? "--test-list" : "--test-list-invert"}=scripts/webkit-shard-1.txt`,
      ],
      {
        cwd: root,
        env: {
          ...env,
          PLAYWRIGHT_USE_PRODUCTION_BUILD: "1",
          PLAYWRIGHT_SHARD: shard,
          PLAYWRIGHT_JSON_OUTPUT_NAME: `node_modules/.cache/playwright/reports/webkit-shard-${shard}.json`,
        },
        stdio: "inherit",
      },
    );
    if (result.error) throw result.error;
    if (result.signal) return result.signal === "SIGINT" ? 130 : 143;
    if (result.status !== 0) failed = true;
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runWebKit({ args: process.argv.slice(2) });
}
