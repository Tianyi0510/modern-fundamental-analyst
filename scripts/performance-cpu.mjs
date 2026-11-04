import { pageFunctions } from "lighthouse/core/lib/page-functions.js";

// PR #85, attempt 2, artifact 12030638016 had a median host index of 4193.25 at 4x slowdown.
// Target 1000 is slightly slower than that reference's effective index of 1048.31.
const targetBenchmarkIndex = 1000;
const maximumDrift = 0.15;
const targetPrecision = 0.05;
const maximumCorrections = 2;

class CpuCalibrationInstability extends Error {}

function withinDrift(value, reference) {
  return Number.isFinite(value) && Math.abs(value - reference) <= reference * maximumDrift;
}

export async function calibrateCpu(openPage, recordSamples = async () => {}) {
  const sample = async (rate = 1) => {
    const samples = [];
    for (let index = 0; index < 3; index++) {
      // Lighthouse benchmarks a fresh document, not a warmed calibration page.
      const page = await openPage();
      let session;
      try {
        session = await page.context().newCDPSession(page);
        await session.send("Emulation.setCPUThrottlingRate", { rate });
        samples.push(await page.evaluate(pageFunctions.computeBenchmarkIndex));
      } finally {
        try {
          if (session) {
            try {
              await session.send("Emulation.setCPUThrottlingRate", { rate: 1 });
            } finally {
              await session.detach();
            }
          }
        } finally {
          await page.close();
        }
      }
    }
    return samples;
  };
  const samples = await sample();
  await recordSamples("host", samples);
  const calibration = createCpuCalibration(samples);
  let cpuSlowdownMultiplier = calibration.cpuSlowdownMultiplier;
  const steps = [];
  for (let correction = 0; correction <= maximumCorrections; correction++) {
    const effectiveSamples = await sample(cpuSlowdownMultiplier);
    const stage = correction === 0 ? "effective" : `effective-correction-${correction}`;
    await recordSamples(stage, effectiveSamples, { cpuSlowdownMultiplier });
    if (effectiveSamples.some((value) => !Number.isFinite(value) || value <= 0)) {
      throw new Error("Three valid effective CPU benchmark samples are required");
    }
    if (effectiveSamples.some((value) => !withinDrift(value, targetBenchmarkIndex))) {
      throw new CpuCalibrationInstability("Applied CPU slowdown did not reproduce the performance reference");
    }
    const effectiveBenchmarkIndex = [...effectiveSamples].sort((a, b) => a - b)[1];
    steps.push({ cpuSlowdownMultiplier, effectiveSamples, effectiveBenchmarkIndex });
    if (Math.abs(effectiveBenchmarkIndex - targetBenchmarkIndex) <= targetBenchmarkIndex * targetPrecision) {
      return { ...calibration, cpuSlowdownMultiplier, effectiveSamples, targetPrecision, maximumDrift, steps };
    }
    // Correct only measured pre-audit bias, never an application timing or budget failure.
    const adjusted = Math.max(1, cpuSlowdownMultiplier * (effectiveBenchmarkIndex / targetBenchmarkIndex));
    if (adjusted === cpuSlowdownMultiplier) break;
    cpuSlowdownMultiplier = adjusted;
  }
  throw new CpuCalibrationInstability("Applied CPU slowdown did not reach the 5% target precision");
}

// Retry only pre-audit host instability; never retry Lighthouse samples or budget failures.
export async function calibrateCpuWithRetry(openPage, recordSamples = async () => {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return {
        ...(await calibrateCpu(openPage, (stage, samples, settings) =>
          recordSamples(stage, samples, attempt, settings),
        )),
        attempt,
      };
    } catch (error) {
      if (!(error instanceof CpuCalibrationInstability) || attempt === 3) throw error;
    }
  }
}

export function createCpuCalibration(samples) {
  if (samples.length !== 3 || samples.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Three valid CPU benchmark samples are required");
  }
  const median = [...samples].sort((a, b) => a - b)[1];
  if (median < targetBenchmarkIndex) throw new Error("Host CPU is slower than the performance reference");
  if (samples.some((value) => !withinDrift(value, median))) {
    throw new CpuCalibrationInstability("Host CPU is unstable during calibration");
  }
  return {
    samples,
    benchmarkIndex: median,
    targetBenchmarkIndex,
    cpuSlowdownMultiplier: median / targetBenchmarkIndex,
  };
}

export function validateCpuCalibration(report, calibration) {
  const benchmark = report.environment?.benchmarkIndex;
  if (!withinDrift(benchmark, calibration.benchmarkIndex)) {
    throw new Error("Host CPU drifted outside the calibrated range");
  }
  if (
    report.configSettings?.throttlingMethod !== "devtools" ||
    report.configSettings?.throttling?.cpuSlowdownMultiplier !== calibration.cpuSlowdownMultiplier
  ) {
    throw new Error("Lighthouse did not apply the calibrated CPU slowdown");
  }
}
