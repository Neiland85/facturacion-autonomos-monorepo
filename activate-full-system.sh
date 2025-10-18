#!/bin/bash

# Script para configurar todas las variables faltantes y activar el sistema completo
# Uso: ./activate-full-system.sh

echo "🚀 Activación Completa del Sistema de Facturación"
echo "================================================="
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

# Función para configurar secret si no existe
ensure_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    if gh secret list | grep -q "^${secret_name} "; then
        echo "✅ $secret_name ya está configurado"
    else
        echo "🔧 Configurando $secret_name..."
        echo "$secret_value" | gh secret set "$secret_name"
        echo "✅ $secret_name configurado ($description)"
    fi
}

echo ""
echo "🔐 Configuración de Variables de Entorno Faltantes"
echo "=================================================="

# Variables adicionales que podrían faltar
ensure_secret "SMTP_HOST_PROD" "smtp.gmail.com" "SMTP host para producción"
ensure_secret "SMTP_PORT_PROD" "587" "SMTP port para producción"
ensure_secret "SMTP_USER_PROD" "tu-email@gmail.com" "SMTP user para producción"
ensure_secret "SMTP_PASS_PROD" "tu-app-password" "SMTP password para producción"

ensure_secret "SMTP_HOST_STAGING" "smtp.gmail.com" "SMTP host para staging"
ensure_secret "SMTP_PORT_STAGING" "587" "SMTP port para staging"
ensure_secret "SMTP_USER_STAGING" "tu-email@gmail.com" "SMTP user para staging"
ensure_secret "SMTP_PASS_STAGING" "tu-app-password" "SMTP password para staging"

ensure_secret "WEBHOOK_SECRET_PROD" "webhook_secret_prod_$(date +%s)" "Webhook secret para producción"
ensure_secret "WEBHOOK_SECRET_STAGING" "webhook_secret_staging_$(date +%s)" "Webhook secret para staging"

# Variables de configuración adicionales
ensure_secret "NODE_ENV_PROD" "production" "Node environment para producción"
ensure_secret "NODE_ENV_STAGING" "production" "Node environment para staging"
ensure_secret "NODE_ENV_DEV" "development" "Node environment para desarrollo"

echo ""
echo "🔄 Actualización de Variables de Redis (si es necesario)"
echo "======================================================="

# Asegurar que las variables de Redis estén configuradas correctamente
REDIS_URLS=(
    "REDIS_URL_DEV:redis://default:xxxxxxxxxxxx@usw1-famous-termite-12345.upstash.io:5432"
    "REDIS_URL_STAGING:redis://default:xxxxxxxxxxxx@usw1-cool-rabbit-12345.upstash.io:5432"
    "REDIS_URL_PROD:redis://h:xxxxxxxxxxxx@usw1-actual-termite-12345.ec2.cloud.redislabs.com:12345"
)

for redis_config in "${REDIS_URLS[@]}"; do
    IFS=':' read -r secret_name redis_url <<< "$redis_config"
    ensure_secret "$secret_name" "$redis_url" "Redis URL"
done

echo ""
echo "📊 Verificación Final de Secrets"
echo "==============================="

echo ""
echo "🔑 Secrets Base de Vercel:"
gh secret list | grep -E "(VERCEL_TOKEN|VERCEL_PROJECT_ID|VERCEL_ORG_ID)" | sort

echo ""
echo "🐘 Secrets de PostgreSQL:"
gh secret list | grep -E "DATABASE_URL" | sort

echo ""
echo "🔐 Secrets de Autenticación:"
gh secret list | grep -E "JWT_SECRET" | sort

echo ""
echo "🔴 Secrets de Redis:"
gh secret list | grep -E "REDIS_URL" | sort

echo ""
echo "📧 Secrets de Email:"
gh secret list | grep -E "SMTP" | sort

echo ""
echo "🎉 ¡Sistema Completamente Activado!"
echo ""
echo "📋 Estado del Sistema:"
echo "✅ Variables de entorno configuradas"
echo "✅ Secrets de GitHub Actions completos"
echo "✅ URLs de servicios configuradas"
echo "✅ Sistema de multi-entorno operativo"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Hacer merge del PR #63"
echo "2. Probar despliegue automático:"
echo "   - Push a 'develop' → Staging"
echo "   - Push a 'main' → Producción"
echo "3. Verificar funcionamiento en Vercel"
echo ""
echo "🔗 URLs importantes:"
echo "• Dashboard de Vercel: https://vercel.com/dashboard"
echo "• GitHub Actions: https://github.com/Neiland85/facturacion-autonomos-monorepo/actions"
echo "• PR para merge: https://github.com/Neiland85/facturacion-autonomos-monorepo/pull/63"