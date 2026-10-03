import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

process.env.UPSTASH_KV_REST_API_URL = "https://redis.example.com";
process.env.UPSTASH_KV_REST_API_TOKEN = "test-only-token";
process.env.RESEND_API_KEY = "re_test_confirm";
process.env.SUBSCRIPTION_PREFERENCES_SECRET = "test-only-stable-key";
let now = Date.now();
const records = new Map();
const read = (key) => {
  const record = records.get(key);
  if (record?.until <= now) {
    records.delete(key);
    return null;
  }
  return record?.value ?? null;
};
const redis = {
  async get(key) {
    return read(key);
  },
  async set(key, value, options = {}) {
    if (options.nx && read(key) !== null) return null;
    records.set(key, { value, until: options.ex ? now + options.ex * 1000 : options.px ? now + options.px : Infinity });
    return "OK";
  },
  async eval(script, keys, args) {
    if (keys.length === 3) {
      assert.match(script, /EXPIRE/);
      if (read(keys[2])) return 1;
      if (read(keys[0]) || Number(read(keys[1]) ?? 0) >= 3) return 0;
      const count = Number(read(keys[1]) ?? 0);
      await this.set(keys[0], "1", { ex: 60 });
      const until = records.get(keys[1])?.until;
      await this.set(keys[1], count + 1, { ex: 3600 });
      if (count) records.get(keys[1]).until = until;
      await this.set(keys[2], "1", { ex: 1500 });
      return 1;
    }
    if (read(keys[0]) !== args[0]) return 0;
    if (args.length === 2) {
      await this.set(keys[0], args[1]);
      return 1;
    }
    return Number(records.delete(keys[0]));
  },
};
globalThis.__mfaRedisStateV6 = { client: redis, lastErrorLogAt: {}, unavailableUntil: 0 };
registerHooks({
  resolve(specifier, context, next) {
    return next(specifier === "next/server" ? "next/server.js" : specifier, context);
  },
});
const { requestSubscriptionConfirmation, confirmSubscription } = await import("./subscription-confirmation.ts");
const { requireRecipientAllowance, isDeliverySuppressed } = await import("./recipient-delivery.ts");
const { processDeliveryFeedback } = await import("./resend-webhook.ts");
const { updateSubscriptionPreferences } = await import("./update-subscription-preferences.ts");
const { POST: subscribe } = await import("@/app/api/subscribe/route.ts");
const { POST: confirmRoute } = await import("@/app/api/subscription-confirmation/route.ts");
const { subscriptionKey } = await import("./resend-coordination.ts");
let active;
let sends;
let writes;
let eventOutcome;
const memo = () => ({ title: "Example", summary: "Research", slug: "example" });
function token() {
  return new URL(sends[0].text.match(/https:\/\/[^\s]+/)[0]).searchParams.get("token");
}
function request(path, body, id = "550e8400-e29b-41d4-a716-446655440000") {
  return new Request(`https://www.modernfundamentalanalyst.com${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "www.modernfundamentalanalyst.com",
      origin: "https://www.modernfundamentalanalyst.com",
      "idempotency-key": id,
    },
    body: JSON.stringify(body),
  });
}
test.beforeEach((t) => {
  records.clear();
  active = null;
  sends = [];
  writes = [];
  eventOutcome = "ok";
  globalThis.__mfaRedisStateV6.client = redis;
  globalThis.__mfaRedisStateV6.unavailableUntil = 0;
  t.mock.method(Date, "now", () => now);
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const path = new URL(url).pathname;
    if (path === "/emails") {
      sends.push(JSON.parse(options.body));
      return Response.json({ id: "mail" });
    }
    if (options.method === "GET") {
      if (path.includes("/segments")) return Response.json({ data: [], has_more: false });
      return active == null
        ? Response.json({ name: "not_found", statusCode: 404 }, { status: 404 })
        : Response.json({ id: "contact", unsubscribed: !active });
    }
    writes.push({ path, body: JSON.parse(options.body ?? "{}") });
    if (path.includes("/events")) {
      if (eventOutcome === "unknown") throw new TypeError("lost response");
      if (eventOutcome === "rejected")
        return Response.json({ name: "validation_error", statusCode: 422 }, { status: 422 });
    } else if (path.startsWith("/contacts") && !path.includes("/segments"))
      active = !JSON.parse(options.body).unsubscribed;
    return Response.json({ id: "contact" });
  });
});

for (const locale of ["en", "zh-tw", "zh-cn"])
  test(`${locale}: public signup only emails; explicit confirmation activates once`, async () => {
    const response = await subscribe(request("/api/subscribe", { email: "reader@example.com", locale }));
    assert.equal(response.status, 200);
    assert.equal(active, null);
    assert.equal(writes.length, 0);
    assert.equal(sends.length, 1);
    assert.match(sends[0].html, /24/);
    const value = token();
    assert.equal(value.length, 43);
    assert.ok(![...records.keys()].some((key) => key.includes(value)));
    await confirmSubscription(value, memo);
    assert.equal(active, true);
    assert.equal(writes.filter((w) => w.path.includes("/events")).length, 1);
    const consent = JSON.parse(read(subscriptionKey("consent", "reader@example.com")));
    assert.equal(consent.locale, locale);
    assert.equal(consent.policy, "research-updates-v1");
    await updateSubscriptionPreferences({ email: "reader@example.com" }, locale, "unsubscribe");
    assert.equal(active, false);
    const count = writes.length;
    await confirmSubscription(value, memo);
    assert.equal(writes.length, count);
    assert.equal(active, false);
  });

test("same submission retries preserve the confirmation link and do not spend another recipient allowance", async () => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/request-1");
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/request-1");
  assert.deepEqual(sends[0], sends[1]);
  await assert.rejects(requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/request-2"), {
    status: 429,
  });
  assert.equal(sends.length, 2);
});

test("recipient limit spans IPs/request IDs and enforces both cooldown and hourly cap", async () => {
  await requireRecipientAllowance("reader@example.com", "a");
  await requireRecipientAllowance("reader@example.com", "a");
  await assert.rejects(requireRecipientAllowance("reader@example.com", "b"), { status: 429 });
  now += 60_001;
  await requireRecipientAllowance("reader@example.com", "b");
  now += 60_001;
  await requireRecipientAllowance("reader@example.com", "c");
  now += 60_001;
  await assert.rejects(requireRecipientAllowance("reader@example.com", "d"), { status: 429 });
  await requireRecipientAllowance("another@example.com", "d");
  now += 3_600_000;
  await requireRecipientAllowance("reader@example.com", "d");
});

test("expired and malformed tokens never mutate providers", async () => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  const value = token();
  now += 86_400_001;
  await assert.rejects(confirmSubscription(value, memo), { status: 400 });
  await assert.rejects(confirmSubscription("malformed", memo), { status: 400 });
  assert.equal(writes.length, 0);
});

test("confirmation rejects cross-origin posts", async () => {
  const incoming = request("/api/subscription-confirmation", { token: "a".repeat(43) });
  incoming.headers.set("origin", "https://other.example.com");
  assert.equal((await confirmRoute(incoming)).status, 403);
  assert.equal(writes.length, 0);
});

for (const outcome of ["rejected", "unknown"])
  test(`${outcome} welcome retains confirmed consent and journal without rollback`, async () => {
    eventOutcome = outcome;
    await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
    await confirmSubscription(token(), memo);
    assert.equal(active, true);
    assert.equal(writes.filter((w) => w.path.includes("/events")).length, 1);
    const journal = [...records.entries()].find(([key]) => key.startsWith("mfa:subscription-journal:"));
    assert.equal(JSON.parse(journal[1].value).phase, "send-welcome-event");
    assert.ok(writes.every((w) => w.body.unsubscribed !== true));
  });

test("duplicate webhook feedback is applied once and prevents public reactivation", async () => {
  active = true;
  const event = { type: "email.complained", data: { to: ["reader@example.com"] } };
  await processDeliveryFeedback(event, "event-1");
  assert.equal(active, false);
  assert.equal(await isDeliverySuppressed("reader@example.com"), true);
  const count = writes.length;
  await processDeliveryFeedback(event, "event-1");
  assert.equal(writes.length, count);
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  assert.equal(sends.length, 0);
  assert.equal(active, false);
});

test("failed webhook provider write is not marked done and remains retryable", async (t) => {
  const { getResendClient } = await import("@/lib/resend.ts");
  const client = getResendClient();
  const updateMock = t.mock.method(client.contacts, "update", async () => ({ error: { statusCode: 429 } }));
  const event = { type: "email.bounced", data: { to: ["reader@example.com"] } };
  await assert.rejects(processDeliveryFeedback(event, "event-1"));
  assert.ok(![...records.keys()].some((key) => key.startsWith("mfa:resend:webhook:")));
  updateMock.mock.restore();
  await processDeliveryFeedback(event, "event-1");
  assert.ok([...records.keys()].some((key) => key.startsWith("mfa:resend:webhook:")));
});

test("suppression arriving after confirmation mail blocks its activation", async () => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  const value = token();
  await processDeliveryFeedback({ type: "email.complained", data: { to: ["reader@example.com"] } }, "event-1");
  const count = writes.length;
  await assert.rejects(confirmSubscription(value, memo), { status: 403 });
  assert.equal(writes.length, count);
});

test("concurrent confirmation consumes a token once", async () => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  const value = token();
  const results = await Promise.allSettled([confirmSubscription(value, memo), confirmSubscription(value, memo)]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(writes.filter((w) => w.path.includes("/events")).length, 1);
  await confirmSubscription(value, memo);
  assert.equal(writes.filter((w) => w.path.includes("/events")).length, 1);
});

test("a read failure before activation leaves the confirmation retryable", async (t) => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  const value = token();
  const { getResendClient } = await import("@/lib/resend.ts");
  const lookup = t.mock.method(getResendClient().contacts, "get", async () => ({ error: { statusCode: 503 } }));
  await assert.rejects(confirmSubscription(value, memo));
  assert.equal(writes.length, 0);
  lookup.mock.restore();
  await confirmSubscription(value, memo);
  assert.equal(active, true);
});

test("unknown activation outcome keeps the token and journal blocked", async (t) => {
  await requestSubscriptionConfirmation("reader@example.com", "en", "subscribe/a");
  const value = token();
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    if (options.method === "GET") return Response.json({ name: "not_found", statusCode: 404 }, { status: 404 });
    writes.push({ path: "ambiguous-create" });
    throw new TypeError("lost response");
  });
  await assert.rejects(confirmSubscription(value, memo));
  now += 120_001;
  await assert.rejects(confirmSubscription(value, memo));
  assert.equal(writes.length, 1);
  assert.ok([...records.keys()].some((key) => key.startsWith("mfa:subscription-journal:")));
});

test("expired request identity returns a recovery error rather than duplicate subscription", async () => {
  const body = { email: "reader@example.com", locale: "en" };
  assert.equal((await subscribe(request("/api/subscribe", body))).status, 200);
  now += 25 * 60 * 1000;
  assert.equal((await subscribe(request("/api/subscribe", body))).status, 422);
  assert.equal(sends.length, 1);
});
