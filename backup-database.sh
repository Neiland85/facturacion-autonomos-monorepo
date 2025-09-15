#!/bin/bash

# Database Backup Script for TributariApp
set -e

echo "💾 Iniciando backup de base de datos - TributariApp..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tributariapp_backup_${TIMESTAMP}"
RETENTION_DAYS=7

# Database configuration (from environment or defaults)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"tributariapp"}
DB_USER=${DB_USER:-"tributariapp"}
DB_PASSWORD=${DB_PASSWORD:-"password123"}

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

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creando directorio de backups: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Function to backup PostgreSQL database
backup_postgres() {
    print_status "Iniciando backup de PostgreSQL..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.sql"

    # Create backup using pg_dump
    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$backup_file" \
        --exclude-schema=pg_catalog \
        --exclude-schema=information_schema; then

        print_success "Backup de PostgreSQL completado: $backup_file"

        # Compress the backup
        gzip "$backup_file"
        print_success "Backup comprimido: ${backup_file}.gz"

        return 0
    else
        print_error "Error al crear backup de PostgreSQL"
        return 1
    fi
}

# Function to backup Redis data
backup_redis() {
    print_status "Iniciando backup de Redis..."

    local redis_backup_file="$BACKUP_DIR/redis_${BACKUP_NAME}.rdb"

    # Check if Redis is running and get RDB file location
    if command -v redis-cli &> /dev/null; then
        local redis_dir=$(redis-cli config get dir | tail -1)
        local redis_dbfilename=$(redis-cli config get dbfilename | tail -1)

        if [ -n "$redis_dir" ] && [ -n "$redis_dbfilename" ]; then
            local redis_file="$redis_dir/$redis_dbfilename"

            if [ -f "$redis_file" ]; then
                cp "$redis_file" "$redis_backup_file"
                print_success "Backup de Redis completado: $redis_backup_file"
                return 0
            else
                print_warning "Archivo RDB de Redis no encontrado: $redis_file"
                return 1
            fi
        else
            print_warning "No se pudo obtener configuración de Redis"
            return 1
        fi
    else
        print_warning "redis-cli no está disponible"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    print_status "Limpiando backups antiguos (retención: ${RETENTION_DAYS} días)..."

    local deleted_count=0

    # Find and delete old PostgreSQL backups
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            rm -f "$file"
            ((deleted_count++))
            print_status "Eliminado: $file"
        fi
    done < <(find "$BACKUP_DIR" -name "tributariapp_backup_*.sql.gz" -mtime +$RETENTION_DAYS)

    # Find and delete old Redis backups
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            rm -f "$file"
            ((deleted_count++))
            print_status "Eliminado: $file"
        fi
    done < <(find "$BACKUP_DIR" -name "redis_tributariapp_backup_*.rdb" -mtime +$RETENTION_DAYS)

    if [ $deleted_count -gt 0 ]; then
        print_success "Se eliminaron $deleted_count archivos antiguos"
    else
        print_status "No hay archivos antiguos para eliminar"
    fi
}

# Function to show backup info
show_backup_info() {
    print_status "Información del backup:"

    echo "📁 Directorio: $BACKUP_DIR"
    echo "📄 Nombre: $BACKUP_NAME"
    echo "📅 Timestamp: $TIMESTAMP"
    echo "⏰ Retención: $RETENTION_DAYS días"

    # Show disk usage
    if command -v du &> /dev/null; then
        local size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
        echo "💾 Tamaño total de backups: $size"
    fi

    # List recent backups
    echo ""
    echo "📋 Backups recientes:"
    ls -la "$BACKUP_DIR" | head -10
}

# Main execution
main() {
    print_status "=== Iniciando proceso de backup ==="

    # Backup PostgreSQL
    if backup_postgres; then
        postgres_success=true
    else
        postgres_success=false
    fi

    # Backup Redis
    if backup_redis; then
        redis_success=true
    else
        redis_success=false
    fi

    # Cleanup old backups
    cleanup_old_backups

    # Show backup information
    echo ""
    show_backup_info

    # Final status
    echo ""
    if [ "$postgres_success" = true ]; then
        print_success "✅ Backup de PostgreSQL: COMPLETADO"
    else
        print_error "❌ Backup de PostgreSQL: FALLÓ"
    fi

    if [ "$redis_success" = true ]; then
        print_success "✅ Backup de Redis: COMPLETADO"
    else
        print_warning "⚠️  Backup de Redis: FALLÓ (no crítico)"
    fi

    if [ "$postgres_success" = true ]; then
        print_success "🎉 Proceso de backup completado exitosamente"
        return 0
    else
        print_error "💥 Proceso de backup falló"
        return 1
    fi
}

# Execute main function
main "$@"
