# --- builder ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# add any schema or non-TS runtime assets if needed:
# COPY serviceAccountKey.json ./  # not needed in builder for compile
RUN npx tsc

# --- runner ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
# Only copy built artifacts
COPY --from=builder /app/dist ./dist
# Copy runtime assets (env, service account, etc.)
COPY serviceAccountKey.json ./serviceAccountKey.json
EXPOSE 5000
# Install curl for HEALTHCHECK on Alpine
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:5000/health || exit 1
CMD ["node", "dist/server.js"]

