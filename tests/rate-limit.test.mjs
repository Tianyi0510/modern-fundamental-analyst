import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { createMemoryRateLimiter, createRateLimiter } = await import("../lib/rate-limit.ts");
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

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

test("rate limiter rejects invalid resource bounds and namespaces", () => {
  assert.throws(() => createMemoryRateLimiter({ windowMs: 0, maxRequests: 1 }), RangeError);
  assert.throws(() => createMemoryRateLimiter({ windowMs: 1000, maxRequests: 0 }), RangeError);
  assert.throws(() => createMemoryRateLimiter({ windowMs: 1000, maxRequests: 1, maxKeys: 0 }), RangeError);
  assert.throws(() => createRateLimiter({ namespace: "invalid:namespace", windowMs: 1000, maxRequests: 1 }), RangeError);
});

test("Redis rate-limit keys use a compact versioned HMAC identifier", async () => {
  const source = await read("lib/rate-limit.ts");

  assert.match(source, /RATE_LIMIT_KEY_PREFIX = "mfa:rl:v2"/);
  assert.match(source, /createHmac\("sha256", rateLimitHashSecret\)/);
  assert.match(source, /digest\("base64url"\)/);
  assert.doesNotMatch(source, /digest\("hex"\)/);
  assert.match(source, /typeof count !== "number"/);
});
