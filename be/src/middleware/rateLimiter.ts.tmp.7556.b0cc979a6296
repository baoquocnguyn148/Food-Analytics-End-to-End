import rateLimit from "express-rate-limit";
import config from "../config/env";

// =====================================================================
// Rate limiting (Sprint 8 - P2)
// =====================================================================

const jsonHandler = (_req: any, res: any) =>
  res.status(429).json({
    success: false,
    error: {
      status: 429,
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later.",
    },
  });

// Global limiter applied to the whole API.
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  skip: () => config.isTest,
});

// Stricter limiter for auth endpoints to slow brute-force attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  skip: () => config.isTest,
});
