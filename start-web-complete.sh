#!/bin/bash
echo "🚀 Iniciando aplicación web de TributariApp..."
echo "📁 Navegando al directorio de la aplicación web..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/web

echo "🔧 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    pnpm install
fi

echo "🏗️ Construyendo paquete UI..."
cd ../../packages/ui
if [ ! -d "dist" ]; then
    echo "🔨 Construyendo paquete UI..."
    pnpm build
fi

echo "🌐 Iniciando servidor de desarrollo..."
cd ../apps/web
echo "📍 Puerto: 3004"
echo "🌍 URL: http://localhost:3004"
echo ""
echo "Para probar la aplicación:"
echo "  curl http://localhost:3004/api/health"
echo "  curl http://localhost:3004"
echo ""
pnpm run dev
