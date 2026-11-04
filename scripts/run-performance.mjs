import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { performanceRoutes, evaluateReports } from "./performance-budgets.mjs";
import { Launcher } from "chrome-launcher";
import { parseChromeFlags } from "lighthouse/cli/run.js";
import { createPerformanceLifecycle } from "./performance-lifecycle.mjs";
import { chromium } from "@playwright/test";
import { calibrateCpuWithRetry, validateCpuCalibration } from "./performance-cpu.mjs";
import { performanceEnvironment } from "./performance-environment.mjs";

import {
  performanceOrigin,
  preparationUrl,
  validatePreparationResponse,
  validateNavigationTrace,
} from "./performance-navigation.mjs";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../node_modules/.cache/performance/", import.meta.url);
const origin = performanceOrigin;
const env = {
  ...process.env,
  CHROME_PATH: chromium.executablePath(),
  RESEND_API_KEY: "",
  RESEND_WEBHOOK_SECRET: "",
  STRIPE_SECRET_KEY: "",
  STRIPE_RESTRICTED_KEY: "",
  UPSTASH_KV_REST_API_URL: "",
  UPSTASH_KV_REST_API_TOKEN: "",
  SENTRY_AUTH_TOKEN: "",
  SENTRY_DSN: "",
  SUBSCRIPTION_PREFERENCES_SECRET: "performance-preferences-only",
  SUPPORT_CHECKOUT_SECRET: "performance-checkout-only",
};
const lifecycle = createPerformanceLifecycle();
let activeAudit;
let runError;
let cleanupError;
let serverError;
const server = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3211"],
  {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverLog = "";
for (const stream of [server.stdout, server.stderr])
  stream.on("data", (data) => {
    serverLog = (serverLog + data).slice(-10000);
  });
server.on("error", (error) => {
  serverError = error;
});
lifecycle.own(() => server.kill("SIGTERM"));
lifecycle.own(() => activeAudit?.kill("SIGINT"));
const interrupt = (signal) => {
  process.exitCode = signal === "SIGINT" ? 130 : 143;
  void lifecycle.cancel(signal).catch((error) => console.error(error));
};
const onInterrupt = () => interrupt("SIGINT");
const onTerminate = () => interrupt("SIGTERM");
process.once("SIGINT", onInterrupt);
process.once("SIGTERM", onTerminate);

try {
  lifecycle.check();
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(new URL("environment.json", output), JSON.stringify(performanceEnvironment(), null, 2) + "\n");
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    lifecycle.check();
    if (serverError || server.exitCode !== null || server.signalCode)
      throw new Error(`Performance server failed: ${serverLog}`);
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.ok && serverLog.includes("Ready") && server.exitCode === null) {
        ready = true;
        break;
      }
    } catch {
      /* The owned server may still be starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  lifecycle.check();
  if (!ready) throw new Error("Isolated production server did not become ready");
  const preparation = await fetch(preparationUrl, { signal: AbortSignal.timeout(5000) });
  await preparation.body?.cancel();
  lifecycle.check();
  validatePreparationResponse(preparation);
  // Match Lighthouse CLI's launcher and flags; Playwright launch defaults differ.
  const chromeFlagInput = process.env.LIGHTHOUSE_CHROME_FLAGS || "--headless=new";
  const chromeFlags = parseChromeFlags(chromeFlagInput);
  const chrome = new Launcher({ chromePath: env.CHROME_PATH, chromeFlags, handleSIGINT: false });
  const releaseChrome = lifecycle.own(() => chrome.kill());
  let browser;
  let calibration;
  try {
    lifecycle.check();
    await chrome.launch();
    lifecycle.check();
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);
    lifecycle.check();
    const context = browser.contexts()[0];
    calibration = {
      ...(await calibrateCpuWithRetry(
        () => {
          lifecycle.check();
          return context.newPage();
        },
        (stage, samples, attempt) =>
          writeFile(new URL(`cpu-attempt-${attempt}-${stage}-samples.json`, output), JSON.stringify(samples) + "\n"),
      )),
      browserVersion: browser.version(),
      executablePath: env.CHROME_PATH,
      launcher: "chrome-launcher",
      chromeFlags,
      sampleLifecycle: "fresh-page",
    };
  } finally {
    try {
      await browser?.close();
    } finally {
      await chrome.kill();
      releaseChrome();
    }
  }
  lifecycle.check();
  await writeFile(new URL("cpu-calibration.json", output), JSON.stringify(calibration, null, 2) + "\n");
  console.log("CPU calibration:", JSON.stringify(calibration));
  const results = [];
  for (const [index, route] of performanceRoutes.entries()) {
    const reports = [];
    for (let sample = 1; sample <= 3; sample++) {
      lifecycle.check();
      const path = fileURLToPath(new URL(`route-${index}-${sample}.json`, output));
      await new Promise((resolve, reject) => {
        activeAudit = spawn(
          process.execPath,
          [
            require.resolve("lighthouse/cli/index.js"),
            origin + route.path,
            "--only-categories=performance",
            `--config-path=${fileURLToPath(new URL("./performance-navigation.mjs", import.meta.url))}`,
            "--throttling-method=devtools",
            `--throttling.cpuSlowdownMultiplier=${calibration.cpuSlowdownMultiplier}`,
            "--throttling.requestLatencyMs=150",
            "--throttling.downloadThroughputKbps=1638.4",
            "--throttling.uploadThroughputKbps=750",
            "--output=json",
            `--output-path=${path}`,
            "--save-assets",
            `--chrome-flags=${chromeFlagInput}`,
            "--quiet",
          ],
          { cwd: root, env, stdio: "inherit", timeout: 120000, killSignal: "SIGINT" },
        );
        activeAudit.once("error", reject);
        activeAudit.once("exit", (code, signal) =>
          code === 0 ? resolve() : reject(new Error(`Lighthouse failed (${code ?? signal})`)),
        );
      });
      activeAudit = undefined;
      lifecycle.check();
      const report = JSON.parse(await readFile(path, "utf8"));
      validateCpuCalibration(report, calibration);
      const trace = JSON.parse(await readFile(new URL(`route-${index}-${sample}-0.trace.json`, output), "utf8"));
      validateNavigationTrace(trace, origin + route.path);
      if (new URL(report.finalDisplayedUrl).href !== origin + route.path)
        throw new Error("Lighthouse measured an unexpected URL");
      reports.push(report);
      console.log(`${route.path}: sample ${sample}/3 complete`);
    }
    results.push(evaluateReports(reports, route));
    await writeFile(new URL("summary.json", output), JSON.stringify(results, null, 2) + "\n");
  }
  lifecycle.check();
  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.path}: ${failure}`));
  if (failures.length) throw new Error(failures.join("\n"));
  console.log("Performance budgets passed for all routes. Lab budgets do not establish field CWV compliance.");
} catch (error) {
  runError = error;
  if (!lifecycle.signal.aborted) throw error;
} finally {
  try {
    await lifecycle.cleanup();
  } catch (error) {
    if (!runError && !lifecycle.signal.aborted) cleanupError = error;
    else console.error(error);
  } finally {
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
  }
}

if (cleanupError) throw cleanupError;
