import assert from "node:assert/strict";
import test from "node:test";
import { createCpuCalibration, validateCpuCalibration } from "./performance-cpu.mjs";

test("CPU slowdown targets the same reference on faster and slower hosts", () => {
  for (const host of [2000, 4000, 8000]) {
    const calibration = createCpuCalibration([host * 0.99, host, host * 1.01]);
    assert.equal(host / calibration.cpuSlowdownMultiplier, 1000);
  }
  assert.equal(createCpuCalibration([4193.25, 4193.25, 4193.25]).cpuSlowdownMultiplier, 4.19325);
});

test("missing, weak and unstable calibration fails closed", () => {
  for (const samples of [[], [2000, 2000], [NaN, 2000, 2000], [0, 2000, 2000], [900, 900, 900], [2000, 3000, 3000]]) {
    assert.throws(() => createCpuCalibration(samples));
  }
});

test("each report must prove stable host performance and the actual applied slowdown", () => {
  const calibration = createCpuCalibration([2500, 2500, 2500]);
  const report = {
    environment: { benchmarkIndex: 2450 },
    configSettings: { throttlingMethod: "devtools", throttling: { cpuSlowdownMultiplier: 2.5 } },
  };
  assert.doesNotThrow(() => validateCpuCalibration(report, calibration));
  for (const benchmarkIndex of [undefined, NaN, 0, 1800, 3000]) {
    assert.throws(() => validateCpuCalibration({ ...report, environment: { benchmarkIndex } }, calibration));
  }
  for (const configSettings of [
    undefined,
    { throttlingMethod: "simulate" },
    { ...report.configSettings, throttling: { cpuSlowdownMultiplier: 4 } },
  ]) {
    assert.throws(() => validateCpuCalibration({ ...report, configSettings }, calibration));
  }
});
