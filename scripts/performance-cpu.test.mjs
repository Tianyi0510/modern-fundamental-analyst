import assert from "node:assert/strict";
import test from "node:test";
import { calibrateCpu, createCpuCalibration, validateCpuCalibration } from "./performance-cpu.mjs";

test("CPU slowdown targets the same reference on faster and slower hosts", () => {
  for (const host of [2000, 4000, 8000]) {
    const calibration = createCpuCalibration([host * 0.99, host, host * 1.01]);
    assert.equal(host / calibration.cpuSlowdownMultiplier, 1000);
  }
  assert.equal(createCpuCalibration([4193.25, 4193.25, 4193.25]).cpuSlowdownMultiplier, 4.19325);
  assert.equal(createCpuCalibration([1000, 1000, 1000]).cpuSlowdownMultiplier, 1);
});

function benchmarkPage(samples) {
  const commands = [];
  const page = {
    evaluate: async () => {
      const value = samples.shift();
      if (value instanceof Error) throw value;
      return value;
    },
    context: () => ({
      newCDPSession: async () => ({
        send: async (method, parameters) => commands.push([method, parameters]),
        detach: async () => commands.push(["detach"]),
      }),
    }),
  };
  return { page, commands };
}

test("calibration verifies the applied slowdown against observed benchmark samples", async () => {
  for (const host of [2000, 4000]) {
    const { page, commands } = benchmarkPage([host, host, host, 990, 1000, 1010]);
    const calibration = await calibrateCpu(page);
    assert.deepEqual(calibration.effectiveSamples, [990, 1000, 1010]);
    assert.deepEqual(commands, [
      ["Emulation.setCPUThrottlingRate", { rate: host / 1000 }],
      ["Emulation.setCPUThrottlingRate", { rate: 1 }],
      ["detach"],
    ]);
  }
});

test("wrong effective speed or failed measurement rejects calibration and releases throttling", async () => {
  for (const value of [1400, 600, NaN, undefined, new Error("Browser disconnected")]) {
    const { page, commands } = benchmarkPage([2500, 2500, 2500, value, 1000, 1000]);
    await assert.rejects(calibrateCpu(page));
    assert.deepEqual(commands.slice(-2), [["Emulation.setCPUThrottlingRate", { rate: 1 }], ["detach"]]);
  }
});

test("raw benchmark evidence is recorded before rejecting invalid calibration", async () => {
  for (const samples of [
    [900, 900, 900],
    [2500, 2500, 2500, 1400, 1000, 1000],
  ]) {
    const recorded = [];
    const { page } = benchmarkPage([...samples]);
    await assert.rejects(calibrateCpu(page, (stage, values) => recorded.push([stage, values])));
    assert.deepEqual(recorded[0], ["host", samples.slice(0, 3)]);
    if (samples.length === 6) assert.deepEqual(recorded[1], ["effective", samples.slice(3)]);
  }
});

test("the 15% drift allowance includes both exact endpoints", async () => {
  assert.doesNotThrow(() => createCpuCalibration([1700, 2000, 2300]));
  assert.throws(() => createCpuCalibration([1699.99, 2000, 2300]));
  const { page } = benchmarkPage([2000, 2000, 2000, 850, 1000, 1150]);
  await assert.doesNotReject(calibrateCpu(page));
  const calibration = createCpuCalibration([2000, 2000, 2000]);
  for (const benchmarkIndex of [1700, 2300]) {
    assert.doesNotThrow(() =>
      validateCpuCalibration(
        {
          environment: { benchmarkIndex },
          configSettings: { throttlingMethod: "devtools", throttling: { cpuSlowdownMultiplier: 2 } },
        },
        calibration,
      ),
    );
  }
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
