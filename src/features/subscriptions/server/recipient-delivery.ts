import "server-only";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { ResendCoordinationError, subscriptionKey } from "./resend-coordination";

// One allowance per immutable request; retries neither consume a second slot nor
// bypass the cooldown by choosing a fresh UUID. Redis failure blocks sending.
export const recipientAllowanceScript = `
if redis.call('EXISTS', KEYS[3]) == 1 then return 1 end
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
local count = tonumber(redis.call('GET', KEYS[2]) or '0')
if count >= 3 then return 0 end
redis.call('SET', KEYS[1], '1', 'EX', 60)
redis.call('INCR', KEYS[2])
if count == 0 then redis.call('EXPIRE', KEYS[2], 3600) end
redis.call('SET', KEYS[3], '1', 'EX', 1500)
return 1
`;

export async function requireRecipientAllowance(email: string, requestId: string) {
  const redis = getRedisClient();
  if (!redis) throw new ResendCoordinationError();
  const identity = email.trim().toLowerCase();
  const allowed = await executeRedisCommand(redis, () =>
    redis.eval(
      recipientAllowanceScript,
      [
        subscriptionKey("recipient-cooldown", identity),
        subscriptionKey("recipient-hour", identity),
        subscriptionKey("recipient-request", JSON.stringify([identity, requestId])),
      ],
      [],
    ),
  );
  if (allowed !== 1) throw new ResendCoordinationError("Please wait before requesting another email.", 429);
}

export async function isDeliverySuppressed(email: string) {
  const redis = getRedisClient();
  if (!redis) throw new ResendCoordinationError();
  return Boolean(await executeRedisCommand(redis, () => redis.get(subscriptionKey("suppression", email))));
}
