# Dockerfile para Web (Next.js)
# Imagen base optimizada para Node.js
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    ca-certificates \
    dumb-init \
    libc6-compat

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
COPY apps/web/package.json ./apps/web/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Instalar dependencias (solo producción)
RUN yarn workspaces focus @facturacion/web --production

# Etapa de construcción
FROM base AS builder

# Copiar dependencias instaladas
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/.yarn ./.yarn

# Copiar código fuente
COPY apps/web ./apps/web
COPY packages/core ./packages/core
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui

# Copiar archivos de configuración
COPY tsconfig.json ./
COPY eslint.config.mjs ./

# Configurar variables de entorno para build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación Next.js
RUN yarn workspace @facturacion/web build

# Etapa de producción
FROM base AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar archivos necesarios para producción
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copiar archivos estáticos y de construcción
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copiar archivos de configuración del workspace
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nextjs:nodejs /app/.yarnrc.yml ./

# Configurar el directorio de trabajo para la aplicación
WORKDIR /app/apps/web

# Cambiar a usuario no-root
USER nextjs

# Exponer el puerto
EXPOSE 3000

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: '0.0.0.0', port: 3000, path: '/', timeout: 5000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Comando de inicio con dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
