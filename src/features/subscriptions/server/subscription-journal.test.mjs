import assert from "node:assert/strict";
import test from "node:test";

process.env.SUBSCRIPTION_PREFERENCES_SECRET = "test-only-journal-secret";
process.env.UPSTASH_KV_REST_API_URL = "https://redis.example.com";
process.env.UPSTASH_KV_REST_API_TOKEN = "test-only-token";
let stored = null;
let clears = 0;
const redis = {
  async get() {
    return stored;
  },
  async eval() {
    clears++;
    stored = null;
    return 1;
  },
};
globalThis.__mfaRedisStateV6 = { client: redis, lastErrorLogAt: {}, unavailableUntil: 0 };
const { readSubscriptionJournal, resolveSubscriptionJournal } = await import("./subscription-journal.ts");
const record = { id: "operation-1", startedAt: "2026-10-17T00:00:00.000Z", phase: "starting", locale: "en" };

test("journal reads support legacy records and validated operation types", async () => {
  stored = null;
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
  for (const value of [record, { ...record, operation: "subscribe" }, { ...record, operation: "preferences" }]) {
    stored = JSON.stringify(value);
    assert.deepEqual(await readSubscriptionJournal("reader@example.com"), value);
  }
});

test("malformed journal records cannot be mistaken for absence or cleared", async () => {
  clears = 0;
  for (const value of [
    "",
    "{",
    "null",
    "[]",
    "1",
    JSON.stringify({ id: "operation-1" }),
    JSON.stringify({ ...record, id: 1 }),
    JSON.stringify({ ...record, startedAt: "invalid" }),
    JSON.stringify({ ...record, phase: "" }),
    JSON.stringify({ ...record, locale: null }),
    JSON.stringify({ ...record, operation: "delete" }),
  ]) {
    stored = value;
    await assert.rejects(readSubscriptionJournal("reader@example.com"), /Invalid subscription journal record/);
    await assert.rejects(
      resolveSubscriptionJournal("reader@example.com", record.id),
      /Invalid subscription journal record/,
    );
    assert.equal(stored, value);
  }
  assert.equal(clears, 0);
});
