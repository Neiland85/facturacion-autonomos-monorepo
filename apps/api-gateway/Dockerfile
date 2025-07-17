# Multi-stage build para optimizar el tamaño final
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gateway -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Crear directorio de logs
RUN mkdir -p /app/logs && chown -R gateway:nodejs /app/logs

# Cambiar a usuario no-root
USER gateway

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio
CMD ["node", "dist/index.js"]
