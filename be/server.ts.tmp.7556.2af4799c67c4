import app from "./src/app";
import config from "./src/config/env";
import logger from "./src/config/logger";
import { getRedis, closeRedis } from "./src/config/redis";
import prisma from "./src/config/prisma";

// Warm the Redis connection (no-op if disabled / unavailable).
getRedis();

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 Server running on port ${config.PORT} [${config.NODE_ENV}]`);
  logger.info(`📚 Swagger docs at http://localhost:${config.PORT}/swagger`);
});

// --- Graceful shutdown ---
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), closeRedis()]);
    logger.info("Cleanup complete. Bye 👋");
    process.exit(0);
  });
  // Force-exit if it hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
});

export default server;
