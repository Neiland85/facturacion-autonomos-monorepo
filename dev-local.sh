#!/bin/bash

# Script de desarrollo local sin Docker
# Uso: ./dev-local.sh

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

# Verificar Node.js
check_node() {
    log_info "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi

    local node_version=$(node --version | sed 's/v//')
    log_info "Node.js versión: $node_version"

    if ! command -v npm &> /dev/null; then
        log_error "npm no está instalado"
        exit 1
    fi

    log_success "Node.js y npm están disponibles"
}

# Verificar PostgreSQL local
check_postgres() {
    log_info "Verificando PostgreSQL..."
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL no está instalado localmente"
        log_info "Se intentará usar Docker para PostgreSQL..."
        return 1
    fi

    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        log_warning "PostgreSQL no está ejecutándose en localhost:5432"
        log_info "Se intentará usar Docker para PostgreSQL..."
        return 1
    fi

    log_success "PostgreSQL está disponible"
    return 0
}

# Iniciar servicios con Docker si está disponible
start_docker_services() {
    log_info "Verificando Docker para servicios auxiliares..."

    if ! command -v docker &> /dev/null; then
        log_warning "Docker no está disponible, omitiendo servicios auxiliares"
        return 1
    fi

    if ! docker info &> /dev/null; then
        log_warning "Docker no está ejecutándose, omitiendo servicios auxiliares"
        return 1
    fi

    log_info "Iniciando PostgreSQL y Redis con Docker..."

    # Crear red si no existe
    docker network create facturacion-network 2>/dev/null || true

    # Iniciar PostgreSQL
    if ! docker ps | grep -q facturacion-postgres; then
        docker run -d \
          --name facturacion-postgres \
          --network facturacion-network \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=secure_dev_pass \
          -e POSTGRES_DB=facturacion_dev \
          -p 5432:5432 \
          postgres:15-alpine
        log_info "PostgreSQL iniciado en puerto 5432"
    fi

    # Iniciar Redis
    if ! docker ps | grep -q facturacion-redis; then
        docker run -d \
          --name facturacion-redis \
          --network facturacion-network \
          -p 6379:6379 \
          redis:7-alpine
        log_info "Redis iniciado en puerto 6379"
    fi

    # Esperar a que PostgreSQL esté listo
    log_info "Esperando a que PostgreSQL esté listo..."
    for i in {1..30}; do
        if docker exec facturacion-postgres pg_isready -U postgres &>/dev/null; then
            log_success "PostgreSQL está listo"
            break
        fi
        sleep 2
    done

    return 0
}

# Instalar dependencias
install_deps() {
    log_info "Instalando dependencias..."

    if command -v pnpm &> /dev/null; then
        log_info "Usando pnpm para instalar dependencias..."
        pnpm install
    else
        log_info "Usando npm para instalar dependencias..."
        npm install
    fi

    log_success "Dependencias instaladas"
}

# Ejecutar migraciones de base de datos
run_migrations() {
    log_info "Ejecutando migraciones de base de datos..."

    if command -v pnpm &> /dev/null; then
        pnpm run db:push
    else
        npm run db:push
    fi

    log_success "Migraciones completadas"
}

# Iniciar servicios en segundo plano
start_services() {
    log_info "Iniciando servicios..."

    # Función para iniciar un servicio
    start_service() {
        local service_name="$1"
        local command="$2"
        local log_file="$3"

        log_info "Iniciando $service_name..."
        nohup $command > "$log_file" 2>&1 &
        echo $! > "${service_name}.pid"
        log_success "$service_name iniciado (PID: $!)"
    }

    # Iniciar API de facturas
    cd apps/invoice-service
    start_service "invoice-service" "npm run dev" "../../logs/invoice-service.log"
    cd ../..

    # Iniciar API de tax calculator
    cd apps/api-tax-calculator
    start_service "tax-calculator" "npm run dev" "../../logs/tax-calculator.log"
    cd ../..

    # Iniciar aplicación web
    cd apps/web
    start_service "web-app" "npm run dev" "../../logs/web-app.log"
    cd ../..

    log_success "Todos los servicios iniciados"
}

# Mostrar estado de servicios
show_status() {
    log_info "Estado de servicios:"
    echo ""
    echo "🌐 Aplicación Web:     http://localhost:3000"
    echo "📄 API Facturas:       http://localhost:3001"
    echo "🧾 API Tax Calculator: http://localhost:3002"
    echo "🐘 PostgreSQL:         localhost:5432"
    echo "🔴 Redis:              localhost:6379"
    echo ""
    log_info "Para ver logs de un servicio:"
    echo "  tail -f logs/web-app.log"
    echo "  tail -f logs/invoice-service.log"
    echo "  tail -f logs/tax-calculator.log"
    echo ""
    log_info "Para detener servicios:"
    echo "  ./stop-services.sh"
}

# Función principal
main() {
    log_info "🚀 Iniciando desarrollo local..."

    mkdir -p logs

    check_node

    if check_postgres; then
        log_info "Usando PostgreSQL local"
    else
        if start_docker_services; then
            log_info "Usando servicios Docker"
        else
            log_warning "No hay PostgreSQL disponible. Algunos servicios pueden no funcionar correctamente."
        fi
    fi

    install_deps
    run_migrations
    start_services
    show_status

    log_success "✅ Desarrollo local iniciado exitosamente!"
    log_info "Presiona Ctrl+C para detener todos los servicios"
}

# Función de cleanup
cleanup() {
    log_info "Deteniendo servicios..."

    # Matar procesos
    for pid_file in *.pid; do
        if [[ -f "$pid_file" ]]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                log_info "Servicio detenido (PID: $pid)"
            fi
            rm "$pid_file"
        fi
    done

    # Detener contenedores Docker si existen
    if command -v docker &> /dev/null; then
        docker stop facturacion-postgres facturacion-redis 2>/dev/null || true
        docker rm facturacion-postgres facturacion-redis 2>/dev/null || true
    fi

    log_success "Limpieza completada"
    exit 0
}

# Capturar señales para cleanup
trap cleanup SIGINT SIGTERM

main "$@"