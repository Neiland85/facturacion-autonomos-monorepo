# Multi-stage Dockerfile for Tax Calculator Service
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache postgresql-client redis curl

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
RUN apk add --no-cache postgresql-client redis curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taxcalc -u 1001

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

# Copy Prisma schema and migrations
COPY --from=base /usr/src/app/prisma ./prisma

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R taxcalc:nodejs /usr/src/app

# Switch to non-root user
USER taxcalc

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3004/api/health || exit 1

# Expose port
EXPOSE 3004

# Start the application
CMD ["node", "dist/index.js"]
