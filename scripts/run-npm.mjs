import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Vercel builds can inherit an unsupported cache-dir setting. Keep an explicit
// npm cache setting; otherwise translate the legacy path before starting npm.
export function npmEnvironment(source) {
  const env = { ...source };
  const legacy = Object.keys(env).filter((key) => key.toLowerCase() === "npm_config_cache_dir");
  if (!Object.keys(env).some((key) => key.toLowerCase() === "npm_config_cache")) {
    const path = legacy.map((key) => env[key]).find(Boolean);
    if (path) env.npm_config_cache = path;
  }
  for (const key of legacy) delete env[key];
  return env;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { packageManager } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  if (!/^npm@\d+\.\d+\.\d+$/.test(packageManager)) throw new Error("An exact npm version is required.");
  const result = spawnSync("npx", ["--yes", packageManager, ...process.argv.slice(2)], {
    env: npmEnvironment(process.env),
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
