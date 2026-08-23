import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanSingleLine,
  createMemoryRateLimiter,
  isSameOrigin,
  isValidEmail,
  readLimitedJson,
  RequestBodyError,
} from "../lib/api-request.ts";

test("request helpers normalize text and validate forwarded origins", () => {
  assert.equal(cleanSingleLine("  Hello\n\tworld  ", 100), "Hello world");
  assert.equal(isSameOrigin(new Request("https://example.com/api", {
    headers: { origin: "https://example.com", host: "internal.vercel.app", "x-forwarded-host": "example.com" },
  })), true);
  assert.equal(isSameOrigin(new Request("https://example.com/api", {
    headers: { origin: "https://attacker.example", host: "example.com" },
  })), false);
});

test("email validation rejects malformed and oversized addresses", () => {
  assert.equal(isValidEmail("reader@example.com"), true);
  assert.equal(isValidEmail("reader@example"), false);
  assert.equal(isValidEmail(`reader@${"x".repeat(250)}.com`), false);
});

test("limited JSON reader checks streamed bytes without relying on Content-Length", async () => {
  const valid = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ email: "reader@example.com" }),
  });
  assert.deepEqual(await readLimitedJson(valid, 100), { email: "reader@example.com" });

  const oversized = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ message: "x".repeat(100) }),
  });
  await assert.rejects(
    readLimitedJson(oversized, 20),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
});

test("memory limiter isolates client keys and does not group missing IPs", () => {
  const limit = createMemoryRateLimiter({ windowMs: 60_000, maxRequests: 1, maxKeys: 2 });
  const from = (ip) => new Request("https://example.com/api", { headers: ip ? { "x-forwarded-for": ip } : {} });

  assert.equal(limit(from("192.0.2.1")), false);
  assert.equal(limit(from("192.0.2.1")), true);
  assert.equal(limit(from("192.0.2.2")), false);
  assert.equal(limit(from()), false);
  assert.equal(limit(from()), false);
});
