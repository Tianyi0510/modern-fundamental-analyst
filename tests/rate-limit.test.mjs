import assert from "node:assert/strict";
import test from "node:test";
import { read } from "./repository-helpers.mjs";

const { createMemoryRateLimiter, createRateLimiter } = await import("../lib/rate-limit.ts");

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
  const previousUrl = process.env.UPSTASH_REDIS_URL;
  const state = globalThis.__mfaRedisStateV5;
  const previousState = { ...state };
  let count = 0;
  let available = true;
  const redis = {
    isReady: true,
    isOpen: true,
    async eval() {
      if (!available) throw new Error("Redis unavailable");
      return ++count;
    },
    destroy() {
      this.isOpen = false;
      this.isReady = false;
    },
  };
  process.env.UPSTASH_REDIS_URL = "rediss://default:test@localhost:6379";
  Object.assign(state, { client: redis, connection: null, unavailableUntil: 0, lastErrorLogAt: {} });
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
    if (previousUrl === undefined) delete process.env.UPSTASH_REDIS_URL;
    else process.env.UPSTASH_REDIS_URL = previousUrl;
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

test("Redis rate-limit keys use a compact versioned HMAC identifier", async () => {
  const source = await read("lib/rate-limit.ts");

  assert.match(source, /RATE_LIMIT_KEY_PREFIX = "mfa:rl:v2"/);
  assert.match(source, /createHmac\("sha256", rateLimitHashSecret\)/);
  assert.match(source, /digest\("base64url"\)/);
  assert.doesNotMatch(source, /digest\("hex"\)/);
  assert.match(source, /typeof count !== "number"/);
});
