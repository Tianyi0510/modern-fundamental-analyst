import assert from "node:assert/strict";
import test from "node:test";

const { getResendClient, runResendOperation } = await import("../lib/resend.ts");

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

test("Resend operation boundary converts thrown provider failures to null", async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (...values) => logs.push(values);

  try {
    const result = await runResendOperation("Resend test failed", async () => {
      throw new TypeError("private provider details");
    });
    assert.equal(result, null);
    assert.deepEqual(logs, [["Resend test failed", "TypeError"]]);
  } finally {
    console.error = originalError;
  }
});
