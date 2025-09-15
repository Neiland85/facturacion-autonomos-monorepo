# Multi-stage Dockerfile for API Gateway
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gateway -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built application from base stage
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/src ./src

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R gateway:nodejs /usr/src/app

# Switch to non-root user
USER gateway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
