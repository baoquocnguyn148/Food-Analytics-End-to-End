// Typed application error so controllers/services can throw with HTTP status.
import { ApiError } from "../middleware/errorHandler";

export class AppError extends Error implements ApiError {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, "FORBIDDEN");
  }
  static notFound(message = "Not Found") {
    return new AppError(message, 404, "NOT_FOUND");
  }
  static conflict(message: string) {
    return new AppError(message, 409, "CONFLICT");
  }
}
