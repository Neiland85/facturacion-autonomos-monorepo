#!/bin/bash
echo "🚀 INICIO MANUAL DE SERVICIOS MVP"
echo "=================================="
echo ""

# Función para iniciar servicio
start_service() {
    local name=$1
    local path=$2
    local port=$3

    echo "📦 Iniciando $name en puerto $port..."
    cd "$path" || exit 1

    # Iniciar en background
    PORT=$port pnpm dev > /dev/null 2>&1 &

    # Guardar PID
    echo $! > service.pid

    echo "   ✅ $name iniciado (PID: $(cat service.pid))"
    cd - > /dev/null
    echo ""
}

# Iniciar servicios
echo "🔄 Iniciando servicios en secuencia..."
start_service "Auth Service" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/auth-service" "3003"
start_service "Invoice Service" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/invoice-service" "3001"
start_service "Tax Calculator" "/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/api-tax-calculator" "3002"

echo "⏳ Esperando 10 segundos para que los servicios inicien..."
sleep 10

echo "🔍 Verificando servicios..."
echo "✅ Servicios iniciados. Ejecuta './mvp-100-verification.sh' para verificar estado."
