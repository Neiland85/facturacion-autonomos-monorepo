#!/bin/bash

# 🚀 Verificación y configuración de servicios backend

echo "🎯 Verificando servicios de backend disponibles..."

echo ""
echo "📂 Servicios encontrados en apps/:"

for service in apps/*/; do
    if [ -f "$service/package.json" ]; then
        service_name=$(basename "$service")
        echo "  ✅ $service_name"
        
        # Verificar si tiene script dev
        if grep -q '"dev"' "$service/package.json"; then
            echo "    📦 Script 'dev' disponible"
        else
            echo "    ⚠️  No tiene script 'dev'"
        fi
    fi
done

echo ""
echo "🚀 OPCIONES PARA INICIAR BACKEND:"
echo ""

echo "OPCIÓN 1 - Usar tareas de VS Code:"
echo "  1. Presiona Cmd+Shift+P"
echo "  2. Busca 'Tasks: Run Task'"
echo "  3. Selecciona:"
echo "     • 🚀 Servicio de Facturas - Desarrollo"
echo "     • Otros servicios disponibles"

echo ""
echo "OPCIÓN 2 - Manualmente en terminales separadas:"
echo "  Terminal 1: cd apps/invoice-service && yarn dev"
echo "  Terminal 2: cd apps/auth-service && yarn dev"
echo "  Terminal 3: cd apps/api-tax-calculator && yarn dev"
echo "  Terminal 4: cd apps/api-facturas && yarn dev"

echo ""
echo "OPCIÓN 3 - Un servicio a la vez:"
echo "  ./start-single-service.sh invoice-service"

echo ""
echo "📊 PUERTOS ESPERADOS:"
echo "  🔌 Invoice Service: 3002"
echo "  🔐 Auth Service: 3001" 
echo "  🧮 Tax Calculator: 3003"
echo "  📊 API Facturas: 3005"
echo "  🌐 Frontend: 3000 (ya funcionando)"

echo ""
echo "🔍 Para verificar qué servicios están ejecutándose:"
echo "  lsof -i :3001,3002,3003,3005"
