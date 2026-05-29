import { Request, Response, NextFunction } from "express";

// =====================================================================
// Lightweight in-process metrics (Sprint 8 - P8)
// Tracks request counts, latency, status codes and errors. Exposed via
// the /metrics endpoint. For a full deployment this can be swapped for
// prom-client, but this keeps the stack dependency-free.
// =====================================================================

interface RouteStat {
  count: number;
  totalMs: number;
  maxMs: number;
  errors: number;
}

class MetricsRegistry {
  private startedAt = Date.now();
  private totalRequests = 0;
  private totalErrors = 0;
  private statusCounts: Record<string, number> = {};
  private routes: Record<string, RouteStat> = {};
  private latencies: number[] = []; // rolling window for percentiles

  record(method: string, route: string, statusCode: number, durationMs: number) {
    this.totalRequests += 1;

    const bucket = `${Math.floor(statusCode / 100)}xx`;
    this.statusCounts[bucket] = (this.statusCounts[bucket] || 0) + 1;
    if (statusCode >= 500) this.totalErrors += 1;

    const key = `${method} ${route}`;
    const stat = (this.routes[key] ??= { count: 0, totalMs: 0, maxMs: 0, errors: 0 });
    stat.count += 1;
    stat.totalMs += durationMs;
    stat.maxMs = Math.max(stat.maxMs, durationMs);
    if (statusCode >= 500) stat.errors += 1;

    this.latencies.push(durationMs);
    if (this.latencies.length > 1000) this.latencies.shift();
  }

  private percentile(p: number): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return Math.round(sorted[idx]);
  }

  snapshot() {
    const routes = Object.entries(this.routes)
      .map(([route, s]) => ({
        route,
        count: s.count,
        avgMs: Math.round(s.totalMs / s.count),
        maxMs: Math.round(s.maxMs),
        errors: s.errors,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate:
        this.totalRequests === 0
          ? 0
          : Number((this.totalErrors / this.totalRequests).toFixed(4)),
      statusCounts: this.statusCounts,
      latency: {
        p50: this.percentile(50),
        p90: this.percentile(90),
        p99: this.percentile(99),
      },
      memory: process.memoryUsage(),
      routes,
    };
  }
}

export const metrics = new MetricsRegistry();

// Express middleware that times each request and records the outcome.
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const route = (req.route?.path && req.baseUrl + req.route.path) || req.path;
    metrics.record(req.method, route, res.statusCode, durationMs);
  });
  next();
};
