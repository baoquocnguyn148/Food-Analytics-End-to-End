import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// =====================================================================
// Environment Validation (Sprint 8 - P2)
// Fail fast at boot if required config is missing / malformed.
// =====================================================================

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(8).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  CACHE_TTL: z.coerce.number().int().positive().default(300), // seconds

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "debug"])
    .default("info"),
  LOG_DIR: z.string().default("logs"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;

// Fall back refresh secret to access secret if not provided
export const config = {
  ...env,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
};

export type AppConfig = typeof config;
export default config;
