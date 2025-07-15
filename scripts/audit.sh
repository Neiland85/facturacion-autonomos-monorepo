#!/bin/bash

# Script de Auditoría Automática - Monorepo Facturación Autónomos
# Fecha: $(date)
# Uso: ./scripts/audit.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Header
echo "=================================="
echo "  AUDITORÍA AUTOMÁTICA DEL PROYECTO"
echo "  Facturación Autónomos Monorepo"
echo "  $(date)"
echo "=================================="
echo

# 1. Verificación del entorno
log "🔍 Verificando entorno de desarrollo..."
echo "Node.js version: $(node --version)"
echo "Yarn version: $(yarn --version)"
echo "Git branch: $(git branch --show-current)"
echo "Git status: $(git status --porcelain | wc -l) archivos modificados"
echo

# 2. Estructura del proyecto
log "📁 Verificando estructura del proyecto..."
if [ -d "backend" ] && [ -d "frontend" ] && [ -d "packages" ]; then
    success "Estructura del monorepo: ✅ CORRECTA"
else
    error "Estructura del monorepo: ❌ INCOMPLETA"
fi

# 3. Workspaces
log "📦 Verificando workspaces..."
yarn workspaces list > /tmp/workspaces.txt
if grep -q "backend" /tmp/workspaces.txt && grep -q "frontend" /tmp/workspaces.txt; then
    success "Workspaces configurados: ✅ CORRECTAMENTE"
else
    error "Workspaces: ❌ CONFIGURACIÓN INCORRECTA"
fi

# 4. Dependencias
log "🔗 Verificando dependencias..."
yarn install --check-files > /dev/null 2>&1
if [ $? -eq 0 ]; then
    success "Dependencias: ✅ SINCRONIZADAS"
else
    warning "Dependencias: ⚠️ REQUIEREN SINCRONIZACIÓN"
fi

# 5. Linting
log "🧹 Ejecutando linting..."
LINT_ERRORS=0

# Backend linting
cd backend
if yarn lint > /tmp/backend_lint.log 2>&1; then
    success "Backend linting: ✅ SIN ERRORES"
else
    warning "Backend linting: ⚠️ ERRORES ENCONTRADOS"
    LINT_ERRORS=$((LINT_ERRORS + 1))
fi
cd ..

# Frontend linting
cd frontend
if yarn lint > /tmp/frontend_lint.log 2>&1; then
    success "Frontend linting: ✅ SIN ERRORES"
else
    warning "Frontend linting: ⚠️ ERRORES ENCONTRADOS"
    LINT_ERRORS=$((LINT_ERRORS + 1))
fi
cd ..

# 6. Tests
log "🧪 Ejecutando tests..."
TEST_FAILURES=0

# Backend tests
cd backend
if yarn test > /tmp/backend_tests.log 2>&1; then
    success "Backend tests: ✅ PASANDO"
else
    warning "Backend tests: ⚠️ FALLOS DETECTADOS"
    TEST_FAILURES=$((TEST_FAILURES + 1))
fi
cd ..

# Frontend tests
cd frontend
if yarn test --passWithNoTests > /tmp/frontend_tests.log 2>&1; then
    success "Frontend tests: ✅ PASANDO"
else
    warning "Frontend tests: ⚠️ FALLOS DETECTADOS"
    TEST_FAILURES=$((TEST_FAILURES + 1))
fi
cd ..

# Packages tests
for package in packages/*/; do
    if [ -d "$package" ]; then
        package_name=$(basename "$package")
        cd "$package"
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            if yarn test > "/tmp/${package_name}_tests.log" 2>&1; then
                success "Package $package_name tests: ✅ PASANDO"
            else
                warning "Package $package_name tests: ⚠️ FALLOS DETECTADOS"
                TEST_FAILURES=$((TEST_FAILURES + 1))
            fi
        fi
        cd - > /dev/null
    fi
done

# 7. Build verification
log "🏗️ Verificando builds..."
BUILD_FAILURES=0

# Frontend build
cd frontend
if yarn build > /tmp/frontend_build.log 2>&1; then
    success "Frontend build: ✅ EXITOSO"
else
    error "Frontend build: ❌ FALLÓ"
    BUILD_FAILURES=$((BUILD_FAILURES + 1))
fi
cd ..

# Backend build
cd backend
if yarn build > /tmp/backend_build.log 2>&1; then
    success "Backend build: ✅ EXITOSO"
else
    error "Backend build: ❌ FALLÓ"
    BUILD_FAILURES=$((BUILD_FAILURES + 1))
fi
cd ..

# 8. Análisis de seguridad
log "🔒 Análisis de seguridad..."
if command -v yarn audit >/dev/null; then
    yarn audit --level moderate > /tmp/security_audit.log 2>&1
    AUDIT_EXIT_CODE=$?
    if [ $AUDIT_EXIT_CODE -eq 0 ]; then
        success "Auditoría de seguridad: ✅ SIN VULNERABILIDADES"
    else
        warning "Auditoría de seguridad: ⚠️ VULNERABILIDADES ENCONTRADAS"
    fi
else
    warning "yarn audit no disponible"
fi

# 9. Tamaño del proyecto
log "📊 Análisis de tamaño..."
TOTAL_SIZE=$(du -sh . | cut -f1)
BACKEND_SIZE=$(du -sh backend | cut -f1)
FRONTEND_SIZE=$(du -sh frontend | cut -f1)
NODE_MODULES_SIZE=$(du -sh .yarn | cut -f1)

echo "Tamaño total del proyecto: $TOTAL_SIZE"
echo "Backend: $BACKEND_SIZE"
echo "Frontend: $FRONTEND_SIZE"
echo "Dependencies (.yarn): $NODE_MODULES_SIZE"

# 10. Resumen final
echo
echo "=================================="
echo "        RESUMEN DE AUDITORÍA"
echo "=================================="

TOTAL_ISSUES=$((LINT_ERRORS + TEST_FAILURES + BUILD_FAILURES))

if [ $TOTAL_ISSUES -eq 0 ]; then
    success "🎉 PROYECTO EN EXCELENTE ESTADO"
    echo "   - Todos los tests pasan"
    echo "   - Sin errores de linting"
    echo "   - Builds exitosos"
    echo "   - Estructura correcta"
elif [ $TOTAL_ISSUES -le 2 ]; then
    warning "⚠️ PROYECTO EN BUEN ESTADO CON MEJORAS MENORES"
    echo "   - $LINT_ERRORS errores de linting"
    echo "   - $TEST_FAILURES fallos en tests"
    echo "   - $BUILD_FAILURES fallos en builds"
else
    error "❌ PROYECTO REQUIERE ATENCIÓN"
    echo "   - $LINT_ERRORS errores de linting"
    echo "   - $TEST_FAILURES fallos en tests"
    echo "   - $BUILD_FAILURES fallos en builds"
fi

echo
echo "Logs detallados disponibles en /tmp/*_*.log"
echo "Ejecuta 'cat /tmp/[component]_[type].log' para ver detalles"
echo
echo "Recomendaciones:"
echo "1. Ejecutar 'yarn lint:fix' para corregir errores de formato"
echo "2. Revisar tests fallidos con 'yarn test --verbose'"
echo "3. Verificar builds con logs detallados"
echo
echo "Auditoría completada: $(date)"
echo "=================================="

# Generar reporte en archivo
REPORT_FILE="docs/audit/audit-$(date +%Y%m%d-%H%M%S).md"
mkdir -p docs/audit

cat > "$REPORT_FILE" << EOF
# Reporte de Auditoría Automática

**Fecha:** $(date)
**Rama:** $(git branch --show-current)
**Commit:** $(git rev-parse --short HEAD)

## Resumen
- Errores de linting: $LINT_ERRORS
- Fallos en tests: $TEST_FAILURES
- Fallos en builds: $BUILD_FAILURES
- Total issues: $TOTAL_ISSUES

## Detalles
$(if [ $TOTAL_ISSUES -eq 0 ]; then echo "✅ Proyecto en excelente estado"; elif [ $TOTAL_ISSUES -le 2 ]; then echo "⚠️ Proyecto en buen estado"; else echo "❌ Proyecto requiere atención"; fi)

## Tamaños
- Total: $TOTAL_SIZE
- Backend: $BACKEND_SIZE  
- Frontend: $FRONTEND_SIZE
- Dependencies: $NODE_MODULES_SIZE

## Logs Generados
- /tmp/backend_lint.log
- /tmp/frontend_lint.log
- /tmp/backend_tests.log
- /tmp/frontend_tests.log
- /tmp/backend_build.log
- /tmp/frontend_build.log
- /tmp/security_audit.log
EOF

success "Reporte guardado en: $REPORT_FILE"

exit $TOTAL_ISSUES
