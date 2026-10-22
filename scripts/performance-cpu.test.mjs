import assert from "node:assert/strict";
import test from "node:test";
import {
  calibrateCpu,
  calibrateCpuWithRetry,
  createCpuCalibration,
  validateCpuCalibration,
} from "./performance-cpu.mjs";

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
  let pageCount = 0;
  const page = async () => {
    const id = ++pageCount;
    let evaluated = false;
    commands.push(["open", id]);
    return {
      evaluate: async () => {
        assert.equal(evaluated, false, "each benchmark must use a fresh page");
        evaluated = true;
        const value = samples.shift();
        if (value instanceof Error) throw value;
        return value;
      },
      close: async () => commands.push(["close", id]),
      context: () => ({
        newCDPSession: async () => ({
          send: async (method, parameters) => commands.push([method, parameters]),
          detach: async () => commands.push(["detach"]),
        }),
      }),
    };
  };
  return { page, commands };
}

test("calibration verifies the applied slowdown against observed benchmark samples", async () => {
  for (const host of [2000, 4000]) {
    const { page, commands } = benchmarkPage([host, host, host, 990, 1000, 1010]);
    const calibration = await calibrateCpu(page);
    assert.deepEqual(calibration.effectiveSamples, [990, 1000, 1010]);
    assert.equal(commands.filter(([method]) => method === "open").length, 6);
    assert.equal(commands.filter(([method]) => method === "close").length, 6);
    assert.deepEqual(
      commands
        .filter(([method]) => method === "Emulation.setCPUThrottlingRate")
        .map(([, parameters]) => parameters.rate),
      [1, 1, 1, 1, 1, 1, host / 1000, 1, host / 1000, 1, host / 1000, 1],
    );
  }
});

test("wrong effective speed or failed measurement rejects calibration and releases throttling", async () => {
  for (const value of [1400, 600, NaN, undefined, new Error("Browser disconnected")]) {
    const { page, commands } = benchmarkPage([2500, 2500, 2500, value, 1000, 1000]);
    await assert.rejects(calibrateCpu(page));
    assert.deepEqual(commands.slice(-3, -1), [["Emulation.setCPUThrottlingRate", { rate: 1 }], ["detach"]]);
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

test("transient pre-audit instability retries with fresh samples and keeps all evidence", async () => {
  const { page, commands } = benchmarkPage([2500, 2500, 2500, 1400, 1400, 1400, 2000, 2000, 2000, 1000, 1000, 1000]);
  const evidence = [];
  const result = await calibrateCpuWithRetry(page, (stage, samples, attempt) =>
    evidence.push({ stage, samples, attempt }),
  );
  assert.equal(result.attempt, 2);
  assert.equal(result.cpuSlowdownMultiplier, 2);
  assert.deepEqual(
    evidence.map(({ stage, attempt }) => [stage, attempt]),
    [
      ["host", 1],
      ["effective", 1],
      ["host", 2],
      ["effective", 2],
    ],
  );
  assert.equal(commands.filter(([method]) => method === "detach").length, 12);
});

test("persistent instability stops after three attempts", async () => {
  const { page, commands } = benchmarkPage(
    Array.from({ length: 3 }, () => [2500, 2500, 2500, 1400, 1400, 1400]).flat(),
  );
  await assert.rejects(calibrateCpuWithRetry(page), /did not reproduce/);
  assert.equal(commands.filter(([method]) => method === "detach").length, 18);
});

test("invalid samples, slow hosts, browser errors and evidence write errors are not retried", async () => {
  for (const samples of [[900, 900, 900], [NaN, 2000, 2000], [new Error("Browser disconnected")]]) {
    const { page } = benchmarkPage(samples);
    const attempts = [];
    await assert.rejects(calibrateCpuWithRetry(page, (_stage, _samples, attempt) => attempts.push(attempt)));
    assert.ok(attempts.every((attempt) => attempt === 1));
  }
  const { page } = benchmarkPage([2000, 2000, 2000]);
  await assert.rejects(
    calibrateCpuWithRetry(page, () => {
      throw new Error("Disk full");
    }),
    /Disk full/,
  );
});

test("unstable host samples are retried before applying throttling", async () => {
  const { page } = benchmarkPage([2000, 4000, 4000, 2000, 2000, 2000, 1000, 1000, 1000]);
  assert.equal((await calibrateCpuWithRetry(page)).attempt, 2);
});

test("invalid effective samples stop immediately even when later samples could pass", async () => {
  const { page, commands } = benchmarkPage([2000, 2000, 2000, NaN, 1000, 1000, 2000, 2000, 2000, 1000, 1000, 1000]);
  await assert.rejects(calibrateCpuWithRetry(page), /valid effective/);
  assert.equal(commands.filter(([method]) => method === "detach").length, 6);
});

test("a failed CDP connection still closes the sample page", async () => {
  let closed = false;
  await assert.rejects(
    calibrateCpu(async () => ({
      context: () => ({
        newCDPSession: async () => {
          throw new Error("CDP unavailable");
        },
      }),
      close: async () => {
        closed = true;
      },
    })),
    /CDP unavailable/,
  );
  assert.equal(closed, true);
});

test("a failed throttle reset still detaches and closes the sample page", async () => {
  const cleanup = [];
  let calls = 0;
  await assert.rejects(
    calibrateCpu(async () => ({
      evaluate: async () => 2000,
      context: () => ({
        newCDPSession: async () => ({
          send: async () => {
            if (++calls === 2) throw new Error("Reset failed");
          },
          detach: async () => {
            cleanup.push("detach");
          },
        }),
      }),
      close: async () => {
        cleanup.push("close");
      },
    })),
    /Reset failed/,
  );
  assert.deepEqual(cleanup, ["detach", "close"]);
});
