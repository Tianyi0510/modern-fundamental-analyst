import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { resendOperationContext } from "@/lib/resend";

type JournalRecord = { id: string; startedAt: string; phase: string; locale: string; operation?: "subscribe" | "preferences" };
function keyFor(email: string) {
  const secret = process.env.SUBSCRIPTION_PREFERENCES_SECRET || process.env.RESEND_API_KEY;
  if (!secret) throw new Error("Subscription journal secret is unavailable");
  return `mfa:subscription-journal:v1:${createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex")}`;
}
async function client() {
  const redis = await getRedisClient();
  if (!redis) throw new Error("Subscription journal is unavailable");
  return redis;
}

// Caller holds the subscriber lock. No expiry: uncertain writes and process
// termination must remain discoverable after the short subscriber lease expires.
export async function withSubscriptionJournal<T>(email: string, locale: string, operation: () => Promise<T>, operationType: "subscribe" | "preferences" = "subscribe") {
  const redis = await client();
  const key = keyFor(email);
  const context = resendOperationContext.getStore();
  if (!context) throw new Error("Subscription journal requires a subscriber lock");
  const record: JournalRecord = { id: randomUUID(), startedAt: new Date().toISOString(), phase: "starting", locale, operation: operationType };
  let serialized = JSON.stringify(record);
  if (!await executeRedisCommand(redis, () => redis.set(key, serialized, { NX: true }))) {
    throw new Error("Subscription reconciliation required");
  }
  context.recordPhase = async phase => {
    const next = JSON.stringify({ ...record, phase });
    const updated = await executeRedisCommand(redis, () => redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]); return 1 else return 0 end",
      { keys: [key], arguments: [serialized, next] },
    ));
    if (!updated) throw new Error("Subscription journal ownership changed");
    record.phase = phase;
    serialized = next;
  };
  let cleared = false;
  try {
    const result = await operation();
    if (!context.uncertain && !context.signal.aborted) {
      const removed = await executeRedisCommand(redis, () => redis.eval(
        "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
        { keys: [key], arguments: [serialized] },
      ));
      if (!removed) throw new Error("Subscription journal ownership changed");
      cleared = true;
    }
    return result;
  } finally {
    delete context.recordPhase;
    if (!cleared) console.error("Subscription reconciliation required", { operationId: record.id, phase: record.phase });
  }
}

export async function readSubscriptionJournal(email: string): Promise<JournalRecord | null> {
  const redis = await client();
  const value = await executeRedisCommand(redis, () => redis.get(keyFor(email)));
  return value ? JSON.parse(value) as JournalRecord : null;
}

// Call under the subscriber lock only after the operator has reconciled the
// provider state. Compare the exact record to avoid clearing a newer attempt.
export async function resolveSubscriptionJournal(email: string, expectedId: string) {
  const redis = await client();
  const key = keyFor(email);
  const value = await executeRedisCommand(redis, () => redis.get(key));
  if (!value || (JSON.parse(value) as JournalRecord).id !== expectedId) throw new Error("Journal ID does not match");
  const cleared = await executeRedisCommand(redis, () => redis.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
    { keys: [key], arguments: [value] },
  ));
  if (!cleared) throw new Error("Journal changed during reconciliation");
}
