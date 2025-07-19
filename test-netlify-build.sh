#!/bin/bash
# 🧪 Script para probar el build localmente antes de deployar en Netlify

set -e

echo "🧪 TESTING BUILD LOCAL PARA NETLIFY"
echo "=================================="

cd "$(dirname "$0")"

echo "📍 Ubicación actual: $(pwd)"
echo "📦 Instalando dependencias..."

# Instalar dependencias en apps/web
cd apps/web
npm install --legacy-peer-deps

echo "🔧 Verificando dependencias SWC..."
if npm list @swc/core &>/dev/null; then
    echo "✅ @swc/core instalado correctamente"
else
    echo "⚠️  Instalando @swc/core..."
    npm install @swc/core --legacy-peer-deps
fi

if npm list @swc/helpers &>/dev/null; then
    echo "✅ @swc/helpers instalado correctamente"
else
    echo "⚠️  Instalando @swc/helpers..."
    npm install @swc/helpers --legacy-peer-deps
fi

echo "🏗️  Ejecutando build para Netlify..."
export NODE_ENV=production
export SWC_BINARY_TARGET="x86_64-unknown-linux-gnu"

npm run build:netlify

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡BUILD EXITOSO!"
    echo "✅ El proyecto está listo para Netlify"
    echo "📂 Archivos generados en: apps/web/.next"
    echo ""
    ls -la .next/ | head -10
    echo ""
    echo "🚀 Puedes hacer commit y push con confianza"
else
    echo ""
    echo "❌ BUILD FALLÓ"
    echo "🔍 Revisa los errores anteriores"
    exit 1
fi
