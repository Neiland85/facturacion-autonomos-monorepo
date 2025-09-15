#!/bin/bash

# Integration Test Script for TributariApp
set -e

echo "🧪 Ejecutando Tests de Integración - TributariApp..."

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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Run unit tests
print_status "Ejecutando tests unitarios..."
if pnpm test; then
    print_success "✅ Tests unitarios pasaron exitosamente"
else
    print_error "❌ Tests unitarios fallaron"
    exit 1
fi

# Run type checking
print_status "Verificando tipos TypeScript..."
if pnpm type-check; then
    print_success "✅ Verificación de tipos completada"
else
    print_error "❌ Error en verificación de tipos"
    exit 1
fi

# Run linting
print_status "Ejecutando linting..."
if pnpm lint:check; then
    print_success "✅ Linting completado sin errores"
else
    print_warning "⚠️  Se encontraron problemas de linting"
    print_status "Intentando corregir automáticamente..."
    if pnpm lint:fix; then
        print_success "✅ Problemas de linting corregidos"
    else
        print_error "❌ No se pudieron corregir los problemas de linting"
        exit 1
    fi
fi

# Build all packages
print_status "Construyendo todos los paquetes..."
if pnpm build; then
    print_success "✅ Build completado exitosamente"
else
    print_error "❌ Error en el build"
    exit 1
fi

# Test Docker build (if Docker is available)
if command -v docker &> /dev/null; then
    print_status "Probando construcción de imágenes Docker..."

    # Test invoice-service Docker build
    if docker build -f apps/invoice-service/docker/Dockerfile -t test-invoice-service apps/invoice-service; then
        print_success "✅ Docker build invoice-service exitoso"
        docker rmi test-invoice-service
    else
        print_error "❌ Error en Docker build invoice-service"
        exit 1
    fi

    # Test auth-service Docker build
    if docker build -f apps/auth-service/docker/Dockerfile -t test-auth-service apps/auth-service; then
        print_success "✅ Docker build auth-service exitoso"
        docker rmi test-auth-service
    else
        print_error "❌ Error en Docker build auth-service"
        exit 1
    fi

    print_success "✅ Todos los Docker builds pasaron"
else
    print_warning "⚠️  Docker no está disponible, saltando tests de Docker"
fi

# Integration test summary
print_success "🎉 ¡Todos los tests de integración pasaron exitosamente!"
echo ""
echo "📊 Resumen de Tests Ejecutados:"
echo "  ✅ Tests unitarios"
echo "  ✅ Verificación de tipos TypeScript"
echo "  ✅ Linting y formato"
echo "  ✅ Build de todos los paquetes"
if command -v docker &> /dev/null; then
echo "  ✅ Construcción de imágenes Docker"
fi
echo ""
echo "🚀 El proyecto está listo para despliegue"
echo "💡 Próximos pasos recomendados:"
echo "  1. Ejecutar: ./deploy-docker.sh"
echo "  2. Verificar servicios en: http://localhost:3000"
echo "  3. Configurar CI/CD pipeline"
