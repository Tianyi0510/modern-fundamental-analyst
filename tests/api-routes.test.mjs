import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") return nextResolve("next/server.js", context);
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { POST: contact } = await import("../app/api/contact/route.ts");
const { POST: subscribe } = await import("../app/api/subscribe/route.ts");

const encoder = new TextEncoder();
let requestNumber = 0;

function request(path, body, options = {}) {
  requestNumber += 1;
  const origin = options.origin ?? "https://www.modernfundamentalanalyst.com";
  const host = options.host ?? "www.modernfundamentalanalyst.com";
  const headers = {
    "content-type": "application/json",
    host,
    origin,
    "x-forwarded-for": options.ip ?? `192.0.2.${requestNumber}`,
  };

  if (options.stream) {
    return new Request(`${origin}${path}`, {
      method: "POST",
      headers,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(body));
          controller.close();
        },
      }),
      duplex: "half",
    });
  }

  return new Request(`${origin}${path}`, { method: "POST", headers, body });
}

test("contact and subscribe routes reject cross-origin requests", async () => {
  const payload = JSON.stringify({ website: "bot" });
  const contactResponse = await contact(request("/api/contact", payload, { origin: "https://attacker.example" }));
  const subscribeResponse = await subscribe(request("/api/subscribe", payload, { origin: "https://attacker.example" }));

  assert.equal(contactResponse.status, 403);
  assert.equal(subscribeResponse.status, 403);
});

test("routes enforce streamed body limits without Content-Length", async () => {
  const contactRequest = request("/api/contact", JSON.stringify({ message: "x".repeat(20_100) }), { stream: true });
  const subscribeRequest = request("/api/subscribe", JSON.stringify({ email: `${"x".repeat(5_100)}@example.com` }), { stream: true });

  assert.equal(contactRequest.headers.has("content-length"), false);
  assert.equal(subscribeRequest.headers.has("content-length"), false);
  assert.equal((await contact(contactRequest)).status, 413);
  assert.equal((await subscribe(subscribeRequest)).status, 413);
});

test("routes reject malformed JSON before calling external services", async () => {
  assert.equal((await contact(request("/api/contact", "{"))).status, 400);
  assert.equal((await subscribe(request("/api/subscribe", "{"))).status, 400);
});

test("routes reject invalid form values before calling Resend", async () => {
  const contactPayload = JSON.stringify({ name: "Reader", email: "invalid", subject: "Hello", message: "A valid message body" });
  const subscribePayload = JSON.stringify({ email: "invalid" });

  assert.equal((await contact(request("/api/contact", contactPayload))).status, 400);
  assert.equal((await subscribe(request("/api/subscribe", subscribePayload))).status, 400);
});

test("honeypot submissions succeed without calling Resend", async () => {
  const contactPayload = JSON.stringify({ name: "Bot", email: "bot@example.com", subject: "Hello", message: "A valid message body", website: "filled" });
  const subscribePayload = JSON.stringify({ email: "bot@example.com", website: "filled" });

  assert.deepEqual(await (await contact(request("/api/contact", contactPayload))).json(), { ok: true });
  assert.deepEqual(await (await subscribe(request("/api/subscribe", subscribePayload))).json(), { ok: true });
});

test("route-level rate limits reject the sixth request from one client", async () => {
  const contactPayload = JSON.stringify({ website: "filled" });
  const subscribePayload = JSON.stringify({ website: "filled" });
  let contactResponse;
  let subscribeResponse;

  for (let index = 0; index < 6; index += 1) {
    contactResponse = await contact(request("/api/contact", contactPayload, { ip: "198.51.100.10" }));
    subscribeResponse = await subscribe(request("/api/subscribe", subscribePayload, { ip: "198.51.100.20" }));
  }

  assert.equal(contactResponse.status, 429);
  assert.equal(subscribeResponse.status, 429);
});
