import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { performanceRoutes, evaluateReports } from "./performance-budgets.mjs";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";
import { calibrateCpuWithRetry, validateCpuCalibration } from "./performance-cpu.mjs";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../node_modules/.cache/performance/", import.meta.url);
const origin = "http://127.0.0.1:3211";
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
let activeAudit;
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
const stop = () => {
  activeAudit?.kill("SIGTERM");
  server.kill("SIGTERM");
};
process.once("SIGINT", () => {
  stop();
  process.exitCode = 130;
});
process.once("SIGTERM", () => {
  stop();
  process.exitCode = 143;
});

try {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
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
  if (!ready) throw new Error("Isolated production server did not become ready");
  // Match Lighthouse CLI's launcher and flags; Playwright launch defaults differ.
  const chromeFlags = (process.env.LIGHTHOUSE_CHROME_FLAGS || "--headless=new").split(/\s+/).filter(Boolean);
  const chrome = await launch({ chromePath: env.CHROME_PATH, chromeFlags });
  let browser;
  let calibration;
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);
    const context = browser.contexts()[0];
    calibration = {
      ...(await calibrateCpuWithRetry(
        () => context.newPage(),
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
    }
  }
  await writeFile(new URL("cpu-calibration.json", output), JSON.stringify(calibration, null, 2) + "\n");
  console.log("CPU calibration:", JSON.stringify(calibration));
  const results = [];
  for (const [index, route] of performanceRoutes.entries()) {
    const reports = [];
    for (let sample = 1; sample <= 3; sample++) {
      const path = fileURLToPath(new URL(`route-${index}-${sample}.json`, output));
      await new Promise((resolve, reject) => {
        activeAudit = spawn(
          process.execPath,
          [
            require.resolve("lighthouse/cli/index.js"),
            origin + route.path,
            "--only-categories=performance",
            "--throttling-method=devtools",
            `--throttling.cpuSlowdownMultiplier=${calibration.cpuSlowdownMultiplier}`,
            "--throttling.requestLatencyMs=150",
            "--throttling.downloadThroughputKbps=1638.4",
            "--throttling.uploadThroughputKbps=750",
            "--output=json",
            `--output-path=${path}`,
            "--save-assets",
            `--chrome-flags=${process.env.LIGHTHOUSE_CHROME_FLAGS || "--headless=new"}`,
            "--quiet",
          ],
          { cwd: root, env, stdio: "inherit", timeout: 120000 },
        );
        activeAudit.once("error", reject);
        activeAudit.once("exit", (code, signal) =>
          code === 0 ? resolve() : reject(new Error(`Lighthouse failed (${code ?? signal})`)),
        );
      });
      const report = JSON.parse(await readFile(path, "utf8"));
      validateCpuCalibration(report, calibration);
      if (new URL(report.finalDisplayedUrl).href !== origin + route.path)
        throw new Error("Lighthouse measured an unexpected URL");
      reports.push(report);
      console.log(`${route.path}: sample ${sample}/3 complete`);
    }
    results.push(evaluateReports(reports, route));
    await writeFile(new URL("summary.json", output), JSON.stringify(results, null, 2) + "\n");
  }
  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.path}: ${failure}`));
  if (failures.length) throw new Error(failures.join("\n"));
  console.log("Performance budgets passed for all routes. Lab budgets do not establish field CWV compliance.");
} finally {
  stop();
}
