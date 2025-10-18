#!/bin/bash

echo "🚀 Configuración de Variables de Entorno en Vercel"
echo "=================================================="
echo ""

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instálalo con:"
    echo "npm install -g vercel"
    exit 1
fi

# Verificar que estamos autenticados
if ! vercel whoami &> /dev/null; then
    echo "❌ No estás autenticado en Vercel. Ejecuta:"
    echo "vercel login"
    exit 1
fi

echo "✅ Vercel CLI está configurado"

# Variables requeridas para el proyecto
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "JWT_EXPIRES_IN"
    "REDIS_URL"
)

OPTIONAL_VARS=(
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "WEBHOOK_SECRET"
)

echo ""
echo "📋 Variables requeridas que debes configurar:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   • $var"
done

echo ""
echo "📋 Variables opcionales:"
for var in "${OPTIONAL_VARS[@]}"; do
    echo "   • $var"
done

echo ""
echo "🔧 Configuración automática de variables de entorno..."
echo ""

# Configurar variables requeridas con valores de ejemplo
echo "⚠️  IMPORTANTE: Estas son variables de EJEMPLO."
echo "   Debes reemplazarlas con valores reales en el dashboard de Vercel."
echo ""

# Función para configurar variable
set_env_var() {
    local var_name=$1
    local var_value=$2
    local environment=${3:-"production"}

    echo "Configurando $var_name..."
    vercel env add $var_name $environment << EOF
$var_value
EOF
}

# Configurar variables requeridas
echo "🔧 Configurando variables requeridas..."

# Database URL (requiere configuración manual)
echo "⚠️  DATABASE_URL debe configurarse manualmente con tu conexión PostgreSQL"
echo "   Ejemplo: postgresql://usuario:password@host:5432/database"

# JWT Secret
set_env_var "JWT_SECRET" "tu_jwt_secret_super_seguro_min_32_caracteres"

# JWT Expires In
set_env_var "JWT_EXPIRES_IN" "24h"

# Redis URL
set_env_var "REDIS_URL" "redis://localhost:6379"

echo ""
echo "✅ Variables básicas configuradas!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a https://vercel.com/dashboard y selecciona tu proyecto"
echo "2. Ve a la pestaña 'Settings' > 'Environment Variables'"
echo "3. Actualiza DATABASE_URL con tu conexión real a PostgreSQL"
echo "4. Configura las variables opcionales si las necesitas"
echo "5. Haz un push a la rama main para activar el despliegue"
echo ""
echo "🎉 ¡Configuración completada!"