import { Router } from "express";
import * as HealthController from "./health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     responses:
 *       200: { description: Service is up }
 */
router.get("/", HealthController.health);

/**
 * @openapi
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: Database readiness probe
 *     responses:
 *       200: { description: Database reachable }
 *       503: { description: Database unreachable }
 */
router.get("/db", HealthController.healthDb);

/**
 * @openapi
 * /health/redis:
 *   get:
 *     tags: [Health]
 *     summary: Redis readiness probe
 *     responses:
 *       200: { description: Redis reachable or disabled }
 *       503: { description: Redis unreachable }
 */
router.get("/redis", HealthController.healthRedis);

export default router;
