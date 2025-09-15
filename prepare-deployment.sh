#!/bin/bash

# Script simplificado para validar y preparar despliegue Kubernetes
# Uso: ./prepare-deployment.sh [staging|production]

set -euo pipefail

ENVIRONMENT="${1:-staging}"

# Colores
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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Cargar variables de entorno
load_env_vars() {
    if [[ -f ".env" ]]; then
        log_info "Cargando variables de entorno desde .env"
        set -a
        source .env
        set +a
    else
        log_error "Archivo .env no encontrado"
        exit 1
    fi

    if [[ -f ".env.secrets" ]]; then
        log_info "Cargando secrets desde .env.secrets"
        set -a
        source .env.secrets
        set +a
    else
        log_warning "Archivo .env.secrets no encontrado, generando secrets..."
        ./generate-secrets.sh
        source .env.secrets
    fi
}

# Validar variables requeridas
validate_vars() {
    log_info "Validando variables requeridas..."

    required_vars=(
        "KUBE_NAMESPACE_STAGING"
        "KUBE_NAMESPACE_PRODUCTION"
        "KUBE_DOMAIN"
        "API_FACTURAS_IMAGE"
        "API_TAX_CALCULATOR_IMAGE"
        "WEB_IMAGE"
        "CI_COMMIT_SHA"
        "POSTGRES_PASSWORD_B64"
        "JWT_SECRET_B64"
        "DATABASE_URL_B64"
    )

    missing_vars=()

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Variables requeridas faltantes:"
        printf '  - %s\n' "${missing_vars[@]}"
        log_error "Por favor configura estas variables en .env"
        exit 1
    fi

    log_success "Todas las variables requeridas están configuradas"
}

# Configurar namespace según ambiente
setup_namespace() {
    case $ENVIRONMENT in
        staging)
            export KUBE_NAMESPACE="${KUBE_NAMESPACE_STAGING}"
            ;;
        production)
            export KUBE_NAMESPACE="${KUBE_NAMESPACE_PRODUCTION}"
            ;;
        *)
            log_error "Ambiente debe ser 'staging' o 'production'"
            exit 1
            ;;
    esac

    export ENVIRONMENT
    log_info "Namespace configurado: $KUBE_NAMESPACE"
}

# Función principal
main() {
    log_info "Preparando despliegue para ambiente: $ENVIRONMENT"

    load_env_vars
    validate_vars
    setup_namespace

    log_success "Preparación completada!"
    log_info "Puedes ejecutar ahora:"
    echo "  kubectl apply -f k8s/"
    echo ""
    log_info "O usar el script completo:"
    echo "  ./deploy.sh $ENVIRONMENT"
}

main "$@"