#!/bin/bash

# Script de despliegue local con Docker Compose
# Uso: ./deploy-local.sh

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar Docker
check_docker() {
    log_info "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker no está ejecutándose. Por favor inicia Docker Desktop."
        exit 1
    fi

    log_success "Docker está disponible"
}

# Verificar Docker Compose
check_docker_compose() {
    log_info "Verificando Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose no está disponible"
        exit 1
    fi
    log_success "Docker Compose está disponible"
}

# Crear docker-compose.local.yml optimizado para desarrollo
create_local_compose() {
    log_info "Creando configuración Docker Compose local..."

    cat > docker-compose.local.yml << 'EOF'
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: facturacion-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_dev_pass
      POSTGRES_DB: facturacion_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - facturacion-network

  # Redis para cache y sesiones
  redis:
    image: redis:7-alpine
    container_name: facturacion-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - facturacion-network

  # Aplicación web (Next.js)
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: facturacion-web
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:secure_dev_pass@postgres:5432/facturacion_dev
      REDIS_URL: redis://redis:6379
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: dev-secret-key-for-nextauth
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - facturacion-network
    command: npm run dev

  # API de facturas
  api-facturas:
    build:
      context: ./apps/invoice-service
      dockerfile: Dockerfile
    container_name: facturacion-api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:secure_dev_pass@postgres:5432/facturacion_dev
      REDIS_URL: redis://redis:6379
      PORT: 3001
    ports:
      - "3001:3001"
    volumes:
      - ./apps/invoice-service:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - facturacion-network

  # API de cálculo de impuestos
  api-tax-calculator:
    build:
      context: ./apps/api-tax-calculator
      dockerfile: Dockerfile
    container_name: facturacion-tax-api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:secure_dev_pass@postgres:5432/facturacion_dev
      PORT: 3002
    ports:
      - "3002:3002"
    volumes:
      - ./apps/api-tax-calculator:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - facturacion-network

volumes:
  postgres_data:
  redis_data:

networks:
  facturacion-network:
    driver: bridge
EOF

    log_success "Archivo docker-compose.local.yml creado"
}

# Crear archivo de inicialización de base de datos
create_db_init() {
    log_info "Creando script de inicialización de base de datos..."

    mkdir -p db

    cat > db/init.sql << 'EOF'
-- Inicialización de base de datos para desarrollo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear usuario de desarrollo si no existe
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'facturacion_user') THEN
      CREATE USER facturacion_user WITH PASSWORD 'secure_dev_pass';
   END IF;
END
$$;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE facturacion_dev TO facturacion_user;
GRANT ALL ON SCHEMA public TO facturacion_user;

-- Crear esquema básico si es necesario
-- Aquí irían las migraciones de Prisma cuando estén listas
EOF

    log_success "Script de inicialización de BD creado"
}

# Función principal
main() {
    log_info "🚀 Iniciando despliegue local con Docker Compose..."

    check_docker
    check_docker_compose
    create_local_compose
    create_db_init

    log_info "📦 Construyendo e iniciando servicios..."
    log_warning "Esto puede tomar varios minutos en la primera ejecución"

    # Usar docker compose (nueva sintaxis) o docker-compose (legacy)
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.local.yml up --build -d
    else
        docker-compose -f docker-compose.local.yml up --build -d
    fi

    log_success "✅ Servicios desplegados exitosamente!"
    log_info "🌐 Aplicación disponible en:"
    echo "  • Web App: http://localhost:3000"
    echo "  • API Facturas: http://localhost:3001"
    echo "  • API Tax Calculator: http://localhost:3002"
    echo "  • PostgreSQL: localhost:5432"
    echo "  • Redis: localhost:6379"
    log_info "📊 Para ver logs: docker compose -f docker-compose.local.yml logs -f"
    log_info "🛑 Para detener: docker compose -f docker-compose.local.yml down"
}

main "$@"