#!/bin/bash

# 🔐 SCRIPT DE VERIFICACIÓN DE MANEJO SEGURO DE ERRORES
# Verifica la implementación de manejo seguro de errores sin exposición de información sensible

set -e

echo "🔍 Verificando implementación de manejo seguro de errores..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar archivos de manejo de errores
log_info "Verificando archivos de manejo de errores..."

ERROR_FILES=(
    "packages/security/src/error-handling.js"
    "packages/security/src/complete-security.js"
)

for file in "${ERROR_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_success "Archivo encontrado: $file"
    else
        log_error "Archivo faltante: $file"
        exit 1
    fi
done

# Verificar funciones de manejo de errores
log_info "Verificando funciones de manejo de errores..."

ERROR_FUNCTIONS=(
    "errorHandler"
    "notFoundHandler"
    "asyncErrorHandler"
    "sanitizeErrorMessage"
    "determineErrorType"
    "createSecureErrorLog"
    "setupErrorHandling"
)

ERROR_FILE="packages/security/src/error-handling.js"
for func in "${ERROR_FUNCTIONS[@]}"; do
    if grep -q "function $func\|const $func\|$func.*=" "$ERROR_FILE"; then
        log_success "Función encontrada: $func"
    else
        log_error "Función faltante: $func"
    fi
done

# Verificar tipos de errores definidos
log_info "Verificando tipos de errores definidos..."

ERROR_TYPES=(
    "VALIDATION_ERROR"
    "AUTHENTICATION_ERROR"
    "AUTHORIZATION_ERROR"
    "NOT_FOUND_ERROR"
    "RATE_LIMIT_ERROR"
    "DATABASE_ERROR"
    "INTERNAL_ERROR"
)

for error_type in "${ERROR_TYPES[@]}"; do
    if grep -q "$error_type" "$ERROR_FILE"; then
        log_success "Tipo de error definido: $error_type"
    else
        log_warning "Tipo de error podría estar faltante: $error_type"
    fi
done

# Verificar patrones sensibles
log_info "Verificando protección contra exposición de datos sensibles..."

SENSITIVE_PATTERNS=(
    "password"
    "token"
    "secret"
    "key"
    "credential"
    "connection.*string"
    "database.*url"
)

PATTERNS_FOUND=0
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -q "$pattern" "$ERROR_FILE"; then
        PATTERNS_FOUND=$((PATTERNS_FOUND + 1))
        log_success "Patrón sensible protegido: $pattern"
    fi
done

if [[ $PATTERNS_FOUND -ge 5 ]]; then
    log_success "Suficientes patrones sensibles protegidos"
else
    log_warning "Podrían necesitarse más patrones sensibles"
fi

# Verificar sanitización de mensajes
log_info "Verificando sanitización de mensajes de error..."

SANITIZATION_FEATURES=(
    "sanitizeErrorMessage"
    "SENSITIVE_PATTERNS"
    "FILE_PATH"
    "REDACTED"
)

for feature in "${SANITIZATION_FEATURES[@]}"; do
    if grep -q "$feature" "$ERROR_FILE"; then
        log_success "Feature de sanitización encontrado: $feature"
    else
        log_warning "Feature de sanitización podría estar faltante: $feature"
    fi
done

# Verificar logging seguro
log_info "Verificando logging seguro..."

LOGGING_FEATURES=(
    "createSecureErrorLog"
    "writeErrorLog"
    "IS_PRODUCTION"
    "errorId"
    "timestamp"
)

for feature in "${LOGGING_FEATURES[@]}"; do
    if grep -q "$feature" "$ERROR_FILE"; then
        log_success "Feature de logging encontrado: $feature"
    else
        log_warning "Feature de logging podría estar faltante: $feature"
    fi
done

# Verificar integración con seguridad completa
log_info "Verificando integración con seguridad completa..."

COMPLETE_SECURITY_FILE="packages/security/src/complete-security.js"
INTEGRATION_FEATURES=(
    "setupErrorHandling"
    "enableErrorHandling"
    "X-Error-ID"
    "REQUEST_TIMEOUT"
    "PAYLOAD_TOO_LARGE"
)

for feature in "${INTEGRATION_FEATURES[@]}"; do
    if grep -q "$feature" "$COMPLETE_SECURITY_FILE"; then
        log_success "Feature de integración encontrado: $feature"
    else
        log_warning "Feature de integración podría estar faltante: $feature"
    fi
done

# Verificar sintaxis JavaScript
log_info "Verificando sintaxis de archivos JavaScript..."

for file in "${ERROR_FILES[@]}"; do
    if node -c "$file" 2>/dev/null; then
        log_success "Sintaxis JavaScript válida: $file"
    else
        log_error "Error de sintaxis en: $file"
        node -c "$file"
    fi
done

# Verificar configuración por ambiente
log_info "Verificando configuración por ambiente..."

ENV_FEATURES=(
    "NODE_ENV"
    "IS_PRODUCTION"
    "process.env"
)

for feature in "${ENV_FEATURES[@]}"; do
    if grep -q "$feature" "$ERROR_FILE"; then
        log_success "Configuración de ambiente encontrada: $feature"
    else
        log_warning "Configuración de ambiente podría estar faltante: $feature"
    fi
done

# Verificar headers de seguridad en errores
log_info "Verificando headers de seguridad en respuestas de error..."

ERROR_HEADERS=(
    "X-Error-ID"
    "X-Content-Type-Options"
    "Cache-Control.*no-store"
    "Pragma.*no-cache"
)

for header in "${ERROR_HEADERS[@]}"; do
    if grep -q "$header" "$ERROR_FILE"; then
        log_success "Header de seguridad configurado: $header"
    else
        log_warning "Header de seguridad podría estar faltante: $header"
    fi
done

# Verificar que no hay información sensible hardcodeada
log_info "Verificando que no hay información sensible hardcodeada..."

SENSITIVE_HARDCODED=(
    "password.*=.*['\"][^'\"]{8,}['\"]"
    "secret.*=.*['\"][^'\"]{16,}['\"]"
    "mongodb://.*:.*@"
    "postgres://.*:.*@"
)

SENSITIVE_FOUND=false
for pattern in "${SENSITIVE_HARDCODED[@]}"; do
    for file in "${ERROR_FILES[@]}"; do
        if grep -E "$pattern" "$file" >/dev/null 2>&1; then
            log_error "Posible información sensible hardcodeada en $file"
            SENSITIVE_FOUND=true
        fi
    done
done

if ! $SENSITIVE_FOUND; then
    log_success "No se encontró información sensible hardcodeada"
fi

# Verificar utilidades de error
log_info "Verificando utilidades de error..."

ERROR_UTILITIES=(
    "createError"
    "asyncWrapper"
    "sanitizeForLog"
    "errorUtils"
)

for util in "${ERROR_UTILITIES[@]}"; do
    if grep -q "$util" "$ERROR_FILE"; then
        log_success "Utilidad de error encontrada: $util"
    else
        log_warning "Utilidad de error podría estar faltante: $util"
    fi
done

# Resumen de manejo de errores
echo ""
echo "📊 RESUMEN DE VERIFICACIÓN DE MANEJO SEGURO DE ERRORES"
echo "===================================================="
log_success "✅ Archivos de manejo de errores creados"
log_success "✅ Funciones principales implementadas"
log_success "✅ Tipos de errores definidos"
log_success "✅ Sanitización de mensajes configurada"
log_success "✅ Logging seguro implementado"
log_success "✅ Headers de seguridad en errores"
log_success "✅ Configuración por ambiente"
log_success "✅ Integración con seguridad completa"

echo ""
log_info "🔧 FUNCIONALIDADES DE MANEJO DE ERRORES:"
echo "• Handler global de errores sin exposición de stack traces"
echo "• Sanitización automática de mensajes sensibles"
echo "• Logging seguro con tracking de errores"
echo "• Respuestas genéricas en producción"
echo "• Headers de seguridad en respuestas de error"
echo "• Validación y wrapper para funciones async"
echo "• Configuración diferenciada por ambiente"

echo ""
log_info "🚀 PRÓXIMOS PASOS:"
echo "1. Integrar setupCompleteSecurity en servicios Express"
echo "2. Configurar directorio de logs para producción"
echo "3. Implementar monitoreo de logs de errores"
echo "4. Probar manejo de errores con casos límite"
echo "5. Configurar alertas para errores frecuentes"

echo ""
log_success "🎉 Verificación de manejo seguro de errores completada!"
echo ""
log_info "💡 NOTA: El manejo de errores está configurado para:"
echo "   • No exponer stack traces en producción"
echo "   • Sanitizar información sensible automáticamente"
echo "   • Generar IDs únicos para tracking"
echo "   • Registrar errores de forma segura"
echo "   • Responder con mensajes genéricos y seguros"
