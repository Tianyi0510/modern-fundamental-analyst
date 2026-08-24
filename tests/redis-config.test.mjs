import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Redis connections are bounded and reused", async () => {
  const redis = await read("lib/redis.ts");

  assert.match(redis, /connectTimeout: CONNECT_TIMEOUT_MS/);
  assert.match(redis, /socketTimeout: SOCKET_TIMEOUT_MS/);
  assert.match(redis, /disableOfflineQueue: true/);
  assert.match(redis, /retries >= MAX_RECONNECT_ATTEMPTS/);
  assert.match(redis, /process\.env\.REDIS_URL/);
  assert.match(redis, /__mfaRedisStateV2/);
  assert.match(redis, /url\.protocol !== "rediss:"/);
});

test("Redis errors are throttled independently by category", async () => {
  const redis = await read("lib/redis.ts");

  assert.match(redis, /lastErrorLogAt: Map<string, number>/);
  assert.match(redis, /lastErrorLogAt\.get\(message\)/);
  assert.match(redis, /lastErrorLogAt\.set\(message, now\)/);
});

test("API rate limiting uses Redis with a privacy-preserving memory fallback", async () => {
  const requestHelpers = await read("lib/api-request.ts");

  assert.match(requestHelpers, /createHmac\("sha256", secret\)/);
  assert.match(requestHelpers, /redis\.eval\(rateLimitScript/);
  assert.match(requestHelpers, /mfa:rate-limit:v1/);
  assert.match(requestHelpers, /return memoryFallback\(request\)/);
});
