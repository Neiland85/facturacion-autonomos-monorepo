#!/bin/bash

# Script para actualizar secrets de GitHub Actions con valores más realistas
# Uso: ./update-secrets.sh

echo "🔄 Actualización de Secrets de GitHub Actions"
echo "============================================"
echo ""

# Verificar que GitHub CLI esté instalado y autenticado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado en GitHub CLI"
    exit 1
fi

echo "✅ GitHub CLI está configurado"

# Función para actualizar secret
update_github_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    echo "Actualizando $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name"
    echo "  📝 $description"
}

echo ""
echo "🔧 Actualizando secrets con valores más apropiados..."
echo ""

# JWT Secrets - Generar secrets más seguros
JWT_PROD="prod_jwt_secret_super_seguro_min_32_caracteres_para_produccion_$(date +%s)"
JWT_STAGING="staging_jwt_secret_super_seguro_min_32_caracteres_para_staging_$(date +%s)"
JWT_DEV="dev_jwt_secret_super_seguro_min_32_caracteres_para_desarrollo_$(date +%s)"

# Actualizar JWT secrets
update_github_secret "JWT_SECRET_PROD" "$JWT_PROD" "JWT secret para producción"
update_github_secret "JWT_SECRET_STAGING" "$JWT_STAGING" "JWT secret para staging"
update_github_secret "JWT_SECRET_DEV" "$JWT_DEV" "JWT secret para desarrollo"

echo ""
echo "📋 URLs de base de datos recomendadas:"
echo "  🐘 PostgreSQL:"
echo "    - Neon: https://neon.tech"
echo "    - Supabase: https://supabase.com"
echo "    - Railway: https://railway.app"
echo ""
echo "  🔴 Redis:"
echo "    - Upstash: https://upstash.com"
echo "    - Redis Labs: https://redis.com"
echo ""

echo "⚠️  IMPORTANTE: Actualiza manualmente las siguientes secrets con valores reales:"
echo ""
echo "1. DATABASE_URL_PROD"
echo "   Valor actual: postgresql://prod_user:prod_pass@prod_host:5432/prod_db?sslmode=require"
echo ""
echo "2. DATABASE_URL_STAGING"
echo "   Valor actual: postgresql://staging_user:staging_pass@staging_host:5432/staging_db?sslmode=require"
echo ""
echo "3. DATABASE_URL_DEV"
echo "   Valor actual: postgresql://dev_user:dev_pass@dev_host:5432/dev_db"
echo ""
echo "4. REDIS_URL_PROD"
echo "   Valor actual: redis://prod_user:prod_pass@prod_host:port/prod_db"
echo ""
echo "5. REDIS_URL_STAGING"
echo "   Valor actual: redis://staging_user:staging_pass@staging_host:port/staging_db"
echo ""
echo "6. REDIS_URL_DEV"
echo "   Valor actual: redis://dev_user:dev_pass@dev_host:port/dev_db"
echo ""

echo "🔗 Para actualizar manualmente:"
echo "   Ve a: https://github.com/Neiland85/facturacion-autonomos-monorepo/settings/secrets/actions"
echo ""

echo "✅ ¡Actualización completada!"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Configura las URLs de base de datos y Redis con servicios reales"
echo "2. Actualiza las secrets en GitHub Actions dashboard"
echo "3. Prueba el despliegue en Vercel"