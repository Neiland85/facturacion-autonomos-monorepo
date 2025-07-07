# Dockerfile para API de Facturas
# Imagen base optimizada para Node.js
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    dumb-init

# Configurar el directorio de trabajo
WORKDIR /app

# Habilitar Corepack para Yarn
RUN corepack enable

# Copiar archivos de configuración del workspace
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Etapa de dependencias
FROM base AS dependencies

# Copiar archivos de configuración de todos los paquetes
COPY apps/api-facturas/package.json ./apps/api-facturas/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/services/package.json ./packages/services/package.json

# Instalar dependencias (solo producción)
RUN yarn workspaces focus @facturacion/api-facturas --production

# Etapa de construcción
FROM base AS builder

# Copiar dependencias instaladas
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/.yarn ./.yarn

# Copiar código fuente
COPY apps/api-facturas ./apps/api-facturas
COPY packages/core ./packages/core
COPY packages/types ./packages/types
COPY packages/services ./packages/services

# Copiar archivos de configuración
COPY tsconfig.json ./
COPY eslint.config.mjs ./

# Construir la aplicación
RUN yarn workspace @facturacion/api-facturas build

# Generar cliente de Prisma
RUN cd apps/api-facturas && yarn prisma generate

# Etapa de producción
FROM base AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar archivos necesarios para producción
COPY --from=builder --chown=nodejs:nodejs /app/apps/api-facturas/dist ./apps/api-facturas/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api-facturas/package.json ./apps/api-facturas/package.json
COPY --from=builder --chown=nodejs:nodejs /app/apps/api-facturas/prisma ./apps/api-facturas/prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

# Copiar archivos de configuración del workspace
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nodejs:nodejs /app/.yarnrc.yml ./

# Configurar el directorio de trabajo para la aplicación
WORKDIR /app/apps/api-facturas

# Cambiar a usuario no-root
USER nodejs

# Exponer el puerto
EXPOSE 3000
EXPOSE 9090

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: '0.0.0.0', port: 3000, path: '/health', timeout: 5000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Comando de inicio con dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
