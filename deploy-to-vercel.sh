#!/bin/bash

echo "🚀 Despliegue a Vercel - Facturación Autónomos"
echo "=============================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json no encontrado. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Verificar variables de entorno requeridas
echo "🔍 Verificando variables de entorno..."
MISSING_VARS=()

if [ -z "$VERCEL_TOKEN" ]; then
    MISSING_VARS+=("VERCEL_TOKEN")
fi

if [ -z "$VERCEL_PROJECT_ID" ]; then
    MISSING_VARS+=("VERCEL_PROJECT_ID")
fi

if [ -z "$VERCEL_ORG_ID" ]; then
    MISSING_VARS+=("VERCEL_ORG_ID")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Faltan las siguientes variables de entorno:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📋 Configúralas en tu entorno o en el dashboard de Vercel"
    exit 1
fi

echo "✅ Todas las variables de entorno están configuradas"

# Instalar Vercel CLI si no está disponible
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Determinar el entorno basado en la rama actual
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
    echo "🏭 Desplegando a PRODUCCIÓN..."
    vercel --prod --yes
elif [ "$BRANCH" = "develop" ]; then
    echo "🧪 Desplegando a STAGING..."
    vercel --yes
else
    echo "🧪 Desplegando PREVIEW para rama: $BRANCH"
    vercel --yes
fi

echo ""
echo "✅ Despliegue completado exitosamente!"
echo ""
echo "🌐 Tu aplicación estará disponible en la URL proporcionada por Vercel"