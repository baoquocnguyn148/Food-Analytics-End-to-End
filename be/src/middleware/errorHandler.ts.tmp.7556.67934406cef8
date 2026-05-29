import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import config from "../config/env";

// Added proper error handling middleware
// Catches errors from routes and services, returns proper HTTP status codes
// and logs them through winston (Sprint 8 - P3).

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_ERROR";

  // Log server errors with stack; client errors at warn level.
  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${status} ${code}: ${message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status} ${code}: ${message}`);
  }

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      code,
      ...(err.details ? { details: err.details } : {}),
      ...(config.isProd ? {} : { stack: err.stack }),
    },
  });
};

// 404 handler for unmatched routes.
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
