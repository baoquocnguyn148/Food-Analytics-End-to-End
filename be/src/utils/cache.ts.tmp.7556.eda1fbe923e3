import { getRedis } from "../config/redis";
import config from "../config/env";
import logger from "../config/logger";

// =====================================================================
// Cache helper (Sprint 8 - P5)
// Thin wrapper over Redis with JSON (de)serialization and a
// cache-aside `wrap` helper. All operations fail open (never throw).
// =====================================================================

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn(`cache.get failed for ${key}: ${(err as Error).message}`);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds = config.CACHE_TTL): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      logger.warn(`cache.set failed for ${key}: ${(err as Error).message}`);
    }
  },

  async del(...keys: string[]): Promise<void> {
    const redis = getRedis();
    if (!redis || keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.warn(`cache.del failed: ${(err as Error).message}`);
    }
  },

  /** Delete every key matching a glob pattern (e.g. "analytics:*"). */
  async delByPattern(pattern: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
      const stream = redis.scanStream({ match: pattern, count: 100 });
      const pipeline = redis.pipeline();
      for await (const keys of stream) {
        (keys as string[]).forEach((k) => pipeline.del(k));
      }
      await pipeline.exec();
    } catch (err) {
      logger.warn(`cache.delByPattern failed for ${pattern}: ${(err as Error).message}`);
    }
  },

  /** Cache-aside: return cached value or compute, store, and return it. */
  async wrap<T>(
    key: string,
    ttlSeconds: number,
    producer: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await producer();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },
};

export default cache;
