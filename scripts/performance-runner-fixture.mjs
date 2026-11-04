// Dependency-isolated child process for runner regressions; no browser or server is started.
import { registerHooks } from "node:module";

const mocks = {
  "node:child_process": `
    import { EventEmitter } from 'node:events';
    import { PassThrough } from 'node:stream';
    import { parseChromeFlags } from '${import.meta.resolve("lighthouse/cli/run.js")}';
    export function spawn(executable, args, options) {
      const child = new EventEmitter();
      child.exitCode = null;
      if (args.includes('start')) {
        child.stdout = new PassThrough(); child.stderr = new PassThrough();
        child.kill = (signal) => {
          console.log('SERVER CLEANUP ' + signal); child.exitCode = 0;
          if (process.env.PERFORMANCE_TEST_CLEANUP_FAILURE) throw new Error('Mock server cleanup failed');
        };
        queueMicrotask(() => child.stdout.write('Ready'));
      } else {
        globalThis.auditUrl = args[1];
        console.log('AUDIT SPAWNED ' + globalThis.auditUrl);
        console.log('AUDIT FLAGS ' + JSON.stringify(parseChromeFlags(args.find(arg => arg.startsWith('--chrome-flags=')).slice('--chrome-flags='.length))));
        console.log('AUDIT TIMEOUT ' + JSON.stringify({ timeout: options.timeout, killSignal: options.killSignal }));
        const scenario = process.env.PERFORMANCE_TEST_SCENARIO;
        let timer;
        child.kill = (signal) => {
          console.log('AUDIT CLEANUP ' + signal); clearInterval(timer);
          child.signalCode = signal;
          queueMicrotask(() => child.emit('exit', null, signal));
        };
        if (scenario === 'audit-cancel') timer = setInterval(() => {}, 1000);
        else queueMicrotask(() => {
          child.exitCode = scenario === 'audit-failure' ? 7 : 0;
          child.emit('exit', child.exitCode, null);
        });
      }
      return child;
    }`,
  "node:fs/promises": `
    export const rm = async () => {}; export const mkdir = async () => {};
    export const writeFile = async (url, data) => {
      if (String(url).endsWith('/summary.json')) console.log('SUMMARY ROUTES ' + JSON.parse(data).length);
      if (String(url).endsWith('/cpu-calibration.json')) console.log('SAVED CALIBRATION FLAGS ' + JSON.stringify(JSON.parse(data).chromeFlags));
    };
    export const readFile = async (path) => {
      if (String(path).endsWith('.trace.json')) return JSON.stringify({ traceEvents: [
        { name: 'TracingStartedInBrowser', args: { data: { frames: [{ isOutermostMainFrame: true, url: 'http://127.0.0.1:3211/robots.txt', processId: 12, frame: 'main' }] } } },
        { name: 'FrameCommittedInBrowser', args: { data: { frame: 'main', url: globalThis.auditUrl, processId: 12 } } },
        { name: 'navigationStart', pid: 12, args: { frame: 'main', data: { documentLoaderURL: globalThis.auditUrl } } },
      ] });
      return JSON.stringify({ finalDisplayedUrl: globalThis.auditUrl, audits: {
        'largest-contentful-paint': { numericValue: 2000 },
        'total-blocking-time': { numericValue: 200 },
        'cumulative-layout-shift': { numericValue: 0.01 },
        'network-requests': { details: { items: [
          { resourceType: 'Document', statusCode: 200 },
          { resourceType: 'Stylesheet', statusCode: 200, resourceSize: 1000 },
          { resourceType: 'Script', statusCode: 200, resourceSize: 1000 },
        ] } },
      } });
    };`,
  "chrome-launcher": `export class Launcher {
    constructor(options) { console.log('CALIBRATION FLAGS ' + JSON.stringify(options.chromeFlags)); }
    async launch() { this.port = 1234; }
    async kill() { console.log('CHROME CLEANUP'); globalThis.finishCalibration?.(); }
  }`,
  "@playwright/test": `export const chromium = {
    executablePath: () => '/fake/chrome',
    connectOverCDP: async () => ({ contexts: () => [{}], version: () => 'fake',
      close: async () => console.log('BROWSER CLEANUP') })
  };`,
  "./performance-cpu.mjs": `export async function calibrateCpuWithRetry() {
    console.log('CALIBRATION STARTED');
    if (!process.env.PERFORMANCE_TEST_SCENARIO) {
      await new Promise(resolve => { globalThis.finishCalibration = resolve;
        globalThis.calibrationTimer = setInterval(() => {}, 1000); });
      clearInterval(globalThis.calibrationTimer);
    }
    return { cpuSlowdownMultiplier: 4 };
  }
  export function validateCpuCalibration() {}`,
  "./performance-environment.mjs": `export const performanceEnvironment = () => ({});`,
};
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith("/run-performance.mjs") && specifier in mocks)
      return { url: "data:text/javascript," + encodeURIComponent(mocks[specifier]), shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
globalThis.fetch = async (url) => {
  const response = new Response("", {
    headers: { "content-type": "text/plain", "cross-origin-opener-policy": "same-origin" },
  });
  Object.defineProperty(response, "url", { value: String(url) });
  return response;
};
await import("./run-performance.mjs");
