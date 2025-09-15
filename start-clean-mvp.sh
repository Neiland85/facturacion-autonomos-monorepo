#!/bin/bash
echo "🧹 INICIO LIMPIO MVP - TRIBUTARIAPP"
echo "==================================="
echo ""

# Función para iniciar servicio en puerto específico
start_clean_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo "🚀 Iniciando $service_name en puerto $port..."

    # Cambiar al directorio del servicio
    cd "$service_path" || {
        echo "❌ Error: No se puede acceder a $service_path"
        return 1
    }

    # Verificar que el puerto esté libre
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  Puerto $port ocupado, liberando..."
        fuser -k $port/tcp 2>/dev/null || true
        sleep 2
    fi

    # Iniciar servicio con puerto específico
    echo "📡 Iniciando en puerto $port..."
    PORT=$port pnpm dev > service.log 2>&1 &
    local pid=$!

    # Guardar PID
    echo $pid > service.pid

    echo "✅ $service_name iniciado (PID: $pid)"

    # Esperar un poco para que inicie
    sleep 3

    # Verificar que esté respondiendo
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "🟢 Servicio $service_name operativo"
    elif curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
        echo "🟢 Servicio $service_name operativo (API health)"
    else
        echo "🟡 Servicio $service_name iniciándose..."
    fi

    cd - > /dev/null
    echo ""
}

# Detener servicios previos
echo "🛑 Deteniendo servicios previos..."
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "tsx.*watch" 2>/dev/null || true
sleep 2

# Iniciar servicios en orden
echo "🔄 Iniciando servicios en orden correcto..."
start_clean_service "Auth Service" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/auth-service" "3004"
start_clean_service "Invoice Service" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/invoice-service" "3001"
start_clean_service "Tax Calculator" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/api-tax-calculator" "3002"
start_clean_service "Web Application" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/web" "3000"

echo "⏳ Esperando que todos los servicios estén listos..."
sleep 5

echo "🎯 Verificación final..."
echo "======================"

# Verificar estado final
SERVICES_OK=0

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Invoice Service: OPERATIVO"
    ((SERVICES_OK++))
else
    echo "❌ Invoice Service: NO RESPONDE"
fi

if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Tax Calculator: OPERATIVO"
    ((SERVICES_OK++))
else
    echo "❌ Tax Calculator: NO RESPONDE"
fi

if curl -s http://localhost:3004/api/health > /dev/null 2>&1; then
    echo "✅ Auth Service: OPERATIVO"
    ((SERVICES_OK++))
else
    echo "❌ Auth Service: NO RESPONDE"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Web Application: OPERATIVO"
    ((SERVICES_OK++))
else
    echo "❌ Web Application: NO RESPONDE"
fi

echo ""
echo "📊 RESULTADO: $SERVICES_OK/4 servicios operativos"

if [ $SERVICES_OK -eq 4 ]; then
    echo "🎉 ¡ÉXITO! MVP 100% OPERATIVO"
    echo "🚀 Ejecuta './mvp-100-verification.sh' para ver el reporte completo"
else
    echo "⚠️  Algunos servicios requieren atención"
    echo "💡 Revisa los logs en cada directorio de servicio"
fi
