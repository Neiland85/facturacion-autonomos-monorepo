#!/bin/bash
echo "🚀 Iniciando Auth Service de TributariApp..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/auth-service

echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    pnpm install
fi

echo "🏗️ Construyendo servicio..."
pnpm run build

echo "🌐 Iniciando servidor en puerto 3003..."
echo "📍 Puerto: 3003"
echo "🌍 URL: http://localhost:3003"
echo "📚 Documentación: http://localhost:3003/api-docs"
echo ""
echo "Para probar:"
echo "  curl http://localhost:3003/api/health"
echo "  curl http://localhost:3003/api-docs"
echo ""

# Iniciar el servicio
pnpm run dev
