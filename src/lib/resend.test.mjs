import assert from "node:assert/strict";
import test from "node:test";
import { monitoringCapture } from "../../scripts/sentry-test-client.mjs";

const { getResendClient, getResendIdempotencyKey, runResendOperation } = await import("./resend.ts");

test("Resend email idempotency keys are scoped and accept only UUID request IDs", () => {
  const request = new Request("https://example.com", {
    headers: { "Idempotency-Key": "550E8400-E29B-41D4-A716-446655440000" },
  });

  assert.equal(getResendIdempotencyKey(request, "contact"), "contact/550e8400-e29b-41d4-a716-446655440000");
  assert.equal(getResendIdempotencyKey(request, "preferences"), "preferences/550e8400-e29b-41d4-a716-446655440000");
  assert.equal(getResendIdempotencyKey(new Request("https://example.com"), "contact"), undefined);
  assert.equal(
    getResendIdempotencyKey(
      new Request("https://example.com", { headers: { "Idempotency-Key": "invalid" } }),
      "contact",
    ),
    undefined,
  );
});

test("Resend client is reused until its API key changes", () => {
  const originalKey = process.env.RESEND_API_KEY;

  try {
    process.env.RESEND_API_KEY = "re_test_key_one";
    const first = getResendClient();
    assert.equal(getResendClient(), first);

    process.env.RESEND_API_KEY = "re_test_key_two";
    assert.notEqual(getResendClient(), first);
  } finally {
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});

test("Resend operation boundary returns successful provider responses", async () => {
  const result = await runResendOperation("Resend test failed", async () => ({ data: { id: "contact-id" } }));
  assert.deepEqual(result, { data: { id: "contact-id" } });
});

test("returned provider failures emit one sanitized error, log and metric without changing the result", async (t) => {
  const capture = monitoringCapture(t);
  const response = {
    data: null,
    error: { name: "application_error", statusCode: 500, message: "private provider details" },
  };
  assert.equal(await runResendOperation("Synthetic provider failure", async () => response), response);
  await capture.flush();
  assert.equal(capture.events.length, 1);
  assert.deepEqual(capture.events[0].tags, { operation: "resend.request", failure_kind: "provider-error" });
  assert.equal(capture.logs.length, 1);
  assert.equal(capture.metrics.length, 1);
  assert.doesNotMatch(JSON.stringify(capture), /private provider details|application_error/);
});

test("only explicitly expected provider statuses bypass monitoring", async (t) => {
  const capture = monitoringCapture(t);
  const missing = { data: null, error: { name: "not_found", statusCode: 404 } };
  assert.equal(
    await runResendOperation("Expected missing contact", async () => missing, { expectedStatuses: [404] }),
    missing,
  );
  assert.deepEqual(await runResendOperation("Success", async () => ({ data: { id: "contact" }, error: null })), {
    data: { id: "contact" },
    error: null,
  });
  await capture.flush();
  assert.equal(capture.events.length, 0);
  assert.equal(capture.logs.length, 0);
  assert.equal(capture.metrics.length, 0);
  await runResendOperation("Unexpected missing resource", async () => missing);
  await capture.flush();
  assert.equal(capture.events.length, 1);
});

test("Resend operation boundary converts thrown provider failures to null", async (t) => {
  const { events, flush } = monitoringCapture(t);
  const originalError = console.error;
  const logs = [];
  console.error = (...values) => logs.push(values);

  try {
    const result = await runResendOperation("Resend test failed", async () => {
      throw new TypeError("private provider details");
    });
    assert.equal(result, null);
    assert.deepEqual(logs, [["Resend test failed", "TypeError"]]);
    await flush();
    assert.equal(events.length, 1);
    assert.equal(events[0].tags.operation, "resend.request");
    assert.doesNotMatch(JSON.stringify(events), /private provider details/);
  } finally {
    console.error = originalError;
  }
});
