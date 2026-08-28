import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Redis connections are bounded and reused", async () => {
  const redis = await read("lib/redis.ts");

  assert.match(redis, /connectTimeout: CONNECT_TIMEOUT_MS/);
  assert.match(redis, /socketTimeout: SOCKET_TIMEOUT_MS/);
  assert.match(redis, /disableOfflineQueue: true/);
  assert.match(redis, /commandsQueueMaxLength: MAX_COMMAND_QUEUE_LENGTH/);
  assert.match(redis, /MAX_COMMAND_QUEUE_LENGTH = 100/);
  assert.match(redis, /retries >= MAX_RECONNECT_ATTEMPTS/);
  assert.match(redis, /process\.env\.UPSTASH_REDIS_URL/);
  assert.doesNotMatch(redis, /process\.env\.REDIS_URL\b/);
  assert.match(redis, /__mfaRedisStateV5/);
  assert.match(redis, /url\.protocol !== "rediss:"/);
  assert.match(redis, /Upstash Redis requires TLS/);
  assert.doesNotMatch(redis, /REDIS_ALLOW_INSECURE/);
  assert.match(redis, /Redis authentication is required/);
  assert.match(redis, /unavailableUntil = Date\.now\(\) \+ CONNECTION_COOLDOWN_MS/);
  assert.match(redis, /export function markRedisUnavailable\(\)/);
  assert.match(redis, /suspendRedis\(pendingClient\)/);
  assert.match(redis, /client\.removeAllListeners\(\)/);
});

test("Redis errors use bounded categories and are throttled independently", async () => {
  const redis = await read("lib/redis.ts");

  assert.match(redis, /type RedisErrorCategory =/);
  assert.match(redis, /lastErrorLogAt: Partial<Record<RedisErrorCategory, number>>/);
  assert.match(redis, /lastErrorLogAt\[message\]/);
  assert.doesNotMatch(redis, /lastErrorLogAt: Map/);
});

test("API rate limiting uses Redis with a privacy-preserving memory fallback", async () => {
  const [requestHelpers, rateLimiter] = await Promise.all([
    read("lib/api-request.ts"),
    read("lib/rate-limit.ts"),
  ]);

  assert.doesNotMatch(requestHelpers, /Redis|RateLimiter|createHmac/);
  assert.match(rateLimiter, /randomBytes\(32\)/);
  assert.match(rateLimiter, /createHmac\("sha256", rateLimitHashSecret\)/);
  assert.doesNotMatch(rateLimiter, /createHash/);
  assert.match(rateLimiter, /redis\.eval\(rateLimitScript/);
  assert.match(rateLimiter, /mfa:rl:v2/);
  assert.match(rateLimiter, /markRedisUnavailable\(\)/);
  assert.match(rateLimiter, /return memoryFallback\(identifier\)/);
  assert.match(rateLimiter, /count: current\.count \+ 1/);
  assert.doesNotMatch(rateLimiter, /number\[\]/);
});
