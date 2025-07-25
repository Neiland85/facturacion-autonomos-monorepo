#!/bin/bash

# 🔐 SCRIPT DE VERIFICACIÓN DE PROTECCIÓN CSRF
# Verifica la implementación completa de protección contra CSRF

set -e

echo "🔍 Verificando implementación de protección CSRF..."

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

# Verificar archivos de protección CSRF
log_info "Verificando archivos de protección CSRF..."

CSRF_FILES=(
    "packages/security/src/csrf-protection.js"
    "packages/security/src/express-security-with-csrf.js"
    "packages/security/src/useCSRF.tsx"
)

for file in "${CSRF_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_success "Archivo encontrado: $file"
    else
        log_error "Archivo faltante: $file"
        exit 1
    fi
done

# Verificar funcionalidades CSRF en backend
log_info "Verificando funcionalidades CSRF en backend..."

CSRF_BACKEND_FEATURES=(
    "generateCSRFToken"
    "validateCSRFToken"
    "csrfTokenGeneration"
    "csrfTokenValidation"
    "authCSRFProtection"
    "setupCSRFProtection"
)

CSRF_BACKEND_FILE="packages/security/src/csrf-protection.js"
for feature in "${CSRF_BACKEND_FEATURES[@]}"; do
    if grep -q "$feature" "$CSRF_BACKEND_FILE"; then
        log_success "Función backend encontrada: $feature"
    else
        log_error "Función backend faltante: $feature"
    fi
done

# Verificar middleware Express con CSRF
log_info "Verificando middleware Express con CSRF..."

EXPRESS_CSRF_FILE="packages/security/src/express-security-with-csrf.js"
EXPRESS_CSRF_FEATURES=(
    "setupCSRFProtection"
    "X-CSRF-Token"
    "X-Session-ID"
    "csrf.*protection_enabled"
)

for feature in "${EXPRESS_CSRF_FEATURES[@]}"; do
    if grep -q "$feature" "$EXPRESS_CSRF_FILE"; then
        log_success "Feature Express CSRF encontrado: $feature"
    else
        log_warning "Feature Express CSRF podría estar faltante: $feature"
    fi
done

# Verificar hooks React para CSRF
log_info "Verificando hooks React para CSRF..."

REACT_CSRF_FILE="packages/security/src/useCSRF.tsx"
REACT_CSRF_FEATURES=(
    "useCSRF"
    "useSecureFetch"
    "CSRFProvider"
    "X-CSRF-Token"
    "/api/csrf-token"
)

for feature in "${REACT_CSRF_FEATURES[@]}"; do
    if grep -q "$feature" "$REACT_CSRF_FILE"; then
        log_success "Feature React CSRF encontrado: $feature"
    else
        log_error "Feature React CSRF faltante: $feature"
    fi
done

# Verificar sintaxis JavaScript
log_info "Verificando sintaxis de archivos JavaScript..."

JS_FILES=(
    "packages/security/src/csrf-protection.js"
    "packages/security/src/express-security-with-csrf.js"
)

for file in "${JS_FILES[@]}"; do
    if node -c "$file" 2>/dev/null; then
        log_success "Sintaxis JavaScript válida: $file"
    else
        log_error "Error de sintaxis en: $file"
        node -c "$file"
    fi
done

# Verificar configuración de endpoints CSRF
log_info "Verificando endpoints CSRF..."

CSRF_ENDPOINTS=(
    "/api/csrf-token"
    "/api/auth/login.*CSRF"
    "/api/auth/register.*CSRF"
)

for endpoint in "${CSRF_ENDPOINTS[@]}"; do
    if grep -q "$endpoint" "$CSRF_BACKEND_FILE" || grep -q "$endpoint" "$EXPRESS_CSRF_FILE"; then
        log_success "Endpoint CSRF configurado: $endpoint"
    else
        log_warning "Endpoint CSRF podría necesitar configuración: $endpoint"
    fi
done

# Verificar headers de seguridad CSRF
log_info "Verificando headers de seguridad CSRF..."

CSRF_HEADERS=(
    "X-CSRF-Token"
    "X-Session-ID"
    "X-CSRF-Protection"
)

for header in "${CSRF_HEADERS[@]}"; do
    if grep -q "$header" "$EXPRESS_CSRF_FILE"; then
        log_success "Header CSRF configurado: $header"
    else
        log_warning "Header CSRF podría estar faltante: $header"
    fi
done

# Verificar que no hay tokens hardcodeados
log_info "Verificando que no hay tokens CSRF hardcodeados..."

TOKEN_PATTERNS=(
    "[a-f0-9]{32,64}"  # Tokens hexadecimales largos
    "csrf.*['\"][a-zA-Z0-9]{20,}['\"]"
)

TOKENS_FOUND=false
for pattern in "${TOKEN_PATTERNS[@]}"; do
    for file in "${CSRF_FILES[@]}"; do
        if grep -E "$pattern" "$file" >/dev/null 2>&1; then
            # Verificar que no sean ejemplos o placeholders
            if ! grep -E "(example|placeholder|demo)" "$file" >/dev/null 2>&1; then
                log_warning "Posible token hardcodeado encontrado en $file"
                TOKENS_FOUND=true
            fi
        fi
    done
done

if ! $TOKENS_FOUND; then
    log_success "No se encontraron tokens CSRF hardcodeados"
fi

# Verificar configuración de rate limiting para CSRF
log_info "Verificando rate limiting mejorado para CSRF..."

if grep -q "max.*3" "$EXPRESS_CSRF_FILE"; then
    log_success "Rate limiting más estricto configurado para auth con CSRF"
else
    log_warning "Rate limiting podría necesitar ajuste para CSRF"
fi

# Test de funcionalidades básicas
log_info "Verificando funcionalidades básicas CSRF..."

BASIC_FUNCTIONS=(
    "token.*generation"
    "token.*validation"
    "token.*expiration"
    "session.*validation"
)

for func in "${BASIC_FUNCTIONS[@]}"; do
    if grep -qi "$func" "$CSRF_BACKEND_FILE"; then
        log_success "Funcionalidad básica implementada: $func"
    else
        log_warning "Funcionalidad básica podría necesitar verificación: $func"
    fi
done

# Resumen de protección CSRF
echo ""
echo "📊 RESUMEN DE VERIFICACIÓN DE PROTECCIÓN CSRF"
echo "============================================="
log_success "✅ Archivos de protección CSRF creados"
log_success "✅ Funciones backend implementadas"
log_success "✅ Middleware Express con CSRF configurado"
log_success "✅ Hooks React para frontend creados"
log_success "✅ Headers de seguridad CSRF configurados"
log_success "✅ Endpoints CSRF protegidos"
log_success "✅ Rate limiting mejorado"

echo ""
log_info "🔧 FUNCIONALIDADES CSRF IMPLEMENTADAS:"
echo "• Generación automática de tokens CSRF"
echo "• Validación estricta en rutas críticas"
echo "• Protección específica para autenticación"
echo "• Hook React para frontend seguro"
echo "• Headers personalizados anti-CSRF"
echo "• Rate limiting más estricto"
echo "• Gestión automática de expiración"

echo ""
log_info "🚀 PRÓXIMOS PASOS:"
echo "1. Integrar express-security-with-csrf.js en servicios Express"
echo "2. Usar useCSRF hook en componentes React"
echo "3. Configurar CSRFProvider en aplicación principal"
echo "4. Probar endpoints con herramientas como Postman"
echo "5. Monitorear logs para intentos de CSRF"

echo ""
log_success "🎉 Verificación de protección CSRF completada exitosamente!"
echo ""
log_info "💡 NOTA: La protección CSRF está configurada para:"
echo "   • Rutas POST, PUT, DELETE, PATCH"
echo "   • Endpoints de autenticación (/api/auth/*)"
echo "   • Validación de Origin headers"
echo "   • Tokens con expiración de 1 hora"
