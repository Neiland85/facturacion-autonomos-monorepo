#!/bin/bash

# Script de desarrollo para microservicios
# Facilita el manejo de múltiples servicios con pnpm

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🚀 Facturación Autónomos - Herramientas de Desarrollo${NC}"
    echo ""
    echo "Uso: ./dev.sh [comando] [opciones]"
    echo ""
    echo "Comandos disponibles:"
    echo -e "  ${GREEN}install${NC}      - Instalar dependencias en todos los workspaces"
    echo -e "  ${GREEN}build${NC}        - Construir todos los servicios"
    echo -e "  ${GREEN}dev${NC}          - Iniciar todos los servicios en modo desarrollo"
    echo -e "  ${GREEN}dev:gateway${NC}  - Solo API Gateway"
    echo -e "  ${GREEN}dev:auth${NC}     - Solo Auth Service"
    echo -e "  ${GREEN}test${NC}         - Ejecutar todos los tests"
    echo -e "  ${GREEN}test:unit${NC}    - Solo tests unitarios"
    echo -e "  ${GREEN}test:e2e${NC}     - Solo tests end-to-end"
    echo -e "  ${GREEN}lint${NC}         - Ejecutar linting en todo el proyecto"
    echo -e "  ${GREEN}lint:fix${NC}     - Corregir automáticamente errores de linting"
    echo -e "  ${GREEN}docker:up${NC}    - Iniciar servicios con Docker Compose"
    echo -e "  ${GREEN}docker:down${NC}  - Parar servicios Docker"
    echo -e "  ${GREEN}docker:logs${NC}  - Ver logs de Docker"
    echo -e "  ${GREEN}clean${NC}        - Limpiar builds y node_modules"
    echo -e "  ${GREEN}status${NC}       - Ver estado de los servicios"
    echo ""
}

# Función para instalar dependencias
install_deps() {
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    pnpm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
}

# Función para build
build_all() {
    echo -e "${YELLOW}🏗️ Construyendo todos los servicios...${NC}"
    pnpm run build
    echo -e "${GREEN}✅ Build completado${NC}"
}

# Función para desarrollo
dev_all() {
    echo -e "${YELLOW}🚀 Iniciando todos los servicios en modo desarrollo...${NC}"
    echo -e "${BLUE}Servicios disponibles:${NC}"
    echo -e "  - API Gateway: http://localhost:4000"
    echo -e "  - Auth Service: http://localhost:4001"
    echo -e "  - Documentación Gateway: http://localhost:4000/docs"
    echo -e "  - Documentación Auth: http://localhost:4001/docs"
    echo ""
    pnpm run dev
}

# Función para desarrollo de gateway
dev_gateway() {
    echo -e "${YELLOW}🌐 Iniciando API Gateway...${NC}"
    echo -e "${BLUE}Gateway disponible en: http://localhost:4000${NC}"
    pnpm --filter=@facturacion/api-gateway dev
}

# Función para desarrollo de auth
dev_auth() {
    echo -e "${YELLOW}🔐 Iniciando Auth Service...${NC}"
    echo -e "${BLUE}Auth Service disponible en: http://localhost:4001${NC}"
    pnpm --filter=@facturacion/auth-service dev
}

# Función para tests
test_all() {
    echo -e "${YELLOW}🧪 Ejecutando todos los tests...${NC}"
    pnpm run test
}

# Función para tests unitarios
test_unit() {
    echo -e "${YELLOW}🧪 Ejecutando tests unitarios...${NC}"
    pnpm run test:unit
}

# Función para linting
lint_all() {
    echo -e "${YELLOW}🔍 Ejecutando linting...${NC}"
    pnpm run lint
}

# Función para lint fix
lint_fix() {
    echo -e "${YELLOW}🔧 Corrigiendo errores de linting...${NC}"
    pnpm run lint:fix
    echo -e "${GREEN}✅ Linting corregido${NC}"
}

# Función para Docker up
docker_up() {
    echo -e "${YELLOW}🐳 Iniciando servicios con Docker Compose...${NC}"
    docker-compose -f docker-compose.microservices.yml up -d
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo -e "${BLUE}Servicios disponibles:${NC}"
    echo -e "  - API Gateway: http://localhost:4000"
    echo -e "  - Auth Service: http://localhost:4001"
    echo -e "  - PostgreSQL: localhost:5432"
    echo -e "  - Redis: localhost:6379"
    echo -e "  - Prometheus: http://localhost:9090"
    echo -e "  - Grafana: http://localhost:3001 (admin/admin)"
}

# Función para Docker down
docker_down() {
    echo -e "${YELLOW}🐳 Parando servicios Docker...${NC}"
    docker-compose -f docker-compose.microservices.yml down
    echo -e "${GREEN}✅ Servicios parados${NC}"
}

# Función para Docker logs
docker_logs() {
    echo -e "${YELLOW}📋 Mostrando logs de Docker...${NC}"
    docker-compose -f docker-compose.microservices.yml logs -f
}

# Función para limpiar
clean_all() {
    echo -e "${YELLOW}🧹 Limpiando proyecto...${NC}"
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
    echo -e "${GREEN}✅ Proyecto limpiado${NC}"
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    echo ""
    
    # Verificar puertos
    check_port() {
        if nc -z localhost $1 2>/dev/null; then
            echo -e "  ✅ Puerto $1: ${GREEN}ACTIVO${NC}"
        else
            echo -e "  ❌ Puerto $1: ${RED}INACTIVO${NC}"
        fi
    }
    
    check_port 4000  # API Gateway
    check_port 4001  # Auth Service
    check_port 5432  # PostgreSQL
    check_port 6379  # Redis
    check_port 9090  # Prometheus
    check_port 3001  # Grafana
    
    echo ""
    echo -e "${BLUE}📁 Workspaces disponibles:${NC}"
    pnpm list --depth=-1 2>/dev/null | grep "@facturacion" || echo "  No se encontraron workspaces"
}

# Procesamiento de argumentos
case "${1:-help}" in
    "install")
        install_deps
        ;;
    "build")
        build_all
        ;;
    "dev")
        dev_all
        ;;
    "dev:gateway")
        dev_gateway
        ;;
    "dev:auth")
        dev_auth
        ;;
    "test")
        test_all
        ;;
    "test:unit")
        test_unit
        ;;
    "lint")
        lint_all
        ;;
    "lint:fix")
        lint_fix
        ;;
    "docker:up")
        docker_up
        ;;
    "docker:down")
        docker_down
        ;;
    "docker:logs")
        docker_logs
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
