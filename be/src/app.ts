import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import config from "./config/env";
import { httpLogStream } from "./config/logger";
import swaggerSpec from "./config/swagger";

import { metricsMiddleware } from "./monitoring/metrics";
import { apiLimiter } from "./middleware/rateLimiter";
import { sanitizeRequest } from "./middleware/sanitize";
import { cacheResponse } from "./middleware/cacheMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Feature routes
import foodRoutes from "./routes/food.route";
import mlRoutes from "./routes/ml.route";
import chatbotRoutes from "./routes/chatbot.route";
import analyticsRoutes from "./analytics/routes/analytics.route";
import authRoutes from "./auth/routes/auth.route";
import profileRoutes from "./profile/routes/profile.route";
import historyRoutes from "./history/routes/history.route";
import healthRoutes from "./health/health.route";
import monitoringRoutes from "./monitoring/monitoring.route";

const app = express();

// BigInt → string so res.json() can serialize Prisma's BigInt fields (e.g. nutrientDataBankNumber)
app.set("json replacer", (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value
);

// --- Security (Sprint 8 - P2) ---
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// --- Body parsing ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Sanitization, logging, metrics ---
app.use(sanitizeRequest);
app.use(morgan("combined", { stream: httpLogStream }));
app.use(metricsMiddleware);

// --- Global rate limiting on the API surface ---
app.use("/api", apiLimiter);

// --- API docs ---
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get("/swagger.json", (_req, res) => res.json(swaggerSpec));

// --- Root ---
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Food Analytics API Running",
    docs: "/swagger",
    endpoints: {
      auth: "/api/auth",
      profile: "/api/profile",
      foods: "/api/foods",
      ml: "/api/ml",
      chatbot: "/api/chatbot",
      analytics: "/api/analytics",
      history: "/api (recommendations/history, chat/history)",
      health: "/health",
      metrics: "/metrics",
    },
  });
});

// --- Health & monitoring ---
app.use("/health", healthRoutes);
app.use("/metrics", monitoringRoutes);

// --- Auth & user ---
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", historyRoutes); // /api/recommendations/history, /api/chat/history

// --- Domain routes (analytics & ml recommendations are cached) ---
app.use("/api/foods", foodRoutes);
app.use("/api/ml", cacheResponse("ml"), mlRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", cacheResponse("analytics"), analyticsRoutes);

// --- 404 + error handler (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
