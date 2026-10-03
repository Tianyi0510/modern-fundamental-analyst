import assert from "node:assert/strict";
import test from "node:test";
import { monitoringCapture } from "../../../../scripts/sentry-test-client.mjs";
import { sendContactMessage } from "./send-contact-message.ts";

const input = {
  name: "Reader <name>",
  email: "reader@example.com",
  subject: "Research",
  message: "Message <tag>\nNext line",
  locale: "en",
};

test("contact delivery uses the verified mailbox, escapes HTML and retains reply-to and idempotency", async (t) => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousRecipient = process.env.CONTACT_TO_EMAIL;
  process.env.RESEND_API_KEY = "re_test_contact_only";
  process.env.CONTACT_TO_EMAIL = "recipient@example.com";
  t.after(() => {
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
    if (previousRecipient === undefined) delete process.env.CONTACT_TO_EMAIL;
    else process.env.CONTACT_TO_EMAIL = previousRecipient;
  });
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    requests.push(options);
    return Response.json({ id: "mock-email" });
  });
  assert.deepEqual(await sendContactMessage(input, "contact/test-id"), { ok: true });
  assert.equal(requests.length, 1);
  const payload = JSON.parse(requests[0].body);
  assert.equal(
    payload.text,
    `Name: ${input.name}\nEmail: ${input.email}\nLanguage: ${input.locale}\nSubject: ${input.subject}\n\n${input.message}`,
  );
  assert.equal(payload.reply_to, input.email);
  assert.equal(payload.to, "contact@mail.modernfundamentalanalyst.com");
  assert.match(payload.html, /Reader &lt;name&gt;/);
  assert.match(payload.html, /Message &lt;tag&gt;<br\s*\/>Next line/);
  assert.equal(new Headers(requests[0].headers).get("idempotency-key"), "contact/test-id");
});

test("provider rejection reports one safe error and retains the Contact failure response", async (t) => {
  const previousKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_test_contact_only";
  t.after(() => {
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
  });
  const { events, flush } = monitoringCapture(t);
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ name: "application_error", message: "private message reader@example.com" }, { status: 500 }),
  );
  assert.deepEqual(await sendContactMessage(input), { ok: false, error: "Message could not be sent.", status: 502 });
  await flush();
  assert.equal(events.length, 1);
  assert.equal(events[0].tags.operation, "contact.delivery");
  assert.equal(events[0].tags.failure_kind, "provider-error");
  assert.doesNotMatch(JSON.stringify(events), /private message|reader@example.com|re_test_contact_only/);
});
