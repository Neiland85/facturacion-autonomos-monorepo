# Multi-stage Dockerfile for facturacion-autonomos-monorepo
FROM node:20-alpine AS base

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Copy database migration files
COPY db/ ./db/
RUN chmod +x ./db/run-migrations.sh

# Build the project
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from base stage
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/db ./db

# Set up health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start script that runs migrations and then starts the app
CMD ["sh", "-c", "./db/run-migrations.sh && pnpm start"]
