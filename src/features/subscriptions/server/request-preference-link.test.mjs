import assert from "node:assert/strict";
import test from "node:test";

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
const { requestPreferenceLink } = await import("./request-preference-link.ts");
const { POST } = await import("@/app/api/subscription-preferences/request/route.ts");
const { readPreferenceToken } = await import("./subscription-preferences.ts");
let contactStatus;
let sendStatus;
let sends;
let keys;
test.beforeEach((t) => {
  records.clear();
  contactStatus = 200;
  sendStatus = 200;
  sends = [];
  keys = [];
  globalThis.__mfaRedisStateV6.client = redis;
  globalThis.__mfaRedisStateV6.unavailableUntil = 0;
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(new URL(url).origin, "https://api.resend.com");
    if (options.method === "GET")
      return contactStatus === 200
        ? Response.json({ id: "contact", email: "reader@example.com" })
        : Response.json({ name: "not_found", statusCode: contactStatus }, { status: contactStatus });
    assert.equal(new URL(url).pathname, "/emails");
    sends.push(JSON.parse(options.body));
    keys.push(new Headers(options.headers).get("idempotency-key"));
    return sendStatus === 200
      ? Response.json({ id: "email" })
      : Response.json({ name: "validation_error", statusCode: sendStatus }, { status: sendStatus });
  });
});
for (const locale of ["en", "zh-tw", "zh-cn"]) {
  test(`${locale}: retries retain the complete email, secure link and provider identity`, async () => {
    const key = `preferences/${locale}`;
    assert.deepEqual(await requestPreferenceLink("reader@example.com", locale, key), { ok: true });
    assert.deepEqual(await requestPreferenceLink("reader@example.com", locale, key), { ok: true });
    assert.deepEqual(sends[1], sends[0]);
    assert.deepEqual(keys, [key, key]);
    const url = new URL(sends[0].text.match(/https:\/\/[^\s]+/)[0]);
    assert.equal(url.pathname, `${locale === "en" ? "" : `/${locale}`}/subscription-preferences`);
    assert.equal(readPreferenceToken(url.searchParams.get("token"))?.email, "reader@example.com");
    assert.ok(sends[0].html.includes(url.searchParams.get("token")));
    assert.deepEqual(await requestPreferenceLink("reader@example.com", "en", key + "-new"), {
      ok: false,
      reason: "failed",
      status: 429,
    });
  });
}
function request(email, id) {
  return new Request("https://www.modernfundamentalanalyst.com/api/subscription-preferences/request", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://www.modernfundamentalanalyst.com",
      host: "www.modernfundamentalanalyst.com",
      "idempotency-key": id,
    },
    body: JSON.stringify({ email, locale: "en" }),
  });
}
test("HTTP success does not disclose whether the contact exists", async () => {
  const found = await POST(request("reader@example.com", "550e8400-e29b-41d4-a716-446655440000"));
  contactStatus = 404;
  const missing = await POST(request("missing@example.com", "550e8400-e29b-41d4-a716-446655440001"));
  assert.equal(found.status, 200);
  assert.equal(missing.status, 200);
  assert.deepEqual(await found.json(), await missing.json());
  assert.equal(sends.length, 1);
});
test("rejected delivery can retry the same payload without consuming another allowance", async () => {
  sendStatus = 422;
  assert.deepEqual(await requestPreferenceLink("reader@example.com", "en", "preferences/retry"), {
    ok: false,
    reason: "failed",
    status: 503,
  });
  sendStatus = 200;
  assert.deepEqual(await requestPreferenceLink("reader@example.com", "en", "preferences/retry"), { ok: true });
  assert.deepEqual(sends[1], sends[0]);
  assert.deepEqual(keys, ["preferences/retry", "preferences/retry"]);
});
test("lookup failure fails closed without sending", async () => {
  contactStatus = 403;
  assert.deepEqual(await requestPreferenceLink("reader@example.com", "en", "preferences/lookup"), {
    ok: false,
    reason: "failed",
    status: 503,
  });
  assert.equal(sends.length, 0);
});

test("reusing a retry identity with changed input fails without another delivery", async () => {
  await requestPreferenceLink("reader@example.com", "en", "preferences/conflict");
  const result = await requestPreferenceLink("reader@example.com", "zh-tw", "preferences/conflict");
  assert.equal(result.ok, false);
  assert.equal(result.status, 409);
  assert.equal(sends.length, 1);
});
test("missing email configuration retains the HTTP unavailable response", async (t) => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  t.after(() => {
    process.env.RESEND_API_KEY = previous;
  });
  const response = await POST(request("reader@example.com", "550e8400-e29b-41d4-a716-446655440002"));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Email service is temporarily unavailable." });
  assert.equal(sends.length, 0);
});
