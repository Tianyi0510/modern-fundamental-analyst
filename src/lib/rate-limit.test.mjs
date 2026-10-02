import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
process.env.SUBSCRIPTION_PREFERENCES_SECRET = "test-stable-secret";

const { createMemoryRateLimiter, createRateLimiter } = await import("./rate-limit.ts");

test("memory limiter isolates client keys and does not group missing IPs", () => {
  const limit = createMemoryRateLimiter({ windowMs: 60_000, maxRequests: 1, maxKeys: 2 });
  const from = (ip) => new Request("https://example.com/api", { headers: ip ? { "x-forwarded-for": ip } : {} });

  assert.equal(limit(from("192.0.2.1")), false);
  assert.equal(limit(from("192.0.2.1")), true);
  assert.equal(limit(from("192.0.2.2")), false);
  assert.equal(limit(from()), false);
  assert.equal(limit(from()), false);
});

test("memory limiter uses bounded fixed-window counters", () => {
  const originalNow = Date.now;
  let now = 1_000;
  Date.now = () => now;

  try {
    const limit = createMemoryRateLimiter({ windowMs: 100, maxRequests: 2 });
    const request = new Request("https://example.com/api", { headers: { "x-forwarded-for": "192.0.2.10" } });
    assert.equal(limit(request), false);
    now = 1_099;
    assert.equal(limit(request), false);
    assert.equal(limit(request), true);
    now = 1_100;
    assert.equal(limit(request), false);
  } finally {
    Date.now = originalNow;
  }
});

test("Redis failover keeps the visitor's already used allowance", async (context) => {
  const previousUrl = process.env.UPSTASH_KV_REST_API_URL;
  const state = globalThis.__mfaRedisStateV6;
  const previousState = { ...state };
  let count = 0;
  let available = true;
  const redis = {
    async eval() {
      if (!available) throw new Error("Redis unavailable");
      return ++count;
    },
  };
  process.env.UPSTASH_KV_REST_API_URL = "https://redis.example.com";
  process.env.UPSTASH_KV_REST_API_TOKEN = "test-only-token";
  Object.assign(state, { client: redis, unavailableUntil: 0, lastErrorLogAt: {} });
  context.mock.method(console, "error", () => {});
  try {
    const limit = createRateLimiter({ namespace: "failover", windowMs: 60_000, maxRequests: 2 });
    const request = new Request("https://example.com/api", { headers: { "x-forwarded-for": "192.0.2.10" } });
    assert.equal(await limit(request), false);
    assert.equal(await limit(request), false);
    available = false;
    assert.equal(await limit(request), true);
    assert.equal(await limit(request), true);
    assert.equal(count, 2);
  } finally {
    if (previousUrl === undefined) delete process.env.UPSTASH_KV_REST_API_URL;
    else process.env.UPSTASH_KV_REST_API_URL = previousUrl;
    Object.assign(state, previousState);
  }
});

test("rate limiter rejects invalid resource bounds and namespaces", () => {
  assert.throws(() => createMemoryRateLimiter({ windowMs: 0, maxRequests: 1 }), RangeError);
  assert.throws(() => createMemoryRateLimiter({ windowMs: 1000, maxRequests: 0 }), RangeError);
  assert.throws(() => createMemoryRateLimiter({ windowMs: 1000, maxRequests: 1, maxKeys: 0 }), RangeError);
  assert.throws(
    () => createRateLimiter({ namespace: "invalid:namespace", windowMs: 1000, maxRequests: 1 }),
    RangeError,
  );
});

test("derived identities keep an existing allowance without a separate hash secret", async () => {
  const state = globalThis.__mfaRedisStateV6;
  const previous = { ...state };
  const oldUrl = process.env.UPSTASH_KV_REST_API_URL;
  const oldToken = process.env.UPSTASH_KV_REST_API_TOKEN;
  const secret = createHmac("sha256", "test-stable-secret").update("mfa:rate-limit:hash:v1").digest();
  const hash = createHmac("sha256", secret).update("rate-limit:192.0.2.99").digest("base64url");
  const key = `mfa:rl:v2:stable:${hash}`;
  const counters = new Map([[key, 1]]);
  process.env.UPSTASH_KV_REST_API_URL = "https://redis.example.com";
  process.env.UPSTASH_KV_REST_API_TOKEN = "test-only-token";
  Object.assign(state, {
    unavailableUntil: 0,
    client: {
      async eval(_script, keys, args) {
        assert.deepEqual(keys, [key]);
        assert.deepEqual(args, ["60000"]);
        const count = (counters.get(key) ?? 0) + 1;
        counters.set(key, count);
        return count;
      },
    },
  });
  try {
    const limit = createRateLimiter({ namespace: "stable", windowMs: 60000, maxRequests: 1 });
    assert.equal(await limit(new Request("https://example.com", { headers: { "x-real-ip": "192.0.2.99" } })), true);
    assert.equal(counters.get(key), 2);
  } finally {
    if (oldUrl === undefined) delete process.env.UPSTASH_KV_REST_API_URL;
    else process.env.UPSTASH_KV_REST_API_URL = oldUrl;
    if (oldToken === undefined) delete process.env.UPSTASH_KV_REST_API_TOKEN;
    else process.env.UPSTASH_KV_REST_API_TOKEN = oldToken;
    Object.assign(state, previous);
  }
});
