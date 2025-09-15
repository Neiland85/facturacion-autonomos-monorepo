#!/bin/bash

# TributariApp Docker Deployment Preparation Script
set -e

echo "🚀 Preparando despliegue de TributariApp con Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Docker is available
check_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_success "✅ Docker y Docker Compose están disponibles"
        return 0
    else
        print_warning "⚠️  Docker o Docker Compose no están disponibles"
        print_info "Instala Docker Desktop o Docker Engine para continuar"
        return 1
    fi
}

# Create environment file
create_env_file() {
    print_status "Verificando archivo de variables de entorno..."

    if [ ! -f ".env" ]; then
        print_info "Creando archivo .env básico..."
        cat > .env << EOF
# Database Configuration
POSTGRES_USER=tributariapp
POSTGRES_PASSWORD=password123
POSTGRES_DB=tributariapp
DATABASE_URL=postgresql://tributariapp:password123@postgres:5432/tributariapp

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-$(date +%s)

# AEAT Configuration
AEAT_API_KEY=your-aeat-api-key
AEAT_BASE_URL=https://www.agenciatributaria.es

# Application URLs (for internal communication)
INVOICE_SERVICE_URL=http://invoice-service:3002
AUTH_SERVICE_URL=http://auth-service:3003
TAX_CALCULATOR_URL=http://tax-calculator-service:3004
EOF
        print_success "✅ Archivo .env creado con valores por defecto"
        print_warning "⚠️  RECUERDA: Cambia las contraseñas y secrets antes de producción"
    else
        print_info "ℹ️  Archivo .env ya existe"
    fi
}

# Create logs directory
create_logs_directory() {
    print_status "Creando directorio de logs..."

    mkdir -p logs/{web,api-gateway,auth-service,invoice-service,tax-calculator}
    print_success "✅ Directorio de logs creado"
}

# Validate Docker Compose configuration
validate_docker_compose() {
    print_status "Validando configuración de Docker Compose..."

    if [ -f "docker-compose.prod.yml" ]; then
        if docker-compose -f docker-compose.prod.yml config --quiet 2>/dev/null; then
            print_success "✅ Configuración de Docker Compose válida"
            return 0
        else
            print_error "❌ Error en configuración de Docker Compose"
            return 1
        fi
    else
        print_error "❌ Archivo docker-compose.prod.yml no encontrado"
        return 1
    fi
}

# Test Docker builds
test_docker_builds() {
    print_status "Probando construcción de imágenes Docker..."

    local services=("invoice-service" "auth-service" "api-gateway" "api-tax-calculator" "web")
    local failed_services=()

    for service in "${services[@]}"; do
        print_info "Construyendo imagen para $service..."

        if docker build -f "apps/$service/docker/Dockerfile" -t "test-$service" "apps/$service" 2>/dev/null; then
            print_success "✅ $service construido exitosamente"
            # Clean up test image
            docker rmi "test-$service" 2>/dev/null || true
        else
            print_error "❌ Error al construir $service"
            failed_services+=("$service")
        fi
    done

    if [ ${#failed_services[@]} -eq 0 ]; then
        print_success "✅ Todas las imágenes Docker se construyeron correctamente"
        return 0
    else
        print_error "❌ ${#failed_services[@]} servicios fallaron al construirse: ${failed_services[*]}"
        return 1
    fi
}

# Show deployment summary
show_deployment_summary() {
    echo ""
    echo "🎯 RESUMEN DEL DESPLIEGUE DE TributariApp"
    echo "========================================"
    echo ""
    echo "🏗️  ARQUITECTURA COMPLETA:"
    echo "  • 🌐 Web App (Next.js)"
    echo "  • 🚪 API Gateway"
    echo "  • 🔐 Auth Service"
    echo "  • 📄 Invoice Service"
    echo "  • 🧮 Tax Calculator Service"
    echo "  • 🗄️  PostgreSQL Database"
    echo "  • ⚡ Redis Cache"
    echo "  • 📊 Prometheus Monitoring"
    echo ""
    echo "📊 PUERTOS DE SERVICIO:"
    echo "  🌐 Web App:        http://localhost:3000"
    echo "  🚪 API Gateway:    http://localhost:3001"
    echo "  🔐 Auth Service:   http://localhost:3003"
    echo "  📄 Invoice Service: http://localhost:3002"
    echo "  🧮 Tax Calculator: http://localhost:3004"
    echo "  🗄️  PostgreSQL:     localhost:5432"
    echo "  ⚡ Redis:          localhost:6379"
    echo "  📊 Prometheus:     http://localhost:9090"
    echo ""
}

# Show next steps
show_next_steps() {
    echo "🚀 PRÓXIMOS PASOS:"
    echo "=================="
    echo ""
    echo "1. EJECUTAR DESPLIEGUE COMPLETO:"
    echo "   ./deploy-docker.sh"
    echo ""
    echo "2. VERIFICAR SERVICIOS:"
    echo "   docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "3. PROBAR HEALTH CHECKS:"
    echo "   curl http://localhost:3000/api/health"
    echo "   curl http://localhost:3001/api/health"
    echo ""
    echo "4. VER LOGS:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "5. ACCEDER A LA APLICACIÓN:"
    echo "   http://localhost:3000"
    echo ""
}

# Main execution
main() {
    echo "🎯 TRIBUTARIAPP - PREPARACIÓN DE DESPLIEGUE DOCKER"
    echo "================================================"
    echo ""

    # Check Docker availability
    if ! check_docker; then
        print_error "❌ Docker no está disponible. Instálalo antes de continuar."
        echo ""
        show_next_steps
        exit 1
    fi

    # Create environment file
    create_env_file

    # Create logs directory
    create_logs_directory

    # Validate Docker Compose
    if ! validate_docker_compose; then
        print_error "❌ Configuración de Docker Compose inválida"
        exit 1
    fi

    # Test Docker builds
    if ! test_docker_builds; then
        print_error "❌ Algunos Docker builds fallaron"
        print_info "Revisa los logs de construcción para más detalles"
        exit 1
    fi

    # Show deployment summary
    show_deployment_summary

    # Show status
    echo "📋 ESTADO DE PREPARACIÓN:"
    echo "  ✅ Docker y Docker Compose disponibles"
    echo "  ✅ Variables de entorno configuradas"
    echo "  ✅ Directorio de logs creado"
    echo "  ✅ Configuración de Docker Compose válida"
    echo "  ✅ Todas las imágenes Docker se construyen correctamente"
    echo ""

    print_success "🎉 ¡PREPARACIÓN COMPLETADA EXITOSAMENTE!"
    echo ""
    echo "🚀 LISTO PARA DESPLIEGUE"
    echo "Ejecuta el siguiente comando para iniciar TributariApp:"
    echo ""
    echo "  ./deploy-docker.sh"
    echo ""
}

# Execute main function
main "$@"
