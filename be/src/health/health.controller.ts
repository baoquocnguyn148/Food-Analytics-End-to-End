import { Request, Response } from "express";
import prisma from "../config/prisma";
import { pingRedis } from "../config/redis";
import config from "../config/env";

// =====================================================================
// Health checks (Sprint 8 - P7)
// =====================================================================

export const health = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "food-analytics-api",
    env: config.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

export const healthDb = async (_req: Request, res: Response) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", component: "database", latencyMs: Date.now() - start });
  } catch (err) {
    res.status(503).json({
      status: "down",
      component: "database",
      error: (err as Error).message,
    });
  }
};

export const healthRedis = async (_req: Request, res: Response) => {
  if (!config.REDIS_ENABLED) {
    return res.json({ status: "disabled", component: "redis" });
  }
  const start = Date.now();
  const ok = await pingRedis();
  if (ok) {
    res.json({ status: "ok", component: "redis", latencyMs: Date.now() - start });
  } else {
    res.status(503).json({ status: "down", component: "redis" });
  }
};
