// The accepted PR #85 baseline had a median host index of 4193.25 at 4x slowdown.
// Target 1000 is slightly slower than that reference's effective index of 1048.31.
const targetBenchmarkIndex = 1000;
const maximumDrift = 0.15;

export function createCpuCalibration(samples) {
  if (samples.length !== 3 || samples.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("Three valid CPU benchmark samples are required");
  }
  const median = [...samples].sort((a, b) => a - b)[1];
  if (median < targetBenchmarkIndex) throw new Error("Host CPU is slower than the performance reference");
  if (samples.some((value) => Math.abs(value / median - 1) > maximumDrift)) {
    throw new Error("Host CPU is unstable during calibration");
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
  if (!Number.isFinite(benchmark) || Math.abs(benchmark / calibration.benchmarkIndex - 1) > maximumDrift) {
    throw new Error("Host CPU drifted outside the calibrated range");
  }
  if (
    report.configSettings?.throttlingMethod !== "devtools" ||
    report.configSettings?.throttling?.cpuSlowdownMultiplier !== calibration.cpuSlowdownMultiplier
  ) {
    throw new Error("Lighthouse did not apply the calibrated CPU slowdown");
  }
}
