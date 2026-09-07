import { createHmac, randomUUID } from "node:crypto";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { resendOperationContext } from "@/lib/resend";

export class ResendCoordinationError extends Error {
  status: number;
  constructor(message = "Email service is temporarily unavailable.", status = 503) {
    super(message);
    this.status = status;
  }
}

function privateKey(scope: string, value: string) {
  const secret = process.env.SUBSCRIPTION_PREFERENCES_SECRET || process.env.RESEND_API_KEY;
  if (!secret) throw new ResendCoordinationError();
  return `mfa:resend:${scope}:${createHmac("sha256", secret).update(value).digest("hex")}`;
}

const releaseScript = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end";

export async function withSubscriberLock<T>(email: string, operation: () => Promise<T>): Promise<T> {
  const redis = await getRedisClient();
  if (!redis) throw new ResendCoordinationError();
  const key = privateKey("subscriber", email.trim().toLowerCase());
  const owner = randomUUID();
  // Fail fast on contention: never run an uncoordinated mutation as fallback.
  if (!await executeRedisCommand(redis, () => redis.set(key, owner, { NX: true, PX: 120_000 }))) throw new ResendCoordinationError();
  const context = { signal: AbortSignal.timeout(20_000), uncertain: false };
  try {
    return await resendOperationContext.run(context, operation);
  } finally {
    if (!context.uncertain && !context.signal.aborted) {
      await executeRedisCommand(redis, () => redis.eval(releaseScript, { keys: [key], arguments: [owner] })).catch(() => {
        console.error("Resend subscriber lease release failed");
      });
    }
  }
}

// Store the complete immutable payload: randomized encrypted links must not
// change between retries using the same Resend idempotency key.
export async function getStablePreferenceEmail<T>(requestId: string, identity: string, create: () => T): Promise<T> {
  const redis = await getRedisClient();
  if (!redis) throw new ResendCoordinationError();
  const key = privateKey("preference-request", requestId);
  const fingerprint = privateKey("preference-input", identity);
  let stored = await executeRedisCommand(redis, () => redis.get(key));
  if (!stored) {
    const candidate = JSON.stringify({ fingerprint, createdAt: Date.now(), payload: create() });
    // Cover Resend's 24-hour deduplication window even if the initial send
    // happens shortly after this record is created.
    const inserted = await executeRedisCommand(redis, () => redis.set(key, candidate, { NX: true, EX: 90_000 }));
    stored = inserted ? candidate : await executeRedisCommand(redis, () => redis.get(key));
  }
  if (!stored) throw new ResendCoordinationError();
  const record = JSON.parse(stored) as { fingerprint: string; createdAt: number; payload: T };
  if (record.fingerprint !== fingerprint || Date.now() - record.createdAt >= 25 * 60 * 1000) {
    throw new ResendCoordinationError("Please submit a new preferences request.", 409);
  }
  return record.payload;
}
