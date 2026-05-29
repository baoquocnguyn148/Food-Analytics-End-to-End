import { Request, Response, NextFunction } from "express";

// =====================================================================
// Request sanitization (Sprint 8 - P2)
// Strips keys that can drive NoSQL/operator injection ($, .) and trims
// dangerous control characters from string values. Express 5 makes
// req.query a getter, so we mutate in place rather than reassign.
// =====================================================================

const FORBIDDEN_KEY = /^\$|\./;

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    // Drop null bytes and trim. (Deep XSS escaping is left to output layer.)
    return value.replace(/\0/g, "").trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
};

const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_KEY.test(key)) {
      delete obj[key];
      continue;
    }
    obj[key] = sanitizeValue(obj[key]);
  }
  return obj;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body as Record<string, unknown>);
  }
  // req.query / req.params are read-only getters in Express 5 — mutate in place.
  if (req.query && typeof req.query === "object") {
    sanitizeObject(req.query as unknown as Record<string, unknown>);
  }
  if (req.params && typeof req.params === "object") {
    sanitizeObject(req.params as unknown as Record<string, unknown>);
  }
  next();
};
