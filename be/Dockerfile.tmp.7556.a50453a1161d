# =====================================================================
# Food Analytics Backend - multi-stage production image (Sprint 8 - P6)
# =====================================================================

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install all deps (incl. dev) for building + prisma generate
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY server.ts ./
COPY src ./src
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Bring over generated Prisma client + compiled output + schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Run as non-root
RUN addgroup -S app && adduser -S app -G app && \
    mkdir -p /app/logs && chown -R app:app /app
USER app

EXPOSE 5000

# Healthcheck hits the liveness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Apply migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
