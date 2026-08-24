import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;
type RedisState = {
  client: RedisClient | null;
  connection: Promise<RedisClient> | null;
  lastErrorLogAt: number;
  warnedAboutInsecureUrl: boolean;
};

const CONNECT_TIMEOUT_MS = 2_000;
const SOCKET_TIMEOUT_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = 2;
const ERROR_LOG_INTERVAL_MS = 60_000;

const globalForRedis = globalThis as typeof globalThis & { __mfaRedisState?: RedisState };
const state = globalForRedis.__mfaRedisState ??= {
  client: null,
  connection: null,
  lastErrorLogAt: 0,
  warnedAboutInsecureUrl: false,
};

function reconnectStrategy(retries: number) {
  if (retries >= MAX_RECONNECT_ATTEMPTS) return false;
  return Math.min(100 * 2 ** retries, 500);
}

export function logRedisError(message: string, error: unknown) {
  const now = Date.now();
  if (now - state.lastErrorLogAt < ERROR_LOG_INTERVAL_MS) return;
  state.lastErrorLogAt = now;
  console.error(message, error instanceof Error ? error.name : "UnknownError");
}

function getRedisUrl() {
  const value = process.env.REDIS_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "redis:" && url.protocol !== "rediss:") throw new Error("Unsupported Redis protocol");
    if (process.env.NODE_ENV === "production" && url.protocol !== "rediss:" && !state.warnedAboutInsecureUrl) {
      state.warnedAboutInsecureUrl = true;
      console.warn("REDIS_URL does not use TLS in production.");
    }
    return value;
  } catch (error) {
    logRedisError("Invalid REDIS_URL", error);
    return null;
  }
}

export async function getRedisClient() {
  const url = getRedisUrl();
  if (!url) return null;

  if (!state.client) {
    state.client = createClient({
      url,
      disableOfflineQueue: true,
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
      .then(() => pendingClient)
      .catch((error) => {
        if (state.client === pendingClient) {
          state.client = null;
          if (pendingClient.isOpen) pendingClient.destroy();
        }
        throw error;
      })
      .finally(() => {
        state.connection = null;
      });
  }

  return state.connection;
}
