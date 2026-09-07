import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { registerHooks } from "node:module";
import test from "node:test";

const factoryUrl = `data:text/javascript,${encodeURIComponent("export const createClient = options => globalThis.__redisTestCreate(options);")}`;
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier === "@redis/client" ? factoryUrl : specifier, context);
} });

const state = globalThis.__mfaRedisStateV5 = { client: null, connection: null, lastErrorLogAt: {}, unavailableUntil: 0 };
const clients = [];
globalThis.__redisTestCreate = options => {
  const client = new EventEmitter();
  client.options = options;
  client.isOpen = false;
  client.isReady = false;
  client.destroyCount = 0;
  client.connect = () => {
    client.isOpen = true;
    return new Promise((resolve, reject) => {
      client.succeed = () => { client.isReady = true; resolve(client); };
      client.fail = reject;
    });
  };
  client.destroy = () => { client.destroyCount += 1; client.isOpen = false; client.isReady = false; };
  clients.push(client);
  return client;
};
process.env.UPSTASH_REDIS_URL = "rediss://default:test@localhost:6379";
const { getRedisClient, executeRedisCommand, markRedisUnavailable } = await import("../lib/redis.ts");

test.beforeEach(context => {
  Object.assign(state, { client: null, connection: null, lastErrorLogAt: {}, unavailableUntil: 0 });
  clients.length = 0;
  context.mock.method(console, "error", () => {});
});

async function connect() {
  const pending = getRedisClient();
  const client = clients.at(-1);
  client.succeed();
  assert.equal(await pending, client);
  return client;
}

test("concurrent cold requests wait for one ready connection", async () => {
  const first = getRedisClient();
  const second = getRedisClient();
  assert.equal(clients.length, 1);
  assert.equal(clients[0].options.commandOptions.timeout, 5_000);
  assert.equal(clients[0].options.socket.socketTimeout, undefined);
  let settled = false;
  second.then(() => { settled = true; });
  await Promise.resolve();
  assert.equal(settled, false);
  clients[0].succeed();
  assert.deepEqual(await Promise.all([first, second]), [clients[0], clients[0]]);
  assert.equal(await getRedisClient(), clients[0]);
});

test("command failure destroys only its client and enforces a recovery cooldown", async context => {
  let now = 100_000;
  context.mock.method(Date, "now", () => now);
  const client = await connect();
  await assert.rejects(executeRedisCommand(client, async () => { throw new Error("socket closed"); }));
  assert.equal(client.destroyCount, 1);
  assert.equal(await getRedisClient(), null);
  assert.equal(clients.length, 1);
  now += 30_001;
  const recovered = await connect();
  assert.notEqual(recovered, client);
  assert.equal(state.unavailableUntil, 0);
});

test("an old command failure cannot disable a recovered connection", async () => {
  const old = await connect();
  let reject;
  const pending = executeRedisCommand(old, () => new Promise((_resolve, rejectPromise) => { reject = rejectPromise; }));
  markRedisUnavailable(old);
  state.unavailableUntil = 0;
  const recovered = await connect();
  reject(new Error("delayed old failure"));
  await assert.rejects(pending);
  assert.equal(state.client, recovered);
  assert.equal(state.unavailableUntil, 0);
  assert.equal(recovered.destroyCount, 0);
});

test("superseded connection completion cannot clear a newer connection promise", async () => {
  const first = getRedisClient();
  const old = clients[0];
  markRedisUnavailable(old);
  state.unavailableUntil = 0;
  const second = getRedisClient();
  const activeConnection = state.connection;
  old.succeed();
  await assert.rejects(first, /superseded/);
  assert.equal(state.connection, activeConnection);
  assert.equal(state.unavailableUntil, 0);
  clients[1].succeed();
  assert.equal(await second, clients[1]);
});

test("discarded sockets retain an error listener for late events", async () => {
  const client = await connect();
  markRedisUnavailable(client);
  assert.doesNotThrow(() => client.emit("error", new Error("late socket event")));
});

test("a stalled authentication handshake is destroyed after the readiness deadline", async context => {
  let expire;
  context.mock.method(globalThis, "setTimeout", (callback, delay) => {
    assert.equal(delay, 10_000);
    expire = callback;
    return 1;
  });
  const pending = getRedisClient();
  expire();
  await assert.rejects(pending, /readiness timeout/);
  assert.equal(clients[0].destroyCount, 1);
  assert.equal(await getRedisClient(), null);
  clients[0].fail(new Error("socket destroyed"));
});
