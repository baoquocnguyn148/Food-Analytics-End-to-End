import { Request, Response, NextFunction } from "express";
import cache from "../utils/cache";
import config from "../config/env";

// =====================================================================
// HTTP response cache middleware (Sprint 8 - P5)
// Caches successful JSON responses of idempotent (GET/POST-read) routes
// in Redis, keyed by prefix + path + query + body. Fails open.
// =====================================================================

export const cacheResponse = (prefix: string, ttlSeconds: number = config.CACHE_TTL) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Never cache per-user/authenticated responses.
    if (req.headers.authorization) return next();

    const keyParts = [
      prefix,
      req.originalUrl,
      req.method === "POST" ? JSON.stringify(req.body || {}) : "",
    ];
    const key = `cache:${prefix}:${Buffer.from(keyParts.join("|")).toString("base64")}`;

    const cached = await cache.get<unknown>(key);
    if (cached !== null) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      // Only cache successful responses.
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void cache.set(key, body, ttlSeconds);
      }
      return originalJson(body as any);
    }) as typeof res.json;
    next();
  };
};
