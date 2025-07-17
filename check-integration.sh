#!/bin/bash

echo "🎯 Estado de la Integración Completa"
echo "===================================="

# Verificar archivos esenciales
echo "📁 Verificando estructura de archivos..."

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 (faltante)"
    fi
}

check_file "apps/invoice-service/package.json"
check_file "apps/invoice-service/.env"
check_file "apps/invoice-service/src/index.ts"
check_file "apps/web/package.json"
check_file "apps/web/.env.local"
check_file "apps/web/src/app/page.tsx"

echo ""

# Verificar servicios
echo "🌐 Verificando servicios..."

check_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo "✅ $name funcionando ($url)"
    else
        echo "❌ $name no disponible ($url)"
    fi
}

check_service "http://localhost:3002/health" "Backend Invoice Service"
check_service "http://localhost:3000" "Frontend Next.js"

echo ""

# Mostrar puertos en uso
echo "🔌 Puertos en uso:"
lsof -i :3000 2>/dev/null | grep LISTEN || echo "   Puerto 3000: Libre"
lsof -i :3002 2>/dev/null | grep LISTEN || echo "   Puerto 3002: Libre"

echo ""

# Instrucciones
echo "🚀 Para iniciar la integración completa:"
echo "1. ./setup-integration.sh      (configuración inicial)"
echo "2. ./start-all-services.sh     (iniciar servicios)"
echo "3. ./quick-test.sh             (prueba rápida)"

echo ""
echo "🌍 URLs una vez iniciado:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3002"
echo "- API Docs: http://localhost:3002/api-docs"

echo ""
echo "📚 Ver INTEGRATION_TEST.md para instrucciones detalladas"
