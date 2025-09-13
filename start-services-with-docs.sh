#!/bin/bash

# Script para iniciar todos los servicios con documentación API integrada

echo "🚀 Iniciando servicios con documentación API integrada..."
echo ""

# Función para iniciar un servicio en background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo "📦 Iniciando $service_name en puerto $port..."
    cd "$service_path" || exit 1

    # Iniciar en background
    if [ "$service_name" = "invoice-service" ]; then
        pnpm dev > /dev/null 2>&1 &
    else
        pnpm dev > /dev/null 2>&1 &
    fi

    # Esperar un momento para que el servicio inicie
    sleep 3

    # Verificar que esté ejecutándose
    if curl -s "http://localhost:$port/health" > /dev/null; then
        echo "   ✅ $service_name iniciado correctamente"
        echo "   📖 Documentación: http://localhost:$port/api-docs"
    else
        echo "   ❌ Error al iniciar $service_name"
    fi

    echo ""
    cd - > /dev/null
}

# Iniciar servicios
start_service "auth-service" "apps/auth-service" "3003"
start_service "invoice-service" "apps/invoice-service" "3001"
start_service "api-tax-calculator" "apps/api-tax-calculator" "3002"
start_service "api-facturas" "apps/api-facturas" "3001"

echo "🎉 Todos los servicios han sido iniciados!"
echo ""
echo "📋 Servicios disponibles:"
echo "   🔐 Auth Service:         http://localhost:3003/api-docs"
echo "   📄 Invoice Service:      http://localhost:3001/api-docs"
echo "   🧾 Tax Calculator:       http://localhost:3002/api-docs"
echo "   📊 API Facturas:         http://localhost:3001/api-docs"
echo ""
echo "📖 Documentación unificada: http://localhost:3000/docs/api/index.html"
echo ""
echo "🧪 Para probar todos los servicios: node scripts/test-api-docs-integration.js"
echo ""
echo "Para detener todos los servicios: pkill -f 'pnpm dev'"

# Mantener el script ejecutándose para que los procesos en background continúen
echo ""
echo "Presiona Ctrl+C para detener todos los servicios..."
trap 'echo ""; echo "🛑 Deteniendo servicios..."; pkill -f "pnpm dev"; exit 0' INT
while true; do
    sleep 1
done
