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
    pnpm dev > /dev/null 2>&1 &

    # Esperar un momento para que el servicio inicie
    sleep 5

    # Verificar que esté ejecutándose usando el endpoint correcto
    if curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
        echo "   ✅ $service_name iniciado correctamente"
        echo "   📖 Documentación: http://localhost:$port/api-docs"
    else
        echo "   ❌ Error al iniciar $service_name"
        echo "   💡 Verificando proceso..."
        if pgrep -f "$service_name" > /dev/null; then
            echo "   ⚠️  Proceso ejecutándose pero no responde al health check"
        else
            echo "   ❌ Proceso no encontrado"
        fi
    fi

    echo ""
    cd - > /dev/null
}

# Iniciar servicios uno por uno con verificación
echo "🔄 Iniciando servicios en secuencia..."

start_service "auth-service" "apps/auth-service" "3003"
start_service "invoice-service" "apps/invoice-service" "3002"
start_service "api-tax-calculator" "apps/api-tax-calculator" "3004"

echo "🎉 Proceso de inicio completado!"
echo ""
echo "📋 Servicios disponibles:"
echo "   🔐 Auth Service:         http://localhost:3003/api-docs"
echo "   📄 Invoice Service:      http://localhost:3002/api-docs"
echo "   🧾 Tax Calculator:       http://localhost:3004/api-docs"
echo ""
echo "🔍 Ejecuta './mvp-100-verification.sh' para verificar el estado"
