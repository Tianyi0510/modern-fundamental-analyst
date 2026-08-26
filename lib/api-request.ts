import { createHmac, randomBytes } from "node:crypto";
import { getRedisClient, logRedisError, markRedisUnavailable } from "@/lib/redis";

export class RequestBodyError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

export function getRequestErrorDetails(error: unknown) {
  return error instanceof RequestBodyError
    ? { message: error.message, status: error.status }
    : { message: "Invalid request.", status: 400 as const };
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

export async function readLimitedText(request: Request, maxBytes: number) {
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

  return new TextDecoder().decode(bytes);
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  try {
    return JSON.parse(await readLimitedText(request, maxBytes)) as unknown;
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("Invalid request.", 400);
  }
}

export async function readObjectJson<T extends object>(request: Request, maxBytes: number): Promise<T> {
  const payload = await readLimitedJson(request, maxBytes);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RequestBodyError("Invalid request.", 400);
  }
  return payload as T;
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
const fallbackRateLimitSecret = randomBytes(32);

function getRequestIdentifier(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  if (!clientKey) return null;

  const secret = process.env.RATE_LIMIT_HASH_SECRET
    || process.env.SUBSCRIPTION_PREFERENCES_SECRET
    || process.env.RESEND_API_KEY
    || fallbackRateLimitSecret;
  return createHmac("sha256", secret).update(`rate-limit:${clientKey}`).digest("hex");
}

function createIdentifierRateLimiter({ windowMs, maxRequests, maxKeys = 1000 }: RateLimiterOptions) {
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

export function createRateLimiter({ namespace, windowMs, maxRequests, maxKeys }: RedisRateLimiterOptions) {
  const memoryFallback = createIdentifierRateLimiter({ windowMs, maxRequests, maxKeys });

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
      return Number(count) > maxRequests;
    } catch (error) {
      markRedisUnavailable();
      logRedisError("Redis rate limiter unavailable", error);
      return memoryFallback(identifier);
    }
  };
}
