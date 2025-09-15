# Dockerfile para el servicio de cálculo de impuestos
# Imagen base optimizada para Node.js
FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    libc6-compat \
    curl

# Configurar el directorio de trabajo
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

# Configurar el directorio de trabajo
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copiar archivos compilados
COPY --from=base --chown=nodejs:nodejs /app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /app/package*.json ./
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules

# Cambiar a usuario no-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Exponer puerto
EXPOSE 3002

# Comando de inicio
CMD ["npm", "start"]
