#!/bin/bash

echo "🔍 VERIFICACIÓN POST-DESPLIEGUE VERCEL"
echo "======================================"
echo ""

# Función para verificar endpoint
check_endpoint() {
    local url=$1
    local name=$2

    echo "🔗 Verificando $name: $url"
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo "✅ $name: OK"
        return 0
    else
        echo "❌ $name: ERROR"
        return 1
    fi
}

# Obtener URL de Vercel del despliegue anterior
echo "📋 URLs a verificar:"
echo ""

# Verificar frontend
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app" "Frontend"

# Verificar APIs
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app/api/health" "API Health"
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app/auth/login" "Auth Service"
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app/api/facturas" "Facturas API"
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app/api/tax-calculator" "Tax Calculator API"
check_endpoint "https://facturacion-autonomos-monorepo.vercel.app/api/invoices" "Invoice Service"

echo ""
echo "📊 RESULTADO DE VERIFICACIÓN:"
echo "• Frontend: https://facturacion-autonomos-monorepo.vercel.app"
echo "• API Gateway: https://facturacion-autonomos-monorepo.vercel.app/api"
echo "• Auth Service: https://facturacion-autonomos-monorepo.vercel.app/auth"
echo "• Facturas API: https://facturacion-autonomos-monorepo.vercel.app/api/facturas"
echo "• Tax Calculator: https://facturacion-autonomos-monorepo.vercel.app/api/tax-calculator"
echo "• Invoice Service: https://facturacion-autonomos-monorepo.vercel.app/api/invoices"
echo ""

echo "🎯 PRÓXIMOS PASOS RECOMENDADOS:"
echo "1. Configurar variables de entorno en Vercel Dashboard"
echo "2. Configurar base de datos PostgreSQL"
echo "3. Probar funcionalidades completas"
echo "4. Configurar dominio personalizado (opcional)"
echo ""

echo "📝 NOTAS IMPORTANTES:"
echo "• El servicio api-tax-calculator tiene implementación temporal"
echo "• Revisar logs en Vercel Dashboard para posibles errores"
echo "• Configurar monitoreo y alertas según sea necesario"
