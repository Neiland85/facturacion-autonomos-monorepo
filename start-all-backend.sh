#!/bin/bash

# 🚀 Script para iniciar todos los servicios de backend

echo "🎯 Iniciando todos los servicios de backend..."

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🧹 Deteniendo todos los servicios..."
    pkill -f "node.*invoice-service" 2>/dev/null || true
    pkill -f "node.*auth-service" 2>/dev/null || true
    pkill -f "node.*api-tax-calculator" 2>/dev/null || true
    pkill -f "node.*api-gateway" 2>/dev/null || true
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta desde la raíz del proyecto"
    exit 1
fi

echo "📦 Servicios a iniciar:"
echo "  🔌 Invoice Service (Puerto 3002)"
echo "  🔐 Auth Service (Puerto 3001)" 
echo "  🧮 Tax Calculator (Puerto 3003)"
echo "  📊 API Facturas (Puerto 3005)"

echo ""
echo "🚀 Iniciando servicios en background..."

# Iniciar Invoice Service
echo "▶️  Iniciando Invoice Service..."
cd apps/invoice-service && yarn dev > /tmp/invoice-service.log 2>&1 &
INVOICE_PID=$!

sleep 2

# Iniciar Auth Service
echo "▶️  Iniciando Auth Service..."
cd ../auth-service && yarn dev > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!

sleep 2

# Iniciar Tax Calculator
echo "▶️  Iniciando Tax Calculator..."
cd ../api-tax-calculator && yarn dev > /tmp/tax-calculator.log 2>&1 &
TAX_PID=$!

sleep 2

# Iniciar API Facturas
echo "▶️  Iniciando API Facturas..."
cd ../api-facturas && yarn dev > /tmp/api-facturas.log 2>&1 &
FACTURAS_PID=$!

sleep 3

echo ""
echo "✅ Servicios iniciados:"
echo "  🔌 Invoice Service: http://localhost:3002"
echo "  🔐 Auth Service: http://localhost:3001"
echo "  🧮 Tax Calculator: http://localhost:3003"
echo "  📊 API Facturas: http://localhost:3005"

echo ""
echo "📋 Para ver logs:"
echo "  tail -f /tmp/invoice-service.log"
echo "  tail -f /tmp/auth-service.log"
echo "  tail -f /tmp/tax-calculator.log"
echo "  tail -f /tmp/api-facturas.log"

echo ""
echo "🔄 Presiona Ctrl+C para detener todos los servicios"

# Esperar indefinidamente
wait
