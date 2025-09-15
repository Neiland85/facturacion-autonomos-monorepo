#!/bin/bash
echo "🚀 INICIANDO APLICACIÓN WEB - TRIBUTARIAPP"
echo "=========================================="
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Puerto $port está en uso"
        return 0
    else
        echo "❌ Puerto $port está libre"
        return 1
    fi
}

echo "📊 VERIFICANDO ESTADO INICIAL:"
echo "------------------------------"
check_port 3004
echo ""

echo "🏗️ INICIANDO APLICACIÓN WEB..."
echo "------------------------------"

# Cambiar al directorio de la aplicación web
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/web

echo "📁 Directorio actual: $(pwd)"
echo "🔧 Verificando Node.js: $(node --version 2>/dev/null || echo 'No encontrado')"
echo "📦 Verificando pnpm: $(pnpm --version 2>/dev/null || echo 'No encontrado')"
echo ""

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    exit 1
fi

echo "📋 Contenido de package.json:"
cat package.json | grep -A 5 '"scripts"'
echo ""

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    pnpm install
fi

echo "🌐 Iniciando servidor de desarrollo..."
echo "📍 Puerto esperado: 3004"
echo "🌍 URL esperada: http://localhost:3004"
echo ""
echo "Para verificar funcionamiento:"
echo "  curl http://localhost:3004"
echo "  curl http://localhost:3004/api/health"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

# Iniciar la aplicación
exec pnpm run dev
