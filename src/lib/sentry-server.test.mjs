import assert from "node:assert/strict";
import test from "node:test";
import { logger, metrics, withScope } from "@sentry/core";
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
