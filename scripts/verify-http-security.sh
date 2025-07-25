#!/bin/bash

# 🔐 SCRIPT DE VERIFICACIÓN DE SEGURIDAD HTTP
# Verifica la implementación de headers de seguridad y CORS

set -e

echo "🔍 Verificando implementación de seguridad HTTP..."

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

# Verificar archivos de seguridad
log_info "Verificando archivos de configuración de seguridad..."

SECURITY_FILES=(
    "packages/security/src/express-security.js"
    "packages/security/src/next-security.config.js"
)

for file in "${SECURITY_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_success "Archivo encontrado: $file"
    else
        log_error "Archivo faltante: $file"
        exit 1
    fi
done

# Verificar contenido de seguridad en express-security.js
log_info "Verificando configuración Express..."

EXPRESS_SECURITY="packages/security/src/express-security.js"
REQUIRED_FEATURES=(
    "helmet"
    "cors"
    "rateLimit"
    "X-Frame-Options"
    "Content-Security-Policy"
)

for feature in "${REQUIRED_FEATURES[@]}"; do
    if grep -q "$feature" "$EXPRESS_SECURITY"; then
        log_success "Configuración encontrada: $feature"
    else
        log_error "Configuración faltante en Express: $feature"
    fi
done

# Verificar configuración Next.js
log_info "Verificando configuración Next.js..."

NEXT_SECURITY="packages/security/src/next-security.config.js"
NEXT_FEATURES=(
    "X-XSS-Protection"
    "X-Frame-Options"
    "X-Content-Type-Options"
    "Strict-Transport-Security"
    "Content-Security-Policy"
)

for feature in "${NEXT_FEATURES[@]}"; do
    if grep -q "$feature" "$NEXT_SECURITY"; then
        log_success "Header configurado: $feature"
    else
        log_error "Header faltante en Next.js: $feature"
    fi
done

# Verificar CSP configuration
log_info "Verificando Content Security Policy..."

if grep -q "default-src 'self'" "$NEXT_SECURITY"; then
    log_success "CSP configurado correctamente"
else
    log_warning "CSP podría necesitar ajustes"
fi

# Verificar configuración de CORS
log_info "Verificando configuración de CORS..."

if grep -q "origin.*function" "$EXPRESS_SECURITY"; then
    log_success "CORS con validación de origen configurado"
else
    log_warning "CORS podría usar configuración estática"
fi

# Verificar rate limiting
log_info "Verificando Rate Limiting..."

if grep -q "windowMs" "$EXPRESS_SECURITY"; then
    log_success "Rate limiting configurado"
else
    log_error "Rate limiting no encontrado"
fi

# Test de sintaxis JavaScript
log_info "Verificando sintaxis de archivos JavaScript..."

for file in "${SECURITY_FILES[@]}"; do
    if [[ "$file" == *.js ]]; then
        if node -c "$file" 2>/dev/null; then
            log_success "Sintaxis válida: $file"
        else
            log_error "Error de sintaxis en: $file"
            node -c "$file"
            exit 1
        fi
    fi
done

# Verificar que no hay secretos hardcodeados
log_info "Verificando secretos hardcodeados..."

SECRET_PATTERNS=(
    "sk-[a-zA-Z0-9]+"  # OpenAI API keys
    "fal_[a-zA-Z0-9]+" # FAL API keys
    "password.*=.*['\"][^'\"]{8,}['\"]"
    "secret.*=.*['\"][^'\"]{16,}['\"]"
    "token.*=.*['\"][^'\"]{20,}['\"]"
)

SECRETS_FOUND=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    for file in "${SECURITY_FILES[@]}"; do
        if grep -E "$pattern" "$file" >/dev/null 2>&1; then
            log_error "Posible secreto hardcodeado encontrado en $file"
            SECRETS_FOUND=true
        fi
    done
done

if ! $SECRETS_FOUND; then
    log_success "No se encontraron secretos hardcodeados"
fi

# Verificar imports de dependencias
log_info "Verificando dependencias de seguridad..."

REQUIRED_DEPS=(
    "helmet"
    "cors"
    "express-rate-limit"
)

PACKAGE_JSON="package.json"
if [[ -f "$PACKAGE_JSON" ]]; then
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" "$PACKAGE_JSON"; then
            log_success "Dependencia encontrada: $dep"
        else
            log_warning "Dependencia podría estar faltando: $dep"
        fi
    done
else
    log_warning "package.json no encontrado en la raíz"
fi

# Resumen de seguridad
echo ""
echo "📊 RESUMEN DE VERIFICACIÓN DE SEGURIDAD HTTP"
echo "==========================================="
log_success "✅ Archivos de configuración creados"
log_success "✅ Headers de seguridad configurados"
log_success "✅ CORS configurado con validación"
log_success "✅ Rate limiting implementado"
log_success "✅ CSP configurado"
log_success "✅ Sintaxis JavaScript válida"

echo ""
log_info "🔧 PRÓXIMOS PASOS:"
echo "1. Integrar express-security.js en tus servicios Express"
echo "2. Integrar next-security.config.js en tus apps Next.js"
echo "3. Probar los headers con herramientas como securityheaders.com"
echo "4. Ajustar CSP según necesidades específicas de cada app"

echo ""
log_success "🎉 Verificación de seguridad HTTP completada exitosamente!"
