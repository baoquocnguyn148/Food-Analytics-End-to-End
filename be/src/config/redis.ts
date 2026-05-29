import Redis from "ioredis";
import config from "./env";
import logger from "./logger";

// =====================================================================
// Redis client (Sprint 8 - P5)
// Lazy, resilient connection. If Redis is unavailable the app keeps
// running and the cache layer simply degrades to a no-op.
// =====================================================================

let client: Redis | null = null;
let healthy = false;

export const getRedis = (): Redis | null => {
  if (!config.REDIS_ENABLED) return null;
  if (client) return client;

  client = new Redis(config.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    reconnectOnError: () => true,
  });

  client.on("connect", () => {
    healthy = true;
    logger.info("✅ Redis connected");
  });
  client.on("error", (err) => {
    healthy = false;
    logger.warn(`Redis error: ${err.message}`);
  });
  client.on("close", () => {
    healthy = false;
  });

  return client;
};

export const isRedisHealthy = (): boolean => healthy;

export const pingRedis = async (): Promise<boolean> => {
  const c = getRedis();
  if (!c) return false;
  try {
    const res = await c.ping();
    return res === "PONG";
  } catch {
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (client) {
    await client.quit();
    client = null;
    healthy = false;
  }
};
