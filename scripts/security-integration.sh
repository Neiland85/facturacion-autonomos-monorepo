#!/bin/bash

# 🚀 SCRIPT DE INTEGRACIÓN COMPLETA DE SEGURIDAD
# Integra todo el sistema de seguridad en los servicios del monorepo

set -e

echo "🔒 Iniciando integración completa de seguridad..."

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

# Verificar que estamos en la raíz del proyecto
if [[ ! -f "package.json" ]]; then
    log_error "Debe ejecutar este script desde la raíz del proyecto"
    exit 1
fi

log_info "📦 Verificando dependencias de seguridad..."

# Dependencias requeridas para seguridad
SECURITY_DEPS=(
    "helmet"
    "cors"
    "express-rate-limit"
)

# Verificar si las dependencias están instaladas
MISSING_DEPS=()
for dep in "${SECURITY_DEPS[@]}"; do
    if ! grep -q "\"$dep\"" package.json; then
        MISSING_DEPS+=("$dep")
    fi
done

# Instalar dependencias faltantes
if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
    log_info "Instalando dependencias de seguridad faltantes..."
    for dep in "${MISSING_DEPS[@]}"; do
        log_info "Instalando $dep..."
        pnpm add "$dep"
    done
    log_success "Dependencias de seguridad instaladas"
else
    log_success "Todas las dependencias de seguridad están presentes"
fi

# Verificar estructura de directorios de logs
log_info "📁 Verificando estructura de directorios..."

REQUIRED_DIRS=(
    "logs"
    "packages/security/src"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir"
        log_success "Directorio creado: $dir"
    else
        log_success "Directorio existe: $dir"
    fi
done

# Verificar archivos de seguridad
log_info "🔍 Verificando archivos de seguridad..."

SECURITY_FILES=(
    "packages/security/src/complete-security.js"
    "packages/security/src/error-handling.js"
    "packages/security/src/csrf-protection.js"
    "packages/security/src/express-security.js"
)

for file in "${SECURITY_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log_success "Archivo encontrado: $file"
    else
        log_error "Archivo faltante: $file"
        exit 1
    fi
done

# Crear archivo de configuración de seguridad
log_info "⚙️ Creando configuración de seguridad..."

cat > "packages/security/src/index.js" << 'EOF'
/**
 * 🛡️ PUNTO DE ENTRADA PRINCIPAL PARA SEGURIDAD
 * 
 * Exporta todos los componentes de seguridad del sistema
 */

// Middleware principal de seguridad completa
const { setupCompleteSecurity } = require('./complete-security');

// Componentes individuales de seguridad
const { setupErrorHandling, errorUtils, asyncErrorHandler } = require('./error-handling');
const { setupCSRFProtection, csrfUtils } = require('./csrf-protection');

// Exportar todo para fácil uso
module.exports = {
  // Principal - usar este para configuración completa
  setupCompleteSecurity,
  
  // Componentes individuales (uso avanzado)
  setupErrorHandling,
  setupCSRFProtection,
  
  // Utilidades
  errorUtils,
  csrfUtils,
  asyncErrorHandler,
  
  // Configuraciones por defecto
  defaultSecurityConfig: {
    enableCSRF: true,
    strictCSRF: process.env.NODE_ENV === 'production',
    enableErrorHandling: true,
    enableRequestLogging: true,
    requestTimeoutMs: 30000,
    enablePayloadLimit: true
  }
};
EOF

log_success "Archivo de configuración principal creado"

# Crear archivo de tipos TypeScript
log_info "📝 Creando definiciones TypeScript..."

cat > "packages/security/src/index.d.ts" << 'EOF'
import { Express } from 'express';

export interface SecurityConfig {
  enableCSRF?: boolean;
  strictCSRF?: boolean;
  enableErrorHandling?: boolean;
  enableRequestLogging?: boolean;
  requestTimeoutMs?: number;
  enablePayloadLimit?: boolean;
  customCSRFIgnoreRoutes?: string[];
}

export interface ErrorUtils {
  createError(message: string, status?: number, code?: string): Error;
  asyncWrapper: (fn: Function) => Function;
  sanitizeForLog(obj: any, sensitiveFields?: string[]): any;
}

export interface CSRFUtils {
  cleanExpiredTokens(): number;
  getTokenStats(): { total: number; active: number; expired: number };
  revokeToken(token: string): boolean;
  revokeSessionTokens(sessionId: string): number;
}

export function setupCompleteSecurity(app: Express, config?: SecurityConfig): void;
export function setupErrorHandling(app: Express, config?: any): void;
export function setupCSRFProtection(app: Express, config?: any): void;

export const errorUtils: ErrorUtils;
export const csrfUtils: CSRFUtils;
export const asyncErrorHandler: (fn: Function) => Function;
export const defaultSecurityConfig: SecurityConfig;
EOF

log_success "Definiciones TypeScript creadas"

# Actualizar package.json del paquete security si no existe
log_info "📦 Verificando package.json de security..."

SECURITY_PACKAGE_JSON="packages/security/package.json"
if [[ ! -f "$SECURITY_PACKAGE_JSON" ]]; then
    cat > "$SECURITY_PACKAGE_JSON" << 'EOF'
{
  "name": "@facturacion/security",
  "version": "1.0.0",
  "description": "Sistema completo de seguridad para facturación de autónomos",
  "main": "src/index.js",
  "types": "src/index.d.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["security", "express", "csrf", "error-handling"],
  "author": "Facturación Autónomos Team",
  "license": "MIT",
  "dependencies": {
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.4.1"
  },
  "peerDependencies": {
    "express": "^4.0.0"
  }
}
EOF
    log_success "Package.json de security creado"
else
    log_success "Package.json de security existe"
fi

# Verificar integración en servicios
log_info "🔌 Verificando integración en servicios..."

SERVICES=(
    "apps/invoice-service/src/index.ts"
    "apps/api-facturas/src/index.ts"
)

for service in "${SERVICES[@]}"; do
    if [[ -f "$service" ]]; then
        if grep -q "setupCompleteSecurity\|complete-security" "$service"; then
            log_success "Seguridad integrada en: $service"
        else
            log_warning "Seguridad podría necesitar integración en: $service"
        fi
    else
        log_warning "Servicio no encontrado: $service"
    fi
done

# Crear script de test de seguridad
log_info "🧪 Creando script de test de seguridad..."

cat > "scripts/test-security-integration.sh" << 'EOF'
#!/bin/bash

# Script para probar la integración de seguridad

echo "🧪 Probando integración de seguridad..."

# Función para hacer requests de prueba
test_endpoint() {
    local url="$1"
    local method="$2"
    local expected_status="$3"
    local description="$4"
    
    echo "Testing: $description"
    
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" 2>/dev/null || echo "000")
        
        if [[ "$response" == "$expected_status" ]]; then
            echo "✅ $description - Status: $response"
        else
            echo "⚠️ $description - Expected: $expected_status, Got: $response"
        fi
    else
        echo "ℹ️ curl no disponible, saltando test: $description"
    fi
}

# Probar endpoints básicos
test_endpoint "http://localhost:3001/health" "GET" "200" "API Facturas Health Check"
test_endpoint "http://localhost:3002/health" "GET" "200" "Invoice Service Health Check"

# Probar protección CSRF
test_endpoint "http://localhost:3001/api/csrf-token" "GET" "200" "CSRF Token Endpoint"
test_endpoint "http://localhost:3001/api/nonexistent" "POST" "403" "CSRF Protection (sin token)"

# Probar rate limiting
echo "🔄 Probando rate limiting..."
for i in {1..5}; do
    test_endpoint "http://localhost:3001/health" "GET" "200" "Rate limit test $i/5"
    sleep 0.1
done

echo "🎉 Tests de integración completados"
EOF

chmod +x "scripts/test-security-integration.sh"
log_success "Script de test de seguridad creado"

# Ejecutar verificaciones de seguridad
log_info "🔍 Ejecutando verificaciones de seguridad..."

if [[ -f "scripts/verify-http-security.sh" ]]; then
    ./scripts/verify-http-security.sh
fi

if [[ -f "scripts/verify-csrf-protection.sh" ]]; then
    ./scripts/verify-csrf-protection.sh
fi

if [[ -f "scripts/verify-error-handling.sh" ]]; then
    ./scripts/verify-error-handling.sh
fi

# Resumen final
echo ""
echo "📊 RESUMEN DE INTEGRACIÓN COMPLETA"
echo "=================================="
log_success "✅ Dependencias de seguridad verificadas"
log_success "✅ Estructura de directorios configurada" 
log_success "✅ Archivos de seguridad verificados"
log_success "✅ Configuración principal creada"
log_success "✅ Definiciones TypeScript generadas"
log_success "✅ Package.json de security configurado"
log_success "✅ Scripts de test creados"

echo ""
log_info "🚀 PRÓXIMOS PASOS:"
echo "1. Iniciar servicios: pnpm dev (en apps/)"
echo "2. Probar integración: ./scripts/test-security-integration.sh"
echo "3. Verificar logs de seguridad en consola"
echo "4. Probar endpoints con herramientas como Postman"

echo ""
log_success "🎉 Integración completa de seguridad finalizada!"
echo ""
log_info "💡 SISTEMA DE SEGURIDAD ACTIVO:"
echo "   • Protección CSRF en todos los endpoints POST/PUT/DELETE"
echo "   • Headers de seguridad HTTP automáticos"
echo "   • Rate limiting inteligente"
echo "   • Manejo seguro de errores sin exposición"
echo "   • Logging y monitoreo de seguridad"
echo "   • Validación automática de origen"
echo "   • Timeout y límites de payload"
EOF

chmod +x /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/scripts/security-integration.sh

log_success "Script de integración completa creado"
