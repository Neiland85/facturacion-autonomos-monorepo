#!/bin/bash

# 🔐 SCRIPT DE VERIFICACIÓN DE SEGURIDAD - KEYS & SECRETS
# =====================================================
# Detecta exposición de claves de API y secretos en el proyecto

echo "🔍 INICIANDO AUDITORÍA DE SEGURIDAD..."
echo "======================================"

# Colores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Contadores
CRITICAL_ISSUES=0
WARNING_ISSUES=0
INFO_ISSUES=0

# 1. VERIFICAR ARCHIVOS .env EN GIT
echo ""
echo "📋 1. VERIFICANDO ARCHIVOS .env EN GIT..."

env_files=$(git ls-files | grep -E "\.env$|\.env\..*$" | grep -v "\.env\.example")

if [ -n "$env_files" ]; then
    echo -e "${RED}🚨 CRÍTICO: Archivos .env encontrados en Git:${NC}"
    echo "$env_files"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    
    echo ""
    echo "📝 SOLUCIÓN:"
    echo "git rm --cached $env_files"
    echo "echo '$env_files' >> .gitignore"
else
    echo -e "${GREEN}✅ No se encontraron archivos .env en Git${NC}"
fi

# 2. BUSCAR CLAVES DE API HARDCODEADAS
echo ""
echo "📋 2. BUSCANDO CLAVES DE API HARDCODEADAS..."

# Patrones de claves peligrosas
api_patterns=(
    "FAL_API_KEY.*=.*['\"][^'\"]{10,}['\"]"
    "OPENAI_API_KEY.*=.*['\"][^'\"]{10,}['\"]"
    "sk-[a-zA-Z0-9]{20,}"
    "fal_[a-zA-Z0-9]{20,}"
    "xoxb-[a-zA-Z0-9-]+"
    "ya29\.[a-zA-Z0-9_-]+"
)

for pattern in "${api_patterns[@]}"; do
    matches=$(grep -r -n --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git "$pattern" . 2>/dev/null || true)
    
    if [ -n "$matches" ]; then
        echo -e "${RED}🚨 CRÍTICO: Patrón de clave API encontrado:${NC}"
        echo "$matches"
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    fi
done

# 3. VERIFICAR VARIABLES process.env EN CLIENTE
echo ""
echo "📋 3. VERIFICANDO EXPOSICIÓN DE VARIABLES AL CLIENTE..."

client_exposure=$(grep -r -n --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git "process\.env\.(FAL_API_KEY\|OPENAI_API_KEY\|JWT_SECRET\|DATABASE_URL)" . 2>/dev/null || true)

if [ -n "$client_exposure" ]; then
    echo -e "${RED}🚨 CRÍTICO: Variables del servidor accedidas en componentes cliente:${NC}"
    echo "$client_exposure"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
else
    echo -e "${GREEN}✅ No se encontraron variables del servidor en componentes cliente${NC}"
fi

# 4. VERIFICAR NEXT_PUBLIC VARIABLES PELIGROSAS
echo ""
echo "📋 4. VERIFICANDO VARIABLES NEXT_PUBLIC PELIGROSAS..."

dangerous_public=$(grep -r -n --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git "NEXT_PUBLIC_.*\(SECRET\|KEY\|PASSWORD\|TOKEN\)" . 2>/dev/null || true)

if [ -n "$dangerous_public" ]; then
    echo -e "${YELLOW}⚠️ ADVERTENCIA: Variables NEXT_PUBLIC potencialmente peligrosas:${NC}"
    echo "$dangerous_public"
    WARNING_ISSUES=$((WARNING_ISSUES + 1))
else
    echo -e "${GREEN}✅ No se encontraron variables NEXT_PUBLIC peligrosas${NC}"
fi

# 5. VERIFICAR SECRETOS EN .env.example
echo ""
echo "📋 5. VERIFICANDO SECRETOS EN .env.example..."

example_secrets=$(find . -name "*.env.example" -exec grep -l -E "(sk-[a-zA-Z0-9]{20,}|[a-zA-Z0-9]{32,})" {} \; 2>/dev/null || true)

if [ -n "$example_secrets" ]; then
    echo -e "${YELLOW}⚠️ ADVERTENCIA: Posibles secretos reales en archivos .env.example:${NC}"
    echo "$example_secrets"
    WARNING_ISSUES=$((WARNING_ISSUES + 1))
else
    echo -e "${GREEN}✅ No se encontraron secretos en archivos .env.example${NC}"
fi

# 6. VERIFICAR CONFIGURACIÓN DE .gitignore
echo ""
echo "📋 6. VERIFICANDO CONFIGURACIÓN DE .gitignore..."

if [ -f ".gitignore" ]; then
    if grep -q "\.env$" .gitignore && grep -q "\.env\.\*" .gitignore; then
        echo -e "${GREEN}✅ .gitignore configurado correctamente para archivos .env${NC}"
    else
        echo -e "${YELLOW}⚠️ ADVERTENCIA: .gitignore no incluye patrones .env${NC}"
        WARNING_ISSUES=$((WARNING_ISSUES + 1))
    fi
else
    echo -e "${RED}🚨 CRÍTICO: No se encontró archivo .gitignore${NC}"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

# 7. VERIFICAR IMPORTS DE VALIDACIÓN DE SEGURIDAD
echo ""
echo "📋 7. VERIFICANDO VALIDACIÓN DE SEGURIDAD EN API ROUTES..."

api_routes=$(find . -path "*/api/*" -name "*.ts" -o -path "*/api/*" -name "*.js" 2>/dev/null || true)

routes_without_validation=0
routes_total=0

for route in $api_routes; do
    if [ -f "$route" ]; then
        routes_total=$((routes_total + 1))
        
        if ! grep -q "validateServerEnvironment\|ensureServerSide" "$route" 2>/dev/null; then
            if grep -q "process\.env\." "$route" 2>/dev/null; then
                echo -e "${YELLOW}⚠️ ADVERTENCIA: API route sin validación de seguridad: $route${NC}"
                routes_without_validation=$((routes_without_validation + 1))
            fi
        fi
    fi
done

if [ $routes_without_validation -gt 0 ]; then
    echo -e "${YELLOW}⚠️ $routes_without_validation de $routes_total API routes sin validación de seguridad${NC}"
    WARNING_ISSUES=$((WARNING_ISSUES + 1))
else
    echo -e "${GREEN}✅ Todas las API routes tienen validación de seguridad${NC}"
fi

# 8. GENERAR REPORTE FINAL
echo ""
echo "📊 REPORTE FINAL DE SEGURIDAD"
echo "============================="
echo -e "🚨 Problemas críticos: ${RED}$CRITICAL_ISSUES${NC}"
echo -e "⚠️ Advertencias: ${YELLOW}$WARNING_ISSUES${NC}"
echo -e "ℹ️ Informativo: $INFO_ISSUES"

echo ""
if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "${RED}💥 AUDITORÍA FALLIDA: Se encontraron problemas críticos de seguridad${NC}"
    echo "🔧 ACCIONES REQUERIDAS:"
    echo "1. Eliminar archivos .env del tracking de Git"
    echo "2. Rotar todas las claves expuestas"
    echo "3. Implementar validación de variables de entorno"
    echo "4. Verificar que las variables estén solo en el servidor"
    exit 1
elif [ $WARNING_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️ AUDITORÍA CON ADVERTENCIAS: Se encontraron problemas menores${NC}"
    echo "🔧 RECOMENDACIONES:"
    echo "1. Revisar advertencias reportadas"
    echo "2. Implementar validaciones adicionales"
    echo "3. Documentar variables de entorno"
    exit 0
else
    echo -e "${GREEN}✅ AUDITORÍA EXITOSA: No se encontraron problemas de seguridad${NC}"
    echo "🎉 El proyecto cumple con los estándares de seguridad"
    exit 0
fi
