// Test environment defaults — loaded before any module that reads config/env.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-123456";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret-123456";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "mysql://root:123456@localhost:3306/food_analytics_test";
// Disable Redis in tests so the cache layer no-ops without a server.
process.env.REDIS_ENABLED = "false";
