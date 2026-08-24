import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const CONNECT_TIMEOUT_MS = 2_000;
const SOCKET_TIMEOUT_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = 2;

let client: RedisClient | null = null;
let connection: Promise<RedisClient> | null = null;

function reconnectStrategy(retries: number) {
  if (retries >= MAX_RECONNECT_ATTEMPTS) return false;
  return Math.min(100 * 2 ** retries, 500);
}

export async function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!client) {
    client = createClient({
      url,
      disableOfflineQueue: true,
      socket: {
        connectTimeout: CONNECT_TIMEOUT_MS,
        socketTimeout: SOCKET_TIMEOUT_MS,
        reconnectStrategy,
      },
    });
    client.on("error", (error) => {
      console.error("Redis client error", error instanceof Error ? error.name : "UnknownError");
    });
  }

  if (client.isOpen) return client;

  if (!connection) {
    const pendingClient = client;
    connection = pendingClient.connect()
      .then(() => pendingClient)
      .catch((error) => {
        if (client === pendingClient) {
          client = null;
          if (pendingClient.isOpen) pendingClient.destroy();
        }
        throw error;
      })
      .finally(() => {
        connection = null;
      });
  }

  return connection;
}
