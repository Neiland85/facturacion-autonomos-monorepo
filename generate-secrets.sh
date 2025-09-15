#!/bin/bash

# Script para generar secrets base64 para Kubernetes
# Uso: ./generate-secrets.sh

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Función para codificar en base64
encode_secret() {
    local value="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo -n "$value" | base64
    else
        # Linux
        echo -n "$value" | base64 -w 0
    fi
}

# Generar secrets aleatorios si no están definidos
generate_random_secret() {
    openssl rand -base64 32
}

log_info "Generando secrets para Kubernetes..."

# Database
if [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
    POSTGRES_PASSWORD=$(generate_random_secret)
    log_warning "POSTGRES_PASSWORD no definido, generando aleatorio"
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
    DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres-service:5432/facturacion_${ENVIRONMENT:-dev}"
    log_warning "DATABASE_URL no definido, generando con POSTGRES_PASSWORD"
fi

# JWT Secrets
if [[ -z "${JWT_SECRET:-}" ]]; then
    JWT_SECRET=$(generate_random_secret)
    log_warning "JWT_SECRET no definido, generando aleatorio"
fi

if [[ -z "${JWT_REFRESH_SECRET:-}" ]]; then
    JWT_REFRESH_SECRET=$(generate_random_secret)
    log_warning "JWT_REFRESH_SECRET no definido, generando aleatorio"
fi

# Session Secret
if [[ -z "${SESSION_SECRET:-}" ]]; then
    SESSION_SECRET=$(generate_random_secret)
    log_warning "SESSION_SECRET no definido, generando aleatorio"
fi

# Encryption Key
if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
    ENCRYPTION_KEY=$(generate_random_secret)
    log_warning "ENCRYPTION_KEY no definido, generando aleatorio"
fi

# Webhook Secret
if [[ -z "${WEBHOOK_SECRET:-}" ]]; then
    WEBHOOK_SECRET=$(generate_random_secret)
    log_warning "WEBHOOK_SECRET no definido, generando aleatorio"
fi

# Generar archivo .env con los secrets en base64
cat > .env.secrets << EOF
# Secrets generados para Kubernetes
# Generado el: $(date)

# Database
POSTGRES_PASSWORD_B64=$(encode_secret "$POSTGRES_PASSWORD")
DATABASE_URL_B64=$(encode_secret "$DATABASE_URL")

# JWT
JWT_SECRET_B64=$(encode_secret "$JWT_SECRET")
JWT_REFRESH_SECRET_B64=$(encode_secret "$JWT_REFRESH_SECRET")

# Session
SESSION_SECRET_B64=$(encode_secret "$SESSION_SECRET")

# Encryption
ENCRYPTION_KEY_B64=$(encode_secret "$ENCRYPTION_KEY")

# Webhook
WEBHOOK_SECRET_B64=$(encode_secret "$WEBHOOK_SECRET")

# SMTP (si están definidos)
EOF

# Agregar SMTP si están definidos
if [[ -n "${SMTP_HOST:-}" ]]; then
    echo "SMTP_HOST_B64=$(encode_secret "$SMTP_HOST")" >> .env.secrets
fi

if [[ -n "${SMTP_PORT:-}" ]]; then
    echo "SMTP_PORT_B64=$(encode_secret "$SMTP_PORT")" >> .env.secrets
fi

if [[ -n "${SMTP_USER:-}" ]]; then
    echo "SMTP_USER_B64=$(encode_secret "$SMTP_USER")" >> .env.secrets
fi

if [[ -n "${SMTP_PASSWORD:-}" ]]; then
    echo "SMTP_PASSWORD_B64=$(encode_secret "$SMTP_PASSWORD")" >> .env.secrets
fi

# Agregar otros secrets opcionales
if [[ -n "${REDIS_PASSWORD:-}" ]]; then
    echo "REDIS_PASSWORD_B64=$(encode_secret "$REDIS_PASSWORD")" >> .env.secrets
fi

if [[ -n "${SENTRY_DSN:-}" ]]; then
    echo "SENTRY_DSN_B64=$(encode_secret "$SENTRY_DSN")" >> .env.secrets
fi

if [[ -n "${EXTERNAL_API_KEY:-}" ]]; then
    echo "EXTERNAL_API_KEY_B64=$(encode_secret "$EXTERNAL_API_KEY")" >> .env.secrets
fi

log_success "Secrets generados y guardados en .env.secrets"
log_info "Recuerda agregar .env.secrets a .gitignore para no commitear secrets"

# Mostrar instrucciones
echo ""
log_info "Para usar estos secrets en Kubernetes:"
echo "1. Carga las variables: source .env.secrets"
echo "2. Despliega: ./deploy.sh staging"
echo ""
log_warning "IMPORTANTE: Nunca commiteas el archivo .env.secrets"