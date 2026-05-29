import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, Role } from "../utils/jwt";
import { AppError } from "../utils/AppError";

// =====================================================================
// Authentication & Authorization middleware (Sprint 5)
// =====================================================================

/**
 * Verifies the Bearer access token and attaches `req.user`.
 * Throws 401 if missing/invalid/expired.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    const expired = (err as Error).name === "TokenExpiredError";
    return next(AppError.unauthorized(expired ? "Access token expired" : "Invalid access token"));
  }
};

/**
 * Role-based guard. Use after `authenticate`.
 * Example: router.get("/admin", authenticate, authorize("ADMIN"), handler)
 */
export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(AppError.forbidden("Insufficient permissions for this resource"));
    }
    return next();
  };
};
