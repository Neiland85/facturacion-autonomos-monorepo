# Dockerfile para el servicio de facturas
FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY ../../package*.json ../../pnpm-*.yaml ../../

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Build de TypeScript
RUN npm run build

# Imagen de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copiar archivos compilados
COPY --from=base --chown=nodejs:nodejs /app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/package*.json ./
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]