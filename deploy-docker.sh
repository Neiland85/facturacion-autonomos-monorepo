#!/bin/bash

# Docker Production Deployment Script for TributariApp
set -e

echo "🚀 Iniciando despliegue de TributariApp con Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado. Creando uno básico..."
    cat > .env << EOF
# Database Configuration
POSTGRES_USER=tributariapp
POSTGRES_PASSWORD=password123
POSTGRES_DB=tributariapp
DATABASE_URL=postgresql://tributariapp:password123@postgres:5432/tributariapp

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# AEAT Configuration
AEAT_API_KEY=your-aeat-api-key
AEAT_BASE_URL=https://www.agenciatributaria.es

# Application URLs (for internal communication)
INVOICE_SERVICE_URL=http://invoice-service:3002
AUTH_SERVICE_URL=http://auth-service:3003
TAX_CALCULATOR_URL=http://tax-calculator-service:3004
EOF
    print_status "Archivo .env creado. Por favor, revisa y actualiza las variables de entorno."
fi

# Create logs directory
mkdir -p logs/{web,api-gateway,auth-service,invoice-service,tax-calculator}

# Stop existing containers
print_status "Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down || true

# Build and start services
print_status "Construyendo y iniciando servicios..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Check service health
print_status "Verificando estado de los servicios..."

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/api/health" > /dev/null 2>&1; then
            print_status "✅ $service_name está saludable"
            return 0
        fi
        print_warning "Esperando a que $service_name esté listo... (intento $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    print_error "❌ $service_name no está respondiendo"
    return 1
}

# Check all services
services_healthy=true

check_service "API Gateway" "http://localhost:3001" || services_healthy=false
check_service "Auth Service" "http://localhost:3003" || services_healthy=false
check_service "Invoice Service" "http://localhost:3002" || services_healthy=false
check_service "Tax Calculator" "http://localhost:3004" || services_healthy=false
check_service "Web App" "http://localhost:3000" || services_healthy=false

if [ "$services_healthy" = true ]; then
    print_status "🎉 ¡Despliegue completado exitosamente!"
    echo ""
    echo "📊 Servicios disponibles:"
    echo "  🌐 Web App:        http://localhost:3000"
    echo "  🚪 API Gateway:    http://localhost:3001"
    echo "  🔐 Auth Service:   http://localhost:3003"
    echo "  📄 Invoice Service: http://localhost:3002"
    echo "  🧮 Tax Calculator: http://localhost:3004"
    echo "  📊 Prometheus:     http://localhost:9090"
    echo ""
    echo "🔍 Para ver logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]"
    echo "🛑 Para detener: docker-compose -f docker-compose.prod.yml down"
else
    print_error "Algunos servicios no están saludables. Revisa los logs para más detalles."
    echo "🔍 Ver logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
