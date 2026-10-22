import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
import { pageFunctions } from "lighthouse/core/lib/page-functions.js";
import { ExecutionContext } from "lighthouse/core/gather/driver/execution-context.js";
import { ProtocolSession } from "lighthouse/core/gather/session.js";

// Diagnostic only: resolve the exact launcher owned by the installed Lighthouse version.
const require = createRequire(import.meta.url);
const lighthouseRequire = createRequire(require.resolve("lighthouse/package.json"));
const { launch } = await import(lighthouseRequire.resolve("chrome-launcher"));
for (const mode of ["playwright", "lighthouse"]) {
  const chrome =
    mode === "lighthouse"
      ? await launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-sandbox"] })
      : undefined;
  const browser = chrome
    ? await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`)
    : await chromium.launch({ executablePath: chromium.executablePath(), args: ["--headless=new", "--no-sandbox"] });
  try {
    const browserContext = browser.contexts()[0] || (await browser.newContext());
    const page = await browserContext.newPage();
    const session = await page.context().newCDPSession(page);
    const context = new ExecutionContext(new ProtocolSession(session));
    const rows = [];
    for (let index = 0; index < 3; index++) {
      rows.push({
        playwright: await page.evaluate(pageFunctions.computeBenchmarkIndex),
        lighthouse: await context.evaluate(pageFunctions.computeBenchmarkIndex, { args: [] }),
      });
    }
    console.log(JSON.stringify({ mode, rows }));
    await page.close();
    const fresh = [];
    for (let index = 0; index < 3; index++) {
      const next = await browserContext.newPage();
      const cdp = await next.context().newCDPSession(next);
      const execution = new ExecutionContext(new ProtocolSession(cdp));
      fresh.push(await execution.evaluate(pageFunctions.computeBenchmarkIndex, { args: [] }));
      await next.close();
    }
    console.log(JSON.stringify({ mode, fresh }));
  } finally {
    await browser.close();
    await chrome?.kill();
  }
}
