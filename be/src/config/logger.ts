import path from "path";
import fs from "fs";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "./env";

// =====================================================================
// Winston Logger with Daily Rotate (Sprint 8 - P3)
// =====================================================================

const logDir = path.resolve(process.cwd(), config.LOG_DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}] ${stack || message}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
  // Combined daily rotating logs
  new DailyRotateFile({
    dirname: logDir,
    filename: "app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
  }),
  // Error-only daily rotating logs
  new DailyRotateFile({
    dirname: logDir,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "30d",
    format: fileFormat,
  }),
];

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  levels: winston.config.npm.levels,
  defaultMeta: { service: "food-analytics-api" },
  transports,
  silent: config.isTest,
});

// Stream adapter so morgan pipes HTTP logs into winston
export const httpLogStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
