#!/bin/bash

echo "🔍 Verificando implementación de validación de seguridad..."
echo "================================================="

# Buscar archivos route.ts que tengan las validaciones de seguridad
echo ""
echo "📋 RUTAS API CON VALIDACIÓN DE SEGURIDAD:"

routes_with_security=$(grep -r "ensureServerSide\|validateServerEnvironment" backend/web/app/api/ --include="*.ts" | wc -l)
total_routes=$(find backend/web/app/api/ -name "route.ts" | wc -l)

echo "✅ Rutas con validación: $routes_with_security"
echo "📊 Total de rutas: $total_routes"

if [ "$routes_with_security" -eq "$total_routes" ]; then
    echo "🎉 ¡TODAS LAS RUTAS TIENEN VALIDACIÓN DE SEGURIDAD!"
else
    echo "⚠️ Rutas sin validación de seguridad:"
    
    # Buscar rutas que NO tienen validación
    for route in $(find backend/web/app/api/ -name "route.ts"); do
        if ! grep -q "ensureServerSide\|validateServerEnvironment" "$route"; then
            echo "  - $route"
        fi
    done
fi

echo ""
echo "🔐 ARCHIVOS DE VALIDACIÓN DE SEGURIDAD:"
if [ -f "backend/web/utils/server-env-validation.ts" ]; then
    echo "✅ backend/web/utils/server-env-validation.ts - EXISTS"
else
    echo "❌ backend/web/utils/server-env-validation.ts - MISSING"
fi

if [ -f "apps/web/utils/server-env-validation.ts" ]; then
    echo "✅ apps/web/utils/server-env-validation.ts - EXISTS"
else
    echo "❌ apps/web/utils/server-env-validation.ts - MISSING"
fi

echo ""
echo "🔍 BÚSQUEDA DE CLAVES API EN ARCHIVOS:"

# Buscar referencias a FAL_API_KEY y OPENAI_API_KEY
fal_usage=$(grep -r "FAL_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l)
openai_usage=$(grep -r "OPENAI_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l)

echo "📊 Referencias a FAL_API_KEY: $fal_usage"
echo "📊 Referencias a OPENAI_API_KEY: $openai_usage"

echo ""
echo "✅ VERIFICACIÓN COMPLETADA"
