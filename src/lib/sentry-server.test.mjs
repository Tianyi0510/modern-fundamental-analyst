import assert from "node:assert/strict";
import test from "node:test";
import { monitoringCapture } from "../../scripts/sentry-test-client.mjs";
import { reportServiceFailure } from "./sentry-server.ts";

test("handled service errors use the existing client and bounded diagnostic tags", async (t) => {
  const { events, flush } = monitoringCapture(t);
  reportServiceFailure("stripe.checkout.create", "exception");
  await flush();
  assert.equal(events.length, 1);
  assert.equal(events[0].exception.values[0].value, "stripe.checkout.create failed");
  assert.deepEqual(events[0].tags, { operation: "stripe.checkout.create", failure_kind: "exception" });
});
