#!/bin/bash

# Script simplificado para iniciar los servicios
echo "🚀 Iniciando servicios..."

# Terminal 1: Servicio de facturas
echo "📊 Para iniciar el servicio de facturas, ejecuta en una terminal:"
echo "cd apps/invoice-service && pnpm dev"
echo ""

# Terminal 2: Frontend
echo "🌐 Para iniciar el frontend, ejecuta en otra terminal:"
echo "cd apps/web && pnpm dev"
echo ""

# Pruebas
echo "🧪 Para probar la API del servicio de facturas:"
echo "cd apps/invoice-service && pnpm test:service"
echo ""

echo "🌍 URLs disponibles una vez iniciados:"
echo "- Frontend: http://localhost:3000"
echo "- API Facturas: http://localhost:3002"
echo "- Swagger API: http://localhost:3002/api-docs"
echo "- Health Check: http://localhost:3002/health"
