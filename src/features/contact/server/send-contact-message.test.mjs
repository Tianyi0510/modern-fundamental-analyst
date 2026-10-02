import assert from "node:assert/strict";
import test from "node:test";
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
