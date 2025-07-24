#!/bin/bash

# 🚀 Script helper para Netlify Dev - Facturación Autónomos

echo "🎯 Iniciando Netlify Dev para @facturacion/web..."

# Verificar que estamos en el directorio correcto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: No se encontró netlify.toml. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# Verificar que Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

echo "🔧 Configuración detectada:"
echo "  📂 Base directory: apps/web"
echo "  🌐 Netlify dev port: 8888"
echo "  🎯 Next.js target port: 3000"
echo "  📄 Build command: yarn workspace @facturacion/web dev:netlify"

# Limpiar posibles procesos anteriores
echo "🧹 Limpiando procesos anteriores..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "netlify dev" 2>/dev/null || true

# Esperar un momento para que se liberen los puertos
sleep 2

echo "🚀 Iniciando Netlify Dev..."
echo "📍 URL: http://localhost:8888"
echo "🔄 Presiona Ctrl+C para detener"
echo ""

# Ejecutar netlify dev con configuración específica
cd apps/web && netlify dev --port 8888 --target-port 3000 --dir .

echo "✅ Netlify Dev finalizado."
