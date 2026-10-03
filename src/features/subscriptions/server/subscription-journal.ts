import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { resendOperationContext } from "@/lib/resend";

type JournalRecord = {
  id: string;
  startedAt: string;
  phase: string;
  locale: string;
  operation?: "subscribe" | "preferences";
};
function keyFor(email: string) {
  const secret = process.env.SUBSCRIPTION_PREFERENCES_SECRET;
  if (!secret) throw new Error("SUBSCRIPTION_PREFERENCES_SECRET is required for subscription journals");
  return `mfa:subscription-journal:v1:${createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex")}`;
}
function client() {
  const redis = getRedisClient();
  if (!redis) throw new Error("Subscription journal is unavailable");
  return redis;
}

// Caller holds the subscriber lock. No expiry: uncertain writes and process
// termination must remain discoverable after the short subscriber lease expires.
export async function withSubscriptionJournal<T>(
  email: string,
  locale: string,
  operation: () => Promise<T>,
  operationType: "subscribe" | "preferences" = "subscribe",
) {
  const key = keyFor(email);
  const redis = client();
  const context = resendOperationContext.getStore();
  if (!context) throw new Error("Subscription journal requires a subscriber lock");
  const record: JournalRecord = {
    id: randomUUID(),
    startedAt: new Date().toISOString(),
    phase: "starting",
    locale,
    operation: operationType,
  };
  let serialized = JSON.stringify(record);
  if (!(await executeRedisCommand(redis, () => redis.set(key, serialized, { nx: true })))) {
    throw new Error("Subscription reconciliation required");
  }
  context.recordPhase = async (phase) => {
    const next = JSON.stringify({ ...record, phase });
    const updated = await executeRedisCommand(redis, () =>
      redis.eval(
        "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]); return 1 else return 0 end",
        [key],
        [serialized, next],
      ),
    );
    if (!updated) throw new Error("Subscription journal ownership changed");
    record.phase = phase;
    serialized = next;
  };
  let completed = false;
  let result!: T;
  let failure: unknown;
  try {
    result = await operation();
    completed = true;
  } catch (error) {
    failure = error;
  } finally {
    delete context.recordPhase;
  }
  if (!context.uncertain && (!context.writeStarted || (completed && !context.signal.aborted))) {
    const removed = await executeRedisCommand(redis, () =>
      redis.eval(
        "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
        [key],
        [serialized],
      ),
    );
    if (!removed) throw new Error("Subscription journal ownership changed");
  } else {
    console.error("Subscription reconciliation required", { operationId: record.id, phase: record.phase });
  }
  if (!completed) throw failure;
  return result;
}

export async function readSubscriptionJournal(email: string): Promise<JournalRecord | null> {
  const key = keyFor(email);
  const redis = client();
  const value = await executeRedisCommand(redis, () => redis.get<string>(key));
  return value ? (JSON.parse(value) as JournalRecord) : null;
}

// Call under the subscriber lock only after the operator has reconciled the
// provider state. Compare the exact record to avoid clearing a newer attempt.
export async function resolveSubscriptionJournal(email: string, expectedId: string) {
  const key = keyFor(email);
  const redis = client();
  const value = await executeRedisCommand(redis, () => redis.get<string>(key));
  if (!value || (JSON.parse(value) as JournalRecord).id !== expectedId) throw new Error("Journal ID does not match");
  const cleared = await executeRedisCommand(redis, () =>
    redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
      [key],
      [value],
    ),
  );
  if (!cleared) throw new Error("Journal changed during reconciliation");
}
