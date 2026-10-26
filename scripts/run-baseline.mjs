import { appendFile, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { analyzeBaselineTrace, baselineMarkdown } from "./baseline-compatibility.mjs";
import { performanceRoutes } from "./performance-budgets.mjs";

const require = createRequire(import.meta.url);
const lighthouseVersion = require("lighthouse/package.json").version;
const metadata = require("lighthouse/core/lib/baseline/web-features-metadata.json");
const defaultDirectory = fileURLToPath(new URL("../node_modules/.cache/performance/", import.meta.url));

export async function checkBaseline(directory = defaultDirectory, summaryPath = process.env.GITHUB_STEP_SUMMARY) {
  const date = new Date();
  const report = {
    status: "incomplete",
    lighthouseVersion,
    dataDate: metadata.date,
    analyzedAt: date.toISOString(),
    environment: null,
    samples: [],
    errors: [],
  };
  const json = async (name) => JSON.parse(await readFile(resolve(directory, name), "utf8"));
  try {
    report.environment = await json("environment.json");
    if (report.environment.lighthouseVersion !== lighthouseVersion || !report.environment.commit)
      throw new Error("Missing commit or mismatched Lighthouse version in environment.json");
    for (const [index, route] of performanceRoutes.entries()) {
      for (let sample = 1; sample <= 3; sample++) {
        const name = `route-${index}-${sample}`;
        try {
          const measured = await json(`${name}.json`);
          if (
            measured.runtimeError ||
            measured.lighthouseVersion !== lighthouseVersion ||
            measured.finalDisplayedUrl !== `http://127.0.0.1:3211${route.path}`
          )
            throw new Error("Invalid route report identity or runtime error");
          const trace = await json(`${name}-0.trace.json`);
          report.samples.push({
            route: route.path,
            sample,
            fetchTime: measured.fetchTime,
            ...analyzeBaselineTrace(trace, date),
          });
        } catch (error) {
          report.errors.push(`${name}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    report.errors.push(error.message);
  }
  report.status = report.errors.length
    ? "incomplete"
    : report.samples.some((s) => s.status === "review-required")
      ? "review-required"
      : "only-widely-available-features-observed";
  const markdown = baselineMarkdown(report);
  await writeFile(resolve(directory, "baseline.json"), JSON.stringify(report, null, 2) + "\n");
  await writeFile(resolve(directory, "baseline.md"), markdown);
  if (summaryPath) await appendFile(summaryPath, markdown);
  console.log(`Baseline: ${report.status}; ${report.samples.length}/12 navigation samples. Data: ${metadata.date}.`);
  if (report.errors.length) throw new Error(report.errors.join("\n"));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length > 3) throw new Error("Usage: node scripts/run-baseline.mjs [performance-evidence-directory]");
  await checkBaseline(process.argv[2] ? resolve(process.argv[2]) : undefined);
}
