import { createHash, createHmac } from "node:crypto";
import { getRedisClient, logRedisError } from "@/lib/redis";

export class RequestBodyError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function cleanSingleLine(value: unknown, maxLength: number) {
  return Array.from(cleanText(value, maxLength))
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code > 31 && code !== 127) return character;
      return /\s/.test(character) ? " " : "";
    })
    .join("")
    .replace(/\s+/g, " ");
}

export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("Request is too large.", 413);
  }

  if (!request.body) throw new RequestBodyError("Invalid request.", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError("Request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new RequestBodyError("Invalid request.", 400);
  }
}

type RateLimiterOptions = {
  windowMs: number;
  maxRequests: number;
  maxKeys?: number;
};

type RedisRateLimiterOptions = RateLimiterOptions & {
  namespace: string;
};

const RATE_LIMIT_KEY_PREFIX = "mfa:rate-limit:v1";

function getRequestIdentifier(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  if (!clientKey) return null;

  const secret = process.env.RATE_LIMIT_HASH_SECRET
    || process.env.SUBSCRIPTION_PREFERENCES_SECRET
    || process.env.RESEND_API_KEY;
  return secret
    ? createHmac("sha256", secret).update(`rate-limit:${clientKey}`).digest("hex")
    : createHash("sha256").update(clientKey).digest("hex");
}

export function createMemoryRateLimiter({ windowMs, maxRequests, maxKeys = 1000 }: RateLimiterOptions) {
  const requests = new Map<string, number[]>();

  return (request: Request) => {
    const key = getRequestIdentifier(request);

    // Vercel supplies a client IP. If a different runtime does not, avoid
    // grouping every visitor into one shared bucket.
    if (!key) return false;

    const now = Date.now();
    const recent = (requests.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
    recent.push(now);
    requests.set(key, recent);

    if (requests.size > maxKeys) {
      for (const [storedKey, timestamps] of requests) {
        if (!timestamps.some((timestamp) => now - timestamp < windowMs)) requests.delete(storedKey);
      }
      while (requests.size > maxKeys) requests.delete(requests.keys().next().value as string);
    }

    return recent.length > maxRequests;
  };
}

const rateLimitScript = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return count
`;

export function createRateLimiter({ namespace, windowMs, maxRequests, maxKeys }: RedisRateLimiterOptions) {
  const memoryFallback = createMemoryRateLimiter({ windowMs, maxRequests, maxKeys });

  return async (request: Request) => {
    const identifier = getRequestIdentifier(request);
    if (!identifier) return false;

    try {
      const redis = await getRedisClient();
      if (!redis) return memoryFallback(request);

      const count = await redis.eval(rateLimitScript, {
        keys: [`${RATE_LIMIT_KEY_PREFIX}:${namespace}:${identifier}`],
        arguments: [String(windowMs)],
      });
      return Number(count) > maxRequests;
    } catch (error) {
      logRedisError("Redis rate limiter unavailable", error);
      return memoryFallback(request);
    }
  };
}
