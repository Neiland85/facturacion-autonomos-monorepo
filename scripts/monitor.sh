#!/bin/bash

# Script de Monitoreo Continuo - Monorepo Facturación Autónomos
# Uso: ./scripts/monitor.sh [intervalo_en_segundos]

INTERVAL=${1:-300}  # Default: 5 minutos

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

monitor_git_status() {
    local changes=$(git status --porcelain | wc -l)
    local branch=$(git branch --show-current)
    local last_commit=$(git log -1 --format="%h - %s" --oneline)
    
    echo "Git Status:"
    echo "  - Rama actual: $branch"
    echo "  - Archivos modificados: $changes"
    echo "  - Último commit: $last_commit"
}

monitor_processes() {
    echo "Procesos de desarrollo activos:"
    
    # Buscar procesos de Node.js relacionados
    local node_processes=$(ps aux | grep -E "(node|yarn|npm)" | grep -v grep | wc -l)
    echo "  - Procesos Node.js: $node_processes"
    
    # Verificar puertos comunes
    if lsof -i :3000 >/dev/null 2>&1; then
        echo "  - Puerto 3000 (Frontend): 🟢 ACTIVO"
    else
        echo "  - Puerto 3000 (Frontend): 🔴 INACTIVO"
    fi
    
    if lsof -i :8000 >/dev/null 2>&1; then
        echo "  - Puerto 8000 (Backend): 🟢 ACTIVO"
    else
        echo "  - Puerto 8000 (Backend): 🔴 INACTIVO"
    fi
}

monitor_dependencies() {
    echo "Estado de dependencias:"
    
    # Verificar integridad de yarn.lock
    if yarn install --check-files >/dev/null 2>&1; then
        echo "  - Yarn integrity: ✅ OK"
    else
        echo "  - Yarn integrity: ⚠️ REQUIERE ATENCIÓN"
    fi
    
    # Verificar node_modules
    local nm_size=$(du -sh .yarn 2>/dev/null | cut -f1 || echo "N/A")
    echo "  - Tamaño .yarn: $nm_size"
}

monitor_disk_usage() {
    echo "Uso de disco:"
    
    local total_size=$(du -sh . | cut -f1)
    local available_space=$(df -h . | awk 'NR==2 {print $4}')
    
    echo "  - Tamaño proyecto: $total_size"
    echo "  - Espacio disponible: $available_space"
}

monitor_logs() {
    echo "Logs recientes:"
    
    # Backend logs
    if [ -f "backend/combined.log" ]; then
        local backend_errors=$(tail -n 100 backend/combined.log | grep -i error | wc -l)
        echo "  - Backend errors (últimas 100 líneas): $backend_errors"
    fi
    
    # Error logs
    if [ -f "backend/error.log" ]; then
        local file_size=$(wc -l < backend/error.log)
        echo "  - Error log lines: $file_size"
    fi
}

# Función principal de monitoreo
run_monitoring_cycle() {
    clear
    echo "=================================="
    echo "  MONITOREO CONTINUO - $(date)"
    echo "  Intervalo: ${INTERVAL}s"
    echo "=================================="
    echo
    
    monitor_git_status
    echo
    monitor_processes
    echo
    monitor_dependencies
    echo
    monitor_disk_usage
    echo
    monitor_logs
    echo
    
    echo "=================================="
    echo "Próxima verificación en ${INTERVAL} segundos..."
    echo "Presiona Ctrl+C para detener"
}

# Función para cleanup al salir
cleanup() {
    echo
    log "Deteniendo monitoreo..."
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Loop principal
while true; do
    run_monitoring_cycle
    sleep $INTERVAL
done
