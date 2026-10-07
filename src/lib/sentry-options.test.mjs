import assert from "node:assert/strict";
import test from "node:test";
import { createSentryOptions, resolveSentryDsn, sanitizeSentryEvent, sanitizeSentrySpan } from "./sentry-options.ts";

test("DSN resolution treats empty or whitespace-only overrides as absent", () => {
  const publicDsn = "https://public@sentry.invalid/1";
  assert.equal(resolveSentryDsn(undefined, publicDsn), publicDsn);
  assert.equal(resolveSentryDsn("", publicDsn), publicDsn);
  assert.equal(resolveSentryDsn("  ", publicDsn), publicDsn);
  assert.equal(resolveSentryDsn(" https://server@sentry.invalid/2 ", publicDsn), "https://server@sentry.invalid/2");
  assert.equal(resolveSentryDsn("", " "), undefined);
});

test("error events retain stack identity without request payloads or recovery secrets", () => {
  const event = sanitizeSentryEvent({
    event_id: "test-event",
    user: { email: "reader@example.com", ip_address: "127.0.0.1" },
    extra: { token: "private-token", message: "Private contact message" },
    breadcrumbs: [{ category: "console", message: "Private provider response" }],
    request: {
      method: "POST",
      url: "https://example.com/subscription-preferences?token=private-token#fragment",
      headers: { Authorization: "Bearer private-key" },
      cookies: { session: "private-cookie" },
      data: { email: "reader@example.com", message: "Private contact message" },
      query_string: "token=private-token",
    },
    exception: {
      values: [
        {
          type: "TypeError",
          value:
            "Failed for reader@example.com at https://example.com/support?session_id=private-session Bearer private-key",
          stacktrace: { frames: [{ filename: "https://example.com/_next/static/chunk.js", lineno: 10 }] },
        },
      ],
    },
  });
  assert.equal(event.event_id, "test-event");
  assert.deepEqual(event.request, { method: "POST", url: "https://example.com/subscription-preferences" });
  assert.equal(event.exception.values[0].type, "TypeError");
  assert.equal(event.exception.values[0].stacktrace.frames[0].lineno, 10);
  const serialized = JSON.stringify(event);
  for (const privateValue of [
    "reader@example.com",
    "private-token",
    "private-key",
    "Private contact",
    "private-session",
    "private-cookie",
    "Private provider",
  ]) {
    assert.ok(!serialized.includes(privateValue), privateValue);
  }
});

test("monitoring samples traces while retaining sensitive collection restrictions", () => {
  const options = createSentryOptions("https://public@sentry.invalid/1", "preview");
  assert.equal(options.environment, "preview");
  assert.equal(options.sampleRate, 1);
  assert.equal(options.tracesSampleRate, 1);
  assert.equal(createSentryOptions("https://public@sentry.invalid/1", "production").tracesSampleRate, 0.1);
  assert.equal(options.beforeSendLog({}), null);
  assert.equal(options.beforeSendMetric({}), null);
  assert.equal(options.beforeSend, sanitizeSentryEvent);
  for (const name of [
    "userInfo",
    "cookies",
    "httpHeaders",
    "urlQueryParams",
    "databaseQueryData",
    "stackFrameVariables",
  ]) {
    assert.equal(options.dataCollection[name], false, name);
  }
  assert.deepEqual(options.dataCollection.httpBodies, []);
  assert.equal(options.dataCollection.frameContextLines, 0);
  assert.deepEqual(options.dataCollection.genAI, { inputs: false, outputs: false });
  for (const target of ["https://api.stripe.com/v1/checkout", "https://modernfundamentalanalyst.com.evil.test/"]) {
    assert.ok(!options.tracePropagationTargets.some((pattern) => pattern.test(target)));
  }
  assert.ok(options.tracePropagationTargets.some((pattern) => pattern.test("/api/contact")));
});

test("streamed spans retain timing and measurements without recovery values or database keys", () => {
  const base = {
    trace_id: "trace",
    span_id: "span",
    start_timestamp: 1,
    end_timestamp: 2,
    status: "ok",
    is_segment: true,
    name: "/support?session_id=private-session#fragment",
    attributes: {
      "sentry.op": "pageload",
      "http.request.method": "GET",
      "measurements.lcp": 120,
      "url.full": "https://example.com/support?session_id=private-session",
      "user.email": "reader@example.com",
      "db.statement": "GET private-key",
    },
    links: [{ attributes: { token: "private-token" } }],
  };
  const span = sanitizeSentrySpan(base);
  assert.equal(span.name, "/support");
  assert.equal(span.end_timestamp - span.start_timestamp, 1);
  assert.equal(span.attributes["measurements.lcp"], 120);
  assert.equal(span.attributes["sentry.segment.name"], "/support");
  assert.ok(!JSON.stringify(span).includes("private"));
  assert.ok(!JSON.stringify(span).includes("reader@example.com"));
  const database = sanitizeSentrySpan({
    ...base,
    name: "GET private-redis-key",
    attributes: { "sentry.op": "db.redis" },
  });
  assert.equal(database.name, "Database operation");
  const provider = sanitizeSentrySpan({
    ...base,
    name: "GET https://api.stripe.com/v1/checkout/sessions/private-session",
    attributes: { "sentry.op": "http.client" },
  });
  assert.equal(provider.name, "GET https://api.stripe.com");
});

test("child spans retain release and segment metadata without copying private attributes", () => {
  const metadata = {
    "sentry.op": "db.redis",
    "sentry.environment": "production",
    "sentry.release": "release-sha",
    "sentry.segment.id": "root-span",
    "sentry.sdk.name": "sentry.javascript.nextjs",
    "sentry.sdk.version": "11.4.0",
    "sentry.trace_lifecycle": "stream",
  };
  const span = sanitizeSentrySpan({
    trace_id: "trace",
    span_id: "child-span",
    parent_span_id: "root-span",
    start_timestamp: 1,
    end_timestamp: 2,
    status: "ok",
    is_segment: false,
    name: "GET private-redis-key",
    attributes: {
      ...metadata,
      "sentry.segment.name": "GET /support?session_id=private-session#private-fragment",
      "user.email": "reader@example.com",
    },
  });
  assert.equal(span.name, "Database operation");
  assert.equal(span.parent_span_id, "root-span");
  assert.deepEqual(span.attributes, { ...metadata, "sentry.segment.name": "GET /support" });
  assert.ok(!JSON.stringify(span).includes("private-"));
  assert.ok(!JSON.stringify(span).includes("reader@example.com"));
});

test("chart failures retain original stack locations and standard types without private error details", () => {
  const original = {
    tags: { feature: "performance-chart", measure: "twr" },
    message: "private chart payload",
    extra: { observations: [12345], token: "private-token" },
    exception: {
      values: [
        {
          type: "TypeError",
          value: "private chart payload",
          stacktrace: {
            frames: [
              {
                filename: "https://example.com/_next/static/chart.js?token=private-token",
                function: "PerformanceChartView",
                lineno: 42,
                colno: 17,
                vars: { data: "private chart payload" },
              },
            ],
          },
        },
        { type: "private custom name", value: "private nested cause" },
      ],
    },
  };
  const event = sanitizeSentryEvent(structuredClone(original));
  assert.equal(event.exception.values[0].type, "TypeError");
  assert.deepEqual(event.exception.values[0].stacktrace.frames, [
    {
      filename: "https://example.com/_next/static/chart.js",
      function: "PerformanceChartView",
      lineno: 42,
      colno: 17,
    },
  ]);
  assert.equal(event.message, "Performance chart rendering failed");
  assert.equal(event.exception.values[0].value, "Performance chart rendering failed");
  assert.deepEqual(event.exception.values[1], { type: "Error", value: "Performance chart rendering failed" });
  assert.equal(event.tags.measure, "twr");
  assert.doesNotMatch(JSON.stringify(event), /private|12345/);

  const ordinary = sanitizeSentryEvent({
    exception: { values: [{ type: "TypeError", value: "Ordinary render failure" }] },
  });
  assert.equal(ordinary.exception.values[0].value, "Ordinary render failure");
});
