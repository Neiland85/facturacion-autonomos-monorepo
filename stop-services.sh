#!/bin/bash

# Script para detener servicios de desarrollo local
# Uso: ./stop-services.sh

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

# Detener servicios Node.js
stop_node_services() {
    log_info "Deteniendo servicios Node.js..."

    local services_stopped=0

    # Buscar archivos .pid y detener procesos
    for pid_file in *.pid; do
        if [[ -f "$pid_file" ]]; then
            local service_name=$(basename "$pid_file" .pid)
            local pid=$(cat "$pid_file")

            if kill -0 "$pid" 2>/dev/null; then
                log_info "Deteniendo $service_name (PID: $pid)..."
                kill "$pid"

                # Esperar a que el proceso termine
                for i in {1..10}; do
                    if ! kill -0 "$pid" 2>/dev/null; then
                        break
                    fi
                    sleep 1
                done

                # Forzar terminación si aún está ejecutándose
                if kill -0 "$pid" 2>/dev/null; then
                    log_warning "Forzando terminación de $service_name..."
                    kill -9 "$pid"
                fi

                log_success "$service_name detenido"
                ((services_stopped++))
            else
                log_warning "$service_name ya estaba detenido"
            fi

            rm "$pid_file"
        fi
    done

    if [[ $services_stopped -eq 0 ]]; then
        log_info "No se encontraron servicios Node.js ejecutándose"
    else
        log_success "$services_stopped servicios detenidos"
    fi
}

# Detener contenedores Docker
stop_docker_services() {
    log_info "Deteniendo servicios Docker..."

    local containers=("facturacion-postgres" "facturacion-redis")

    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            log_info "Deteniendo contenedor: $container"
            docker stop "$container"
            log_success "$container detenido"
        elif docker ps -a | grep -q "$container"; then
            log_info "Eliminando contenedor detenido: $container"
            docker rm "$container"
            log_success "$container eliminado"
        else
            log_info "$container no está ejecutándose"
        fi
    done
}

# Limpiar archivos temporales
cleanup_files() {
    log_info "Limpiando archivos temporales..."

    # Eliminar archivos .pid
    rm -f *.pid

    # Limpiar logs antiguos (opcional)
    if [[ -d logs ]]; then
        find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    fi

    log_success "Limpieza completada"
}

# Función principal
main() {
    log_info "🛑 Deteniendo servicios de desarrollo local..."

    stop_node_services
    stop_docker_services
    cleanup_files

    log_success "✅ Todos los servicios detenidos y limpiados"
    log_info "Para reiniciar: ./dev-local.sh"
}

main "$@"