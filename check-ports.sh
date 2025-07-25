#!/bin/bash

# 🔍 Verificación rápida de servicios ejecutándose

echo "🎯 Verificando servicios ejecutándose..."

echo ""
echo "📊 ESTADO DE PUERTOS:"

for port in 3000 3001 3002 3003 3005; do
    if lsof -i :$port >/dev/null 2>&1; then
        process=$(lsof -i :$port | tail -1 | awk '{print $1}')
        echo "  ✅ Puerto $port: $process ejecutándose"
    else
        echo "  ❌ Puerto $port: Libre"
    fi
done

echo ""
echo "🌐 URLS PARA TESTING:"
echo "  Frontend: http://localhost:3000"
echo "  Auth Service: http://localhost:3001/health"
echo "  Invoice Service: http://localhost:3002/health"
echo "  Tax Calculator: http://localhost:3003/health"
echo "  API Facturas: http://localhost:3005/health"

echo ""
echo "🧪 TESTING RÁPIDO:"

for port in 3001 3002 3003 3005; do
    url="http://localhost:$port/health"
    if curl -s "$url" >/dev/null 2>&1; then
        echo "  ✅ $url - Responde"
    else
        echo "  ❌ $url - No responde"
    fi
done

echo ""
echo "💡 Para iniciar servicios faltantes:"
echo "  Cmd+Shift+P > Tasks: Run Task > Seleccionar servicio"
