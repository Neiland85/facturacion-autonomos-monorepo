# Multi-stage build para Auth Service
FROM node:20-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de la raíz
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Stage para desarrollo
FROM base AS development

# Copiar todos los archivos del proyecto
COPY . .

# Instalar todas las dependencias (incluyendo devDependencies)
RUN pnpm install --frozen-lockfile

# Construir el proyecto
RUN pnpm run build --filter=@facturacion/auth-service

# Comando para desarrollo
CMD ["pnpm", "--filter=@facturacion/auth-service", "dev"]

# Stage para producción
FROM base AS production

# Copiar archivos del proyecto
COPY . .

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Construir el proyecto
RUN pnpm run build --filter=@facturacion/auth-service

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S authservice -u 1001

# Cambiar al usuario no-root
USER authservice

# Exponer puerto
EXPOSE 4001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Comando para producción
CMD ["node", "apps/auth-service/dist/index.js"]
