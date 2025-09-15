#!/bin/bash
echo "🎯 INICIANDO MVP COMPLETO - TRIBUTARIAPP"
echo "=========================================="
echo ""

# Función para verificar si un servicio está corriendo
check_service() {
    local port=$1
    local name=$2
    if curl -s http://localhost:$port/api/health > /dev/null 2>&1; then
        echo "✅ $name (puerto $port): FUNCIONANDO"
        return 0
    else
        echo "❌ $name (puerto $port): NO RESPONDE"
        return 1
    fi
}

echo "📊 VERIFICANDO ESTADO ACTUAL:"
echo "------------------------------"
check_service 3002 "Invoice Service"
check_service 3003 "Auth Service"
check_service 3004 "Web App"
echo ""

echo "🚀 INICIANDO SERVICIOS..."
echo "---------------------------"

# Iniciar servicios en background
echo "🧾 Iniciando Invoice Service..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/invoice-service
pnpm run dev > /dev/null 2>&1 &
INVOICE_PID=$!

echo "🔐 Iniciando Auth Service..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/auth-service
pnpm run dev > /dev/null 2>&1 &
AUTH_PID=$!

echo "🧮 Iniciando Tax Calculator..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/api-tax-calculator
pnpm run dev > /dev/null 2>&1 &
TAX_PID=$!

echo "🌐 Iniciando Web App..."
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/web
pnpm run dev > /dev/null 2>&1 &
WEB_PID=$!

echo ""
echo "⏳ Esperando que los servicios inicien..."
sleep 15

echo ""
echo "📊 VERIFICACIÓN FINAL:"
echo "-----------------------"
check_service 3002 "Invoice Service"
check_service 3003 "Auth Service"
check_service 3004 "Web App"
echo ""

echo "🌍 URLs DE ACCESO:"
echo "-------------------"
echo "🧾 Invoice Service:     http://localhost:3002"
echo "🔐 Auth Service:        http://localhost:3003"
echo "🧮 Tax Calculator:      http://localhost:3003"
echo "🌐 Web App:            http://localhost:3004"
echo "📚 Auth Docs:          http://localhost:3003/api-docs"
echo ""

echo "🛑 PARA DETENER SERVICIOS:"
echo "kill $INVOICE_PID $AUTH_PID $TAX_PID $WEB_PID"
echo ""

echo "🎉 MVP TRIBUTARIAPP LISTO!"
echo "PID Invoice: $INVOICE_PID"
echo "PID Auth: $AUTH_PID"
echo "PID Tax: $TAX_PID"
echo "PID Web: $WEB_PID"
