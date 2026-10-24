import { cpus, platform, arch, release, totalmem } from "node:os";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);

// Explicit allowlist: never serialize the process environment or provider configuration.
export function performanceEnvironment(env = process.env, cwd = new URL("../", import.meta.url)) {
  const commit = execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const processors = cpus();
  return {
    platform: platform(),
    architecture: arch(),
    osRelease: release(),
    cpuModels: [...new Set(processors.map(({ model }) => model))],
    logicalCpus: processors.length,
    memoryBytes: totalmem(),
    nodeVersion: process.version,
    lighthouseVersion: require("lighthouse/package.json").version,
    playwrightVersion: require("@playwright/test/package.json").version,
    runnerImage: env.ImageOS ?? null,
    runnerImageVersion: env.ImageVersion ?? null,
    commit,
    eventCommit: env.GITHUB_SHA ?? null,
    workflowRun: env.GITHUB_RUN_ID ?? null,
  };
}
