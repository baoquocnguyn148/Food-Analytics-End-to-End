import { Router, Request, Response } from "express";
import { metrics } from "./metrics";

const router = Router();

/**
 * @openapi
 * /metrics:
 *   get:
 *     tags: [Monitoring]
 *     summary: Application performance and error metrics
 *     responses:
 *       200:
 *         description: Snapshot of request counts, latency percentiles and error rate
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, data: metrics.snapshot() });
});

export default router;
