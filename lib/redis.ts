import { createClient } from "@redis/client";

type RedisClient = ReturnType<typeof createClient>;
type RedisErrorCategory = "Invalid UPSTASH_REDIS_URL" | "Redis client error" | "Redis rate limiter unavailable" | "Redis command unavailable";
type RedisState = {
  client: RedisClient | null;
  connection: Promise<RedisClient> | null;
  lastErrorLogAt: Partial<Record<RedisErrorCategory, number>>;
  unavailableUntil: number;
};

const CONNECT_TIMEOUT_MS = 2_000;
const READY_TIMEOUT_MS = 10_000;
const COMMAND_TIMEOUT_MS = 5_000;
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
  if (!client || state.client !== client) return;
  state.unavailableUntil = Date.now() + CONNECTION_COOLDOWN_MS;

  state.client = null;
  state.connection = null;
  if (client.isOpen) client.destroy();
  // Keep the error listener until the discarded socket is collected: a late
  // error event must not become an unhandled EventEmitter error.
}

export function markRedisUnavailable(client = state.client) {
  suspendRedis(client);
}

export async function executeRedisCommand<T>(client: RedisClient, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    suspendRedis(client);
    logRedisError("Redis command unavailable", error);
    throw error;
  }
}

function connectUntilReady(client: RedisClient) {
  // node-redis's socket connect timeout does not cover AUTH/HELLO replies.
  // Destroying the client on expiry also terminates queued handshake work.
  return new Promise<RedisClient>((resolve, reject) => {
    const timer = setTimeout(() => {
      suspendRedis(client);
      reject(new Error("Redis readiness timeout"));
    }, READY_TIMEOUT_MS);
    client.connect().then(resolve, reject).finally(() => clearTimeout(timer));
  });
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
      commandOptions: { timeout: COMMAND_TIMEOUT_MS },
      socket: {
        connectTimeout: CONNECT_TIMEOUT_MS,
        reconnectStrategy,
      },
    });
    state.client.on("error", (error) => logRedisError("Redis client error", error));
  }

  if (state.client.isReady) return state.client;
  if (state.connection) return state.connection;
  if (state.client.isOpen) {
    suspendRedis(state.client);
    return null;
  }

  if (!state.connection) {
    const pendingClient = state.client;
    const pendingConnection = connectUntilReady(pendingClient)
      .then(() => {
        if (state.client !== pendingClient) throw new Error("Redis connection was superseded");
        state.unavailableUntil = 0;
        return pendingClient;
      })
      .catch((error) => {
        suspendRedis(pendingClient);
        throw error;
      })
      .finally(() => {
        if (state.connection === pendingConnection) state.connection = null;
      });
    state.connection = pendingConnection;
  }

  return state.connection;
}
