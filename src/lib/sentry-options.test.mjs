import assert from "node:assert/strict";
import test from "node:test";
import { createSentryOptions, resolveSentryDsn, sanitizeSentryEvent } from "./sentry-options.ts";

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

test("monitoring options disable sensitive collection and optional products", () => {
  const options = createSentryOptions("https://public@sentry.invalid/1", "preview");
  assert.equal(options.environment, "preview");
  assert.equal(options.sampleRate, 1);
  assert.equal(options.tracesSampleRate, undefined);
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
});
