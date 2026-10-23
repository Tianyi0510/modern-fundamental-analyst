import { cpus, platform, arch, release, totalmem } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Explicit allowlist: never serialize the process environment or provider configuration.
export function performanceEnvironment(env = process.env) {
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
    commit: env.GITHUB_SHA ?? null,
    workflowRun: env.GITHUB_RUN_ID ?? null,
  };
}
