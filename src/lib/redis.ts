import "server-only";
import { Redis } from "@upstash/redis";

type RedisErrorCategory =
  "Invalid Redis REST configuration" | "Redis rate limiter unavailable" | "Redis command unavailable";
type RedisState = {
  client: Redis | null;
  lastErrorLogAt: Partial<Record<RedisErrorCategory, number>>;
  unavailableUntil: number;
};
const COMMAND_TIMEOUT_MS = 5_000;
const CONNECTION_COOLDOWN_MS = 30_000;
const ERROR_LOG_INTERVAL_MS = 60_000;
const globalForRedis = globalThis as typeof globalThis & { __mfaRedisStateV6?: RedisState };
const state = (globalForRedis.__mfaRedisStateV6 ??= { client: null, lastErrorLogAt: {}, unavailableUntil: 0 });

export function logRedisError(message: RedisErrorCategory, error: unknown) {
  const now = Date.now();
  if (now - (state.lastErrorLogAt[message] ?? 0) < ERROR_LOG_INTERVAL_MS) return;
  state.lastErrorLogAt[message] = now;
  console.error(message, error instanceof Error ? error.name : "UnknownError");
}

export function markRedisUnavailable(client = state.client) {
  // A late failure from an old request must not suspend a replacement client.
  if (!client || state.client !== client) return;
  state.unavailableUntil = Date.now() + CONNECTION_COOLDOWN_MS;
  state.client = null;
}

export async function executeRedisCommand<T>(client: Redis, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    markRedisUnavailable(client);
    logRedisError("Redis command unavailable", error);
    throw error;
  }
}

export function getRedisClient() {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      throw new Error("Redis REST requires an HTTPS endpoint and a separate token");
  } catch (error) {
    logRedisError("Invalid Redis REST configuration", error);
    return null;
  }
  if (Date.now() < state.unavailableUntil) return null;
  state.client ??= new Redis({
    url,
    token,
    // Lua compares raw JSON strings, and ambiguous writes must never be replayed.
    automaticDeserialization: false,
    retry: { retries: 0 },
    enableAutoPipelining: false,
    enableTelemetry: false,
    signal: () => AbortSignal.timeout(COMMAND_TIMEOUT_MS),
  });
  return state.client;
}
