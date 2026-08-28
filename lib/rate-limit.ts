import { createHmac, randomBytes } from "node:crypto";
import { getRedisClient, logRedisError, markRedisUnavailable } from "@/lib/redis";

type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
  maxKeys?: number;
};

type RedisRateLimiterOptions = RateLimiterOptions & {
  namespace: string;
};

const RATE_LIMIT_KEY_PREFIX = "mfa:rl:v2";
const rateLimitHashSecret = process.env.RATE_LIMIT_HASH_SECRET
  || process.env.SUBSCRIPTION_PREFERENCES_SECRET
  || process.env.RESEND_API_KEY
  || randomBytes(32);

function validateRateLimiterOptions({ windowMs, maxRequests, maxKeys = 1000 }: RateLimiterOptions) {
  if (!Number.isSafeInteger(windowMs) || windowMs <= 0) throw new RangeError("Rate-limit window must be a positive integer");
  if (!Number.isSafeInteger(maxRequests) || maxRequests <= 0) throw new RangeError("Rate-limit maximum must be a positive integer");
  if (!Number.isSafeInteger(maxKeys) || maxKeys <= 0) throw new RangeError("Rate-limit key limit must be a positive integer");
  return maxKeys;
}

function getRequestIdentifier(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  if (!clientKey) return null;

  return createHmac("sha256", rateLimitHashSecret)
    .update(`rate-limit:${clientKey}`)
    .digest("base64url");
}

function createIdentifierRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests } = options;
  const maxKeys = validateRateLimiterOptions(options);
  const requests = new Map<string, { count: number; expiresAt: number }>();

  return (key: string | null) => {
    // Vercel supplies a client IP. If a different runtime does not, avoid
    // grouping every visitor into one shared bucket.
    if (!key) return false;

    const now = Date.now();
    const current = requests.get(key);
    const window = current && current.expiresAt > now
      ? { count: current.count + 1, expiresAt: current.expiresAt }
      : { count: 1, expiresAt: now + windowMs };
    requests.set(key, window);

    if (requests.size > maxKeys) {
      for (const [storedKey, entry] of requests) {
        if (entry.expiresAt <= now) requests.delete(storedKey);
      }
      while (requests.size > maxKeys) requests.delete(requests.keys().next().value as string);
    }

    return window.count > maxRequests;
  };
}

export function createMemoryRateLimiter(options: RateLimiterOptions) {
  const isIdentifierRateLimited = createIdentifierRateLimiter(options);
  return (request: Request) => isIdentifierRateLimited(getRequestIdentifier(request));
}

const rateLimitScript = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return count
`;

export function createRateLimiter(options: RedisRateLimiterOptions) {
  const { namespace, windowMs, maxRequests } = options;
  if (!/^[a-z0-9-]{1,48}$/.test(namespace)) throw new RangeError("Invalid rate-limit namespace");
  const memoryFallback = createIdentifierRateLimiter(options);

  return async (request: Request) => {
    const identifier = getRequestIdentifier(request);
    if (!identifier) return false;

    try {
      const redis = await getRedisClient();
      if (!redis) return memoryFallback(identifier);

      const count = await redis.eval(rateLimitScript, {
        keys: [`${RATE_LIMIT_KEY_PREFIX}:${namespace}:${identifier}`],
        arguments: [String(windowMs)],
      });
      if (typeof count !== "number") throw new TypeError("Unexpected Redis rate-limit response");
      return count > maxRequests;
    } catch (error) {
      markRedisUnavailable();
      logRedisError("Redis rate limiter unavailable", error);
      return memoryFallback(identifier);
    }
  };
}
