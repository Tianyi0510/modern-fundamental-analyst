import assert from "node:assert/strict";
import test from "node:test";
import { captureEvent, logger, metrics, startSpan, withScope } from "@sentry/core";
import { captureRequestError } from "@sentry/nextjs";
import { monitoringCapture } from "../../scripts/sentry-test-client.mjs";
import { reportServiceFailure } from "./sentry-server.ts";

test("Next.js request errors remove recovery queries while preserving route context", async (t) => {
  const { events, flush } = monitoringCapture(t);
  for (const path of [
    "/subscription-preferences?token=private-token#private-fragment",
    "/zh-tw/support?session_id=private-session&attempt=private-attempt",
  ]) {
    const routePath = path.split("?")[0];
    captureRequestError(
      new Error("Request rendering failed"),
      { path, method: "GET", headers: {} },
      { routerKind: "App Router", routePath, routeType: "render" },
    );
  }
  await flush();
  assert.equal(events.length, 2);
  assert.deepEqual(
    events.map((event) => event.contexts.nextjs.request_path),
    ["/subscription-preferences", "/zh-tw/support"],
  );
  for (const event of events) {
    assert.equal(event.contexts.nextjs.router_kind, "App Router");
    assert.equal(event.contexts.nextjs.route_type, "render");
    assert.equal(event.contexts.nextjs.router_path, event.contexts.nextjs.request_path);
    assert.ok(!JSON.stringify(event).includes("private-"));
  }
});

test("error envelopes remove relative URL queries and fragments from messages and exceptions", async (t) => {
  const { events, flush } = monitoringCapture(t);
  const frame = { filename: "/_next/static/chunk.js", lineno: 17 };
  captureEvent({
    message:
      "Minified React error #418; cannot read private member #balance; GET /subscription-preferences?ref=O'Brien&token=private-query#private-fragment failed; fragment-only URL #privateAnchor",
    exception: {
      values: [
        {
          type: "Error",
          value:
            "Minified React error #418; private field '#balance' on this.#account; from ../support#O'Brien-private-anchor to receipt?ref=O'Brien&session_id=private-session",
          stacktrace: { frames: [frame] },
        },
      ],
    },
  });
  await flush();
  assert.equal(events.length, 1);
  assert.equal(
    events[0].message,
    "Minified React error #418; cannot read private member #balance; GET /subscription-preferences failed; fragment-only URL ",
  );
  assert.equal(
    events[0].exception.values[0].value,
    "Minified React error #418; private field '#balance' on this.#account; from ../support to receipt",
  );
  assert.deepEqual(events[0].exception.values[0].stacktrace.frames, [frame]);
  assert.ok(!JSON.stringify(events).includes("private-"));
});

test("error envelopes distinguish request fragments from React and JavaScript diagnostics", async (t) => {
  const { events, flush } = monitoringCapture(t);
  const diagnostic = "Minified React error #418; this.#account; Identifier '#balance' has already been declared";
  const message = diagnostic + "; GET #2026 then GET receipt.#privateAnchor";
  captureEvent({ message, exception: { values: [{ type: "SyntaxError", value: message }] } });
  await flush();
  assert.equal(events.length, 1);
  const expected = diagnostic + "; GET  then GET receipt.";
  assert.equal(events[0].message, expected);
  assert.equal(events[0].exception.values[0].value, expected);
});

test("error envelopes redact quoted targets and provider URLs while preserving V8 membership diagnostics", async (t) => {
  const { events, flush } = monitoringCapture(t);
  const cases = [
    ["Cannot initialize #balance twice on the same object", "Cannot initialize #balance twice on the same object"],
    [
      "'#balance' was defined without a getter; GET '#privateAnchor'",
      "'#balance' was defined without a getter; GET ''",
    ],
    ['GET "receipt.#privateAnchor"', 'GET "receipt."'],
    ["POST 'receipt.#privateAnchor'", "POST 'receipt.'"],
    ["GET https://provider.example/accounts/O'Brien?token=private#fragment", "GET https://provider.example"],
    ["Failed at //provider.example:8443/accounts/private", "Failed at https://provider.example:8443"],
    [
      "GET https://www.modernfundamentalanalyst.com/support?token=private",
      "GET https://www.modernfundamentalanalyst.com/support",
    ],
    [
      "Cannot use 'in' operator to search for '#balance' in null",
      "Cannot use 'in' operator to search for '#balance' in null",
    ],
  ];
  for (const [message] of cases) {
    captureEvent({ message, exception: { values: [{ type: "TypeError", value: message }] } });
  }
  await flush();
  for (const field of [events.map((event) => event.message), events.map((event) => event.exception.values[0].value)]) {
    assert.deepEqual(
      field,
      cases.map(([, expected]) => expected),
    );
  }
});

test("structured URL fields preserve first-party source paths and strip third-party paths", async (t) => {
  const { events, flush } = monitoringCapture(t);
  const debugId = "11111111-2222-4333-8444-555555555555";
  const paths = [
    ["https://provider.example/accounts/private", "https://provider.example"],
    ["blob:https://provider.example:8443/85b1cf4a-bcb3-427d-b34b-5c90a0afbe32", "https://provider.example:8443"],
    ["blob:http://demo.localhost:3000/local-script", "blob:http://demo.localhost:3000/local-script"],
    ["//provider.example:8443/accounts/private", "https://provider.example:8443"],
    [
      "https://www.modernfundamentalanalyst.com/_next/chunk.js",
      "https://www.modernfundamentalanalyst.com/_next/chunk.js",
    ],
    [
      "https://modern-fundamental-analyst.vercel.app/_next/chunk.js",
      "https://modern-fundamental-analyst.vercel.app/_next/chunk.js",
    ],
    ["http://demo.localhost:3000/_next/chunk.js", "http://demo.localhost:3000/_next/chunk.js"],
    ["http://127.0.0.2:3000/_next/chunk.js", "http://127.0.0.2:3000/_next/chunk.js"],
    ["app:///_next/chunk.js", "app:///_next/chunk.js"],
    ["/_next/chunk.js", "/_next/chunk.js"],
  ];
  for (const [path] of paths) {
    const url = path + "?private-query#private-fragment";
    captureEvent({
      request: { url },
      exception: {
        values: [
          {
            type: "Error",
            value: "fixture",
            stacktrace: {
              frames: [
                { filename: url, abs_path: url, lineno: 17 },
                { abs_path: url, debug_id: debugId, lineno: 23, colno: 8 },
              ],
            },
          },
        ],
      },
    });
  }
  await flush();
  assert.equal(events.length, paths.length);
  for (const [index, event] of events.entries()) {
    const expected = paths[index][1];
    const frame = event.exception.values[0].stacktrace.frames[0];
    assert.deepEqual(
      [event.request.url, frame.filename, frame.abs_path, frame.lineno],
      [expected, expected, expected, 17],
    );
    const debugFrame = event.exception.values[0].stacktrace.frames[1];
    assert.deepEqual([debugFrame.abs_path, debugFrame.lineno, debugFrame.colno], [expected, 23, 8]);
    assert.deepEqual(event.debug_meta.images, [{ type: "sourcemap", code_file: expected, debug_id: debugId }]);
    assert.ok(!JSON.stringify(event).includes("private"));
  }
});

test("span envelopes retain only the origin of third-party URLs containing apostrophes", async (t) => {
  const { spans, flush } = monitoringCapture(t);
  for (const scheme of ["https:", ""]) {
    startSpan({ name: `GET ${scheme}//parent.example/O'Brien/private-root?ref=private-query`, op: "http.client" }, () =>
      startSpan(
        { name: `GET ${scheme}//child.example:8443/O'Brien/private-child#private-fragment`, op: "http.client" },
        () => {},
      ),
    );
  }
  await flush();
  assert.equal(spans.length, 4);
  assert.equal(spans.filter((span) => span.is_segment).length, 2);
  for (const span of spans) {
    assert.equal(span.name, span.is_segment ? "GET https://parent.example" : "GET https://child.example:8443");
    assert.equal(span.attributes["sentry.segment.name"].value, "GET https://parent.example");
  }
  assert.ok(!JSON.stringify(spans).includes("private-"));
});

test("handled service errors use the existing client and bounded diagnostic tags", async (t) => {
  const { events, logs, metrics: capturedMetrics, flush } = monitoringCapture(t);
  withScope((scope) => {
    scope.setUser({ email: "reader@example.com" });
    reportServiceFailure("stripe.checkout.create", "exception");
    logger.error("Private provider response", { token: "private-token" });
    metrics.count("private-recipient", 1, { attributes: { email: "reader@example.com" } });
  });
  await flush();
  assert.equal(events.length, 1);
  assert.equal(events[0].exception.values[0].value, "stripe.checkout.create failed");
  assert.deepEqual(events[0].tags, { operation: "stripe.checkout.create", failure_kind: "exception" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].body, "Service operation failed");
  assert.equal(logs[0].attributes.operation.value, "stripe.checkout.create");
  assert.equal(logs[0].attributes["sentry.environment"].value, "test");
  assert.equal(capturedMetrics.length, 1);
  assert.equal(capturedMetrics[0].name, "mfa.service.failures");
  assert.equal(capturedMetrics[0].value, 1);
  assert.equal(capturedMetrics[0].attributes.failure_kind.value, "exception");
  const payload = JSON.stringify({ events, logs, capturedMetrics });
  for (const value of ["reader@example.com", "private-token", "Private provider response", "private-recipient"]) {
    assert.ok(!payload.includes(value), value);
  }
});
