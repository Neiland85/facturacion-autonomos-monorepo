#!/bin/bash

# Script de despliegue para Kubernetes
# Versión: 1.0
# Uso: ./deploy.sh [staging|production]

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="${SCRIPT_DIR}/k8s"
ENVIRONMENT="${1:-staging}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
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

# Validar argumentos
validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        log_error "Environment must be 'staging' or 'production'"
        exit 1
    fi
}

# Verificar requisitos
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Verificar acceso al cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Verificar variables de entorno
    required_vars=(
        "KUBE_NAMESPACE"
        "KUBE_DOMAIN"
        "CI_COMMIT_SHA"
        "API_FACTURAS_IMAGE"
        "API_TAX_CALCULATOR_IMAGE"
        "WEB_IMAGE"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Prerequisites check passed"
}

# Configurar variables de entorno según el ambiente
setup_environment() {
    log_info "Setting up environment variables for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        staging)
            export KUBE_NAMESPACE="${KUBE_NAMESPACE_STAGING:-facturacion-staging}"
            export REPLICAS=1
            ;;
        production)
            export KUBE_NAMESPACE="${KUBE_NAMESPACE_PRODUCTION:-facturacion-production}"
            export REPLICAS=3
            ;;
    esac
    
    export ENVIRONMENT
    
    log_success "Environment setup complete"
}

# Crear namespace si no existe
create_namespace() {
    log_info "Creating namespace $KUBE_NAMESPACE if it doesn't exist..."
    
    kubectl create namespace "$KUBE_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Namespace $KUBE_NAMESPACE is ready"
}

# Aplicar secretos
apply_secrets() {
    log_info "Applying secrets..."
    
    # Verificar que los secretos base64 estén definidos
    if [[ -z "${POSTGRES_PASSWORD_B64:-}" ]]; then
        log_error "POSTGRES_PASSWORD_B64 is not set"
        exit 1
    fi
    
    envsubst < "$K8S_DIR/secret.yaml" | kubectl apply -f -
    
    log_success "Secrets applied"
}

# Aplicar ConfigMaps
apply_configmaps() {
    log_info "Applying ConfigMaps..."
    
    envsubst < "$K8S_DIR/configmap.yaml" | kubectl apply -f -
    
    log_success "ConfigMaps applied"
}

# Aplicar servicios de base de datos
apply_database_services() {
    log_info "Applying database services..."
    
    # PostgreSQL
    envsubst < "$K8S_DIR/postgres.yaml" | kubectl apply -f -
    
    # Redis
    envsubst < "$K8S_DIR/redis.yaml" | kubectl apply -f -
    
    # Esperar a que las bases de datos estén listas
    log_info "Waiting for databases to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n "$KUBE_NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n "$KUBE_NAMESPACE" --timeout=300s
    
    log_success "Database services applied and ready"
}

# Aplicar servicios de aplicación
apply_application_services() {
    log_info "Applying application services..."
    
    # API Facturas
    envsubst < "$K8S_DIR/api-facturas.yaml" | kubectl apply -f -
    
    # API Tax Calculator
    envsubst < "$K8S_DIR/api-tax-calculator.yaml" | kubectl apply -f -
    
    # Web
    envsubst < "$K8S_DIR/web.yaml" | kubectl apply -f -
    
    log_success "Application services applied"
}

# Aplicar Ingress
apply_ingress() {
    log_info "Applying Ingress..."
    
    envsubst < "$K8S_DIR/ingress.yaml" | kubectl apply -f -
    
    log_success "Ingress applied"
}

# Aplicar monitoreo (opcional)
apply_monitoring() {
    if [[ "${ENABLE_MONITORING:-false}" == "true" ]]; then
        log_info "Applying monitoring services..."
        
        envsubst < "$K8S_DIR/monitoring.yaml" | kubectl apply -f -
        envsubst < "$K8S_DIR/grafana.yaml" | kubectl apply -f -
        
        log_success "Monitoring services applied"
    else
        log_info "Monitoring disabled, skipping..."
    fi
}

# Verificar deployments
verify_deployments() {
    log_info "Verifying deployments..."
    
    # Lista de deployments a verificar
    deployments=(
        "postgres"
        "redis"
        "api-facturas"
        "api-tax-calculator"
        "web"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Checking deployment: $deployment"
        kubectl rollout status deployment/"$deployment" -n "$KUBE_NAMESPACE" --timeout=600s
    done
    
    log_success "All deployments are ready"
}

# Mostrar información del despliegue
show_deployment_info() {
    log_info "Deployment information:"
    
    echo "Namespace: $KUBE_NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo "Commit SHA: $CI_COMMIT_SHA"
    echo
    
    log_info "Services:"
    kubectl get services -n "$KUBE_NAMESPACE"
    
    echo
    log_info "Pods:"
    kubectl get pods -n "$KUBE_NAMESPACE"
    
    echo
    log_info "Ingress:"
    kubectl get ingress -n "$KUBE_NAMESPACE"
}

# Función principal
main() {
    log_info "Starting deployment to $ENVIRONMENT..."
    
    validate_environment
    check_prerequisites
    setup_environment
    
    create_namespace
    apply_secrets
    apply_configmaps
    apply_database_services
    apply_application_services
    apply_ingress
    apply_monitoring
    
    verify_deployments
    show_deployment_info
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
}

# Ejecutar función principal
main "$@"
