import assert from "node:assert/strict";
import test from "node:test";
import { sendContactMessage } from "./contact-api.ts";
import { PostJsonError } from "@/lib/client-post-json.ts";

test("contact requests retain all fields and the caller's retry identity", async (t) => {
  const input = {
    name: "Reader",
    email: "reader@example.com",
    subject: "Research",
    message: "A question.",
    website: "",
    locale: "zh-tw",
  };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/contact");
    assert.deepEqual(JSON.parse(options.body), input);
    assert.equal(new Headers(options.headers).get("Idempotency-Key"), "same-attempt");
    return Response.json({ ok: true });
  });
  assert.equal(await sendContactMessage(input, "same-attempt"), undefined);
});

test("contact request failures retain their HTTP status", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 429 }));
  await assert.rejects(
    sendContactMessage(
      {
        name: "Reader",
        email: "reader@example.com",
        subject: "Research",
        message: "A question.",
        website: "",
        locale: "en",
      },
      "attempt",
    ),
    (error) => error instanceof PostJsonError && error.status === 429,
  );
});
