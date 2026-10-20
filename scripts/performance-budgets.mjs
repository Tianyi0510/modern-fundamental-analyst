export const performanceRoutes = [
  { path: "/", stylesheetBytes: 180 * 1024 },
  { path: "/zh-tw", stylesheetBytes: 285 * 1024 },
  { path: "/zh-cn", stylesheetBytes: 275 * 1024 },
  { path: "/performance", stylesheetBytes: 180 * 1024 },
];

const limits = { lcpMs: 3000, tbtMs: 200, cls: 0.1, scriptBytes: 1200 * 1024 };
const vercelRuntimeScripts = new Set(["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"]);

export function evaluateReports(reports, route) {
  if (reports.length !== 3) throw new Error("Three complete Lighthouse samples are required");
  const samples = reports.map((report) => {
    if (report.runtimeError) throw new Error(`Lighthouse failed: ${report.runtimeError.code}`);
    const metric = (id) => {
      const value = report.audits?.[id]?.numericValue;
      if (!Number.isFinite(value) || value < 0) throw new Error(`Missing or invalid Lighthouse metric: ${id}`);
      return value;
    };
    const requests = report.audits?.["network-requests"]?.details?.items;
    if (!Array.isArray(requests) || !requests.some((r) => r.resourceType === "Document" && r.statusCode === 200)) {
      throw new Error("Missing successful document network evidence");
    }
    const bytes = (type) => {
      const resources = requests.filter((r) => r.resourceType === type);
      if (!resources.length || resources.some((r) => !Number.isFinite(r.resourceSize) || r.resourceSize < 0)) {
        throw new Error(`Missing or invalid resource sizes: ${type}`);
      }
      for (const resource of resources) {
        const runtimeOnly =
          type === "Script" &&
          resource.statusCode === 404 &&
          resource.url?.startsWith("http://127.0.0.1:3211/") &&
          vercelRuntimeScripts.has(new URL(resource.url).pathname);
        if (resource.statusCode !== 200 && !runtimeOnly)
          throw new Error(`Failed ${type} request: ${resource.url ?? "unknown URL"}`);
      }
      return resources.reduce((sum, r) => sum + r.resourceSize, 0);
    };
    return {
      lcpMs: metric("largest-contentful-paint"),
      tbtMs: metric("total-blocking-time"),
      cls: metric("cumulative-layout-shift"),
      stylesheetBytes: bytes("Stylesheet"),
      scriptBytes: bytes("Script"),
    };
  });
  const values = Object.fromEntries(
    Object.keys(samples[0]).map((key) => {
      const sorted = samples.map((sample) => sample[key]).sort((a, b) => a - b);
      return [key, key.endsWith("Bytes") ? sorted[2] : sorted[1]];
    }),
  );
  const budgets = { ...limits, stylesheetBytes: route.stylesheetBytes };
  const failures = Object.entries(budgets)
    .filter(([key, maximum]) => values[key] > maximum)
    .map(([key, maximum]) => `${key}: ${values[key]} exceeds ${maximum}`);
  return { path: route.path, samples, values, budgets, failures };
}
