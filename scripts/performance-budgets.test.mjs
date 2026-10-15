import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReports, performanceRoutes } from "./performance-budgets.mjs";

const route = performanceRoutes[0];
function report({ lcp = 1800, css = 135000, js = 900000 } = {}) {
  return {
    audits: {
      "largest-contentful-paint": { numericValue: lcp },
      "total-blocking-time": { numericValue: 100 },
      "cumulative-layout-shift": { numericValue: 0 },
      "network-requests": {
        details: {
          items: [
            { resourceType: "Document", statusCode: 200 },
            { resourceType: "Stylesheet", resourceSize: css, statusCode: 200 },
            { resourceType: "Script", resourceSize: js, statusCode: 200 },
          ],
        },
      },
    },
  };
}

test("three healthy samples pass without relying on a Lighthouse score", () => {
  assert.deepEqual(evaluateReports([report(), report(), report()], route).failures, []);
});
test("timing uses the median so one slow sample does not fail the gate", () => {
  assert.equal(evaluateReports([report(), report({ lcp: 10000 }), report()], route).values.lcpMs, 1800);
});
test("the observed unrelated font CSS regression fails even in just one sample", () => {
  const result = evaluateReports([report(), report({ css: 330000 }), report()], route);
  assert.match(result.failures[0], /stylesheetBytes/);
});
test("Chinese routes allow one font family but reject the previous combined payload", () => {
  const chinese = performanceRoutes[1];
  assert.deepEqual(
    evaluateReports(
      Array.from({ length: 3 }, () => report({ css: 240000 })),
      chinese,
    ).failures,
    [],
  );
  assert.match(
    evaluateReports(
      Array.from({ length: 3 }, () => report({ css: 330000 })),
      chinese,
    ).failures[0],
    /stylesheetBytes/,
  );
});
test("timing, layout stability and script size regressions fail", () => {
  const samples = Array.from({ length: 3 }, () => report({ lcp: 4000, js: 1500000 }));
  for (const sample of samples) {
    sample.audits["total-blocking-time"].numericValue = 600;
    sample.audits["cumulative-layout-shift"].numericValue = 0.2;
  }
  assert.equal(evaluateReports(samples, route).failures.length, 4);
});
test("incomplete or invalid evidence fails closed", () => {
  assert.throws(() => evaluateReports([report()], route), /Three complete/);
  for (const mutate of [
    (r) => {
      r.runtimeError = { code: "NO_FCP" };
    },
    (r) => {
      delete r.audits["largest-contentful-paint"];
    },
    (r) => {
      r.audits["total-blocking-time"].numericValue = NaN;
    },
    (r) => {
      r.audits["network-requests"].details.items[0].statusCode = 500;
    },
    (r) => {
      r.audits["network-requests"].details.items[1].resourceSize = undefined;
    },
    (r) => {
      r.audits["network-requests"].details.items[1].statusCode = 404;
    },
  ]) {
    const invalid = report();
    mutate(invalid);
    assert.throws(() => evaluateReports([report(), invalid, report()], route));
  }
});

test("only Vercel-injected analytics scripts may be absent on the isolated local server", () => {
  const sample = report();
  const resources = sample.audits["network-requests"].details.items;
  resources.push({
    resourceType: "Script",
    resourceSize: 0,
    statusCode: 404,
    url: "http://127.0.0.1:3211/_vercel/insights/script.js",
  });
  assert.deepEqual(evaluateReports([sample, sample, sample], route).failures, []);
  resources.at(-1).url = "http://127.0.0.1:3211/_next/static/missing.js";
  assert.throws(() => evaluateReports([sample, sample, sample], route), /Failed Script request/);
});
