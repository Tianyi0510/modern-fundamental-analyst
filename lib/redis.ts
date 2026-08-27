import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;
type RedisErrorCategory = "Invalid UPSTASH_REDIS_URL" | "Redis client error" | "Redis rate limiter unavailable";
type RedisState = {
  client: RedisClient | null;
  connection: Promise<RedisClient> | null;
  lastErrorLogAt: Partial<Record<RedisErrorCategory, number>>;
  unavailableUntil: number;
};

const CONNECT_TIMEOUT_MS = 2_000;
const SOCKET_TIMEOUT_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = 2;
const CONNECTION_COOLDOWN_MS = 30_000;
const ERROR_LOG_INTERVAL_MS = 60_000;
const MAX_COMMAND_QUEUE_LENGTH = 100;

const globalForRedis = globalThis as typeof globalThis & { __mfaRedisStateV5?: RedisState };
const state = globalForRedis.__mfaRedisStateV5 ??= {
  client: null,
  connection: null,
  lastErrorLogAt: {},
  unavailableUntil: 0,
};

function reconnectStrategy(retries: number) {
  if (retries >= MAX_RECONNECT_ATTEMPTS) return false;
  return Math.min(100 * 2 ** retries, 500);
}

export function logRedisError(message: RedisErrorCategory, error: unknown) {
  const now = Date.now();
  const lastLoggedAt = state.lastErrorLogAt[message] ?? 0;
  if (now - lastLoggedAt < ERROR_LOG_INTERVAL_MS) return;
  state.lastErrorLogAt[message] = now;
  console.error(message, error instanceof Error ? error.name : "UnknownError");
}

function suspendRedis(client = state.client) {
  state.unavailableUntil = Date.now() + CONNECTION_COOLDOWN_MS;
  if (!client || state.client !== client) return;

  state.client = null;
  if (client.isOpen) client.destroy();
  client.removeAllListeners();
}

export function markRedisUnavailable() {
  suspendRedis();
}

function getRedisUrl() {
  const value = process.env.UPSTASH_REDIS_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "rediss:") throw new Error("Upstash Redis requires TLS");
    if (!url.hostname || !url.password) throw new Error("Redis authentication is required");
    return value;
  } catch (error) {
    logRedisError("Invalid UPSTASH_REDIS_URL", error);
    return null;
  }
}

export async function getRedisClient() {
  const url = getRedisUrl();
  if (!url) return null;
  if (Date.now() < state.unavailableUntil) return null;

  if (!state.client) {
    state.client = createClient({
      url,
      disableOfflineQueue: true,
      commandsQueueMaxLength: MAX_COMMAND_QUEUE_LENGTH,
      socket: {
        connectTimeout: CONNECT_TIMEOUT_MS,
        socketTimeout: SOCKET_TIMEOUT_MS,
        reconnectStrategy,
      },
    });
    state.client.on("error", (error) => logRedisError("Redis client error", error));
  }

  if (state.client.isOpen) return state.client;

  if (!state.connection) {
    const pendingClient = state.client;
    state.connection = pendingClient.connect()
      .then(() => {
        state.unavailableUntil = 0;
        return pendingClient;
      })
      .catch((error) => {
        suspendRedis(pendingClient);
        throw error;
      })
      .finally(() => {
        state.connection = null;
      });
  }

  return state.connection;
}
