import assert from "node:assert/strict";
import test from "node:test";

const state = (globalThis.__mfaRedisStateV6 = { client: null, lastErrorLogAt: {}, unavailableUntil: 0 });
process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-only-token";
const { getRedisClient, executeRedisCommand, markRedisUnavailable } = await import("./redis.ts");

test.beforeEach((context) => {
  Object.assign(state, { client: null, lastErrorLogAt: {}, unavailableUntil: 0 });
  context.mock.method(console, "error", () => {});
});

test("concurrent requests share a REST client without a readiness handshake", async () => {
  const [first, second] = await Promise.all([getRedisClient(), getRedisClient()]);
  assert.equal(first, second);
  assert.equal(await getRedisClient(), first);
});

test("REST preserves raw JSON, NX, TTL and Lua arguments with a fresh deadline per request", async (context) => {
  const calls = [];
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    const command = JSON.parse(options.body);
    calls.push({ command, signal: options.signal });
    const result = command[0] === "get" ? '{"phase":"starting"}' : command[0] === "eval" ? 1 : "OK";
    return Response.json({ result });
  });
  const redis = await getRedisClient();
  const raw = await executeRedisCommand(redis, () => redis.get("mfa:journal"));
  assert.equal(raw, '{"phase":"starting"}');
  await executeRedisCommand(redis, () => redis.set("mfa:lease", "owner", { nx: true, px: 120000 }));
  await executeRedisCommand(redis, () => redis.eval("return ARGV[1]", ["mfa:journal"], [raw]));
  assert.deepEqual(calls[1].command, ["set", "mfa:lease", "owner", "nx", "px", 120000]);
  assert.deepEqual(calls[2].command, ["eval", "return ARGV[1]", 1, "mfa:journal", raw]);
  assert.notEqual(calls[0].signal, calls[1].signal);
  assert.equal(calls[1].signal.aborted, false);
});

test("a lost write response is propagated once and starts cooldown without replay", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", async () => {
    calls++;
    throw new TypeError("response lost");
  });
  const redis = await getRedisClient();
  await assert.rejects(
    executeRedisCommand(redis, () => redis.set("mfa:lease", "owner", { nx: true })),
    /response lost/,
  );
  assert.equal(calls, 1);
  assert.equal(await getRedisClient(), null);
  assert.equal(calls, 1);
  state.unavailableUntil = 0;
  assert.notEqual(await getRedisClient(), redis);
});

test("a stalled REST response is aborted without a write retry", async (context) => {
  let calls = 0;
  const timeout = AbortSignal.timeout;
  context.mock.method(AbortSignal, "timeout", (duration) => {
    assert.equal(duration, 5000);
    return timeout(10);
  });
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    calls++;
    return new Promise((_resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("deadline did not abort request")), 500);
      options.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(options.signal.reason);
        },
        { once: true },
      );
    });
  });
  const redis = await getRedisClient();
  await assert.rejects(
    executeRedisCommand(redis, () => redis.eval("return redis.call('INCR', KEYS[1])", ["mfa:counter"], [])),
    { name: "TimeoutError" },
  );
  assert.equal(calls, 1);
});

test("an old failure cannot disable a recovered client", async () => {
  const old = await getRedisClient();
  let reject;
  const pending = executeRedisCommand(
    old,
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  markRedisUnavailable(old);
  state.unavailableUntil = 0;
  const current = await getRedisClient();
  reject(new Error("late failure"));
  await assert.rejects(pending);
  assert.equal(state.client, current);
  assert.equal(state.unavailableUntil, 0);
});

test("missing credentials and insecure URLs fail closed", async () => {
  const original = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  try {
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal(await getRedisClient(), null);
    process.env.UPSTASH_REDIS_REST_TOKEN = token;
    for (const url of [
      "http://redis.example.com",
      "rediss://user:password@redis.example.com",
      "https://user:password@redis.example.com",
    ]) {
      process.env.UPSTASH_REDIS_REST_URL = url;
      assert.equal(await getRedisClient(), null);
    }
  } finally {
    process.env.UPSTASH_REDIS_REST_URL = original;
    process.env.UPSTASH_REDIS_REST_TOKEN = token;
  }
});
