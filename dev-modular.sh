#!/bin/bash

# 🎯 Script de Desarrollo Modular para TributariApp
# Permite ejecutar servicios específicos o todos juntos

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar dependencias
check_dependencies() {
    print_info "Verificando dependencias..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm no está instalado"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_warning "Docker no está disponible - algunos servicios podrían no funcionar"
    fi

    print_success "Dependencias verificadas"
}

# Función para instalar dependencias
install_deps() {
    print_info "Instalando dependencias del monorepo..."
    pnpm install
    print_success "Dependencias instaladas"
}

# Función para ejecutar linting y formateo
lint_and_format() {
    print_info "Ejecutando linting y formateo..."

    # Ejecutar en todo el monorepo
    pnpm run lint:fix
    pnpm run format

    print_success "Linting y formateo completados"
}

# Función para compilar librería UI
build_ui_library() {
    print_info "Compilando librería UI..."
    cd packages/ui
    pnpm run build
    cd ../..
    print_success "Librería UI compilada"
}

# Función para iniciar base de datos
start_database() {
    print_info "Iniciando base de datos PostgreSQL..."

    if command -v docker &> /dev/null; then
        docker-compose -f docker-compose.yml up -d postgres
        print_success "Base de datos iniciada"
    else
        print_warning "Docker no disponible - base de datos no iniciada"
    fi
}

# Función para ejecutar migraciones de BD
setup_database() {
    print_info "Configurando base de datos..."
    pnpm run db:push
    print_success "Base de datos configurada"
}

# Función para iniciar servicios individuales
start_service() {
    local service=$1
    local port=$2

    print_info "Iniciando $service en puerto $port..."

    case $service in
        "web")
            cd apps/web
            pnpm run dev &
            ;;
        "invoice-service")
            cd apps/invoice-service
            pnpm run dev &
            ;;
        "auth-service")
            cd apps/auth-service
            pnpm run dev &
            ;;
        "api-gateway")
            cd apps/api-gateway
            pnpm run dev &
            ;;
        "api-tax-calculator")
            cd apps/api-tax-calculator
            pnpm run dev &
            ;;
        *)
            print_error "Servicio desconocido: $service"
            return 1
            ;;
    esac

    print_success "$service iniciado"
}

# Función para iniciar todos los servicios
start_all_services() {
    print_info "Iniciando todos los servicios..."

    # Iniciar servicios en background
    start_service "auth-service" "3003"
    sleep 2

    start_service "invoice-service" "3001"
    sleep 2

    start_service "api-tax-calculator" "3002"
    sleep 2

    start_service "api-gateway" "3004"
    sleep 2

    start_service "web" "3000"

    print_success "Todos los servicios iniciados"
    echo ""
    print_info "URLs de acceso:"
    echo "🌐 Frontend Web:     http://localhost:3000"
    echo "🔐 Auth Service:     http://localhost:3003"
    echo "📄 Invoice Service:  http://localhost:3001"
    echo "🧮 Tax Calculator:   http://localhost:3002"
    echo "🚪 API Gateway:      http://localhost:3004"
}

# Función para detener servicios
stop_services() {
    print_info "Deteniendo servicios..."
    pkill -f "next dev" || true
    pkill -f "tsx watch" || true
    pkill -f "node" || true

    if command -v docker &> /dev/null; then
        docker-compose -f docker-compose.yml down
    fi

    print_success "Servicios detenidos"
}

# Función para mostrar ayuda
show_help() {
    echo "🎯 Script de Desarrollo Modular - TributariApp"
    echo ""
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo "Comandos disponibles:"
    echo "  setup           Configuración inicial completa"
    echo "  install         Instalar dependencias"
    echo "  lint            Ejecutar linting y formateo"
    echo "  build-ui        Compilar librería UI"
    echo "  db-start        Iniciar base de datos"
    echo "  db-setup        Configurar base de datos"
    echo "  dev [servicio]  Iniciar desarrollo (servicio específico o todos)"
    echo "  stop            Detener todos los servicios"
    echo "  help            Mostrar esta ayuda"
    echo ""
    echo "Servicios disponibles:"
    echo "  web, invoice-service, auth-service, api-gateway, api-tax-calculator"
    echo ""
    echo "Ejemplos:"
    echo "  $0 setup                    # Configuración completa"
    echo "  $0 dev web                  # Solo frontend"
    echo "  $0 dev invoice-service      # Solo servicio de facturas"
    echo "  $0 dev                      # Todos los servicios"
}

# Función principal
main() {
    local command=$1
    local service=$2

    case $command in
        "setup")
            check_dependencies
            install_deps
            lint_and_format
            build_ui_library
            start_database
            setup_database
            print_success "Configuración inicial completada"
            ;;
        "install")
            check_dependencies
            install_deps
            ;;
        "lint")
            lint_and_format
            ;;
        "build-ui")
            build_ui_library
            ;;
        "db-start")
            start_database
            ;;
        "db-setup")
            setup_database
            ;;
        "dev")
            if [ -n "$service" ]; then
                start_service "$service"
            else
                start_all_services
            fi
            ;;
        "stop")
            stop_services
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"
