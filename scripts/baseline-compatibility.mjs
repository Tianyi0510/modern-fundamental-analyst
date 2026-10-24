import Baseline from "lighthouse/core/audits/baseline.js";

// Lighthouse's audit deduplicates before source attribution and omits unknown IDs.
// Keep every observed source and unknown ID so neither can disappear from review.
export function analyzeBaselineTrace(trace, date = new Date()) {
  if (!Array.isArray(trace?.traceEvents)) throw new Error("Missing Baseline trace events");
  const features = new Map();
  for (const event of trace.traceEvents) {
    if (event.cat !== "blink.webdx_feature_usage") continue;
    const id = event.args?.feature;
    if (typeof id !== "string" || !id) throw new Error("Malformed Baseline feature event");
    if (!features.has(id)) {
      const status = Baseline.getFeatureStatus(id, Baseline.featureData, date)?.baselineTier ?? "unknown";
      features.set(id, { id, status, sources: [] });
    }
    const source = {
      url: event.args.url ?? null,
      line: event.args.lineNumber ?? null,
      column: event.args.columnNumber ?? null,
    };
    const feature = features.get(id);
    if (!feature.sources.some((existing) => JSON.stringify(existing) === JSON.stringify(source)))
      feature.sources.push(source);
  }
  if (!features.size) throw new Error("No Baseline feature observations; compatibility is unverified");
  const items = [...features.values()].sort((a, b) => a.id.localeCompare(b.id));
  return {
    status: items.some((f) => f.status !== "high") ? "review-required" : "only-widely-available-features-observed",
    features: items,
  };
}

export function baselineMarkdown(report) {
  const escape = (value) =>
    String(value).replace(
      /[&<>|\r\n]/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "|": "&#124;", "\r": " ", "\n": " " })[char],
    );
  const features = new Map();
  for (const sample of report.samples) {
    for (const feature of sample.features) {
      const key = `${feature.id}:${feature.status}`;
      if (!features.has(key)) features.set(key, { ...feature, routes: new Set() });
      features.get(key).routes.add(sample.route);
    }
  }
  return [
    "## Baseline Compatibility Observations",
    "",
    `Status: ${escape(report.status)}. Data: ${escape(report.dataDate)}. Analysis: ${escape(report.analyzedAt)}.`,
    "",
    "Initial-navigation trace coverage only; this does not certify application compatibility, Firefox behavior or unexercised interactions.",
    "",
    "Newly available, Limited and unknown features require source and fallback review. Sources remain in baseline.json; instrumentation is not silently excluded.",
    "",
    "| Feature | Status | Routes |",
    "| --- | --- | --- |",
    ...[...features.values()].map(
      (f) => `| ${escape(f.id)} | ${escape(f.status)} | ${escape([...f.routes].join(", "))} |`,
    ),
    "",
    ...report.errors.map((error) => `- Evidence error: ${escape(error)}`),
    "",
  ].join("\n");
}
