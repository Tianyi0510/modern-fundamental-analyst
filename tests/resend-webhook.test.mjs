import assert from "node:assert/strict";
import test from "node:test";

const { getResendWebhookHeaders, getUnsubscribeRecipients } = await import("../lib/resend-webhook.ts");

test("webhook headers require the complete Svix signature set", () => {
  assert.equal(getResendWebhookHeaders(new Headers({ "svix-id": "msg_1" })), null);
  assert.deepEqual(getResendWebhookHeaders(new Headers({
    "svix-id": "msg_1",
    "svix-timestamp": "1724500000",
    "svix-signature": "v1,signature",
  })), {
    id: "msg_1",
    timestamp: "1724500000",
    signature: "v1,signature",
  });
});

test("delivery failures produce normalized, unique unsubscribe recipients", () => {
  const event = {
    type: "email.bounced",
    data: { to: [" Reader@Example.com ", "reader@example.com", "second@example.com"] },
  };
  assert.deepEqual(getUnsubscribeRecipients(event), ["reader@example.com", "second@example.com"]);
});

test("ordinary delivery events do not unsubscribe recipients", () => {
  assert.deepEqual(getUnsubscribeRecipients({ type: "email.delivered", data: { to: ["reader@example.com"] } }), []);
});
