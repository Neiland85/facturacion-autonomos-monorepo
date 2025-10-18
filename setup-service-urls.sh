#!/bin/bash

# Script para configurar URLs reales de servicios externos
# Uso: ./setup-service-urls.sh

echo "🔗 Configuración de URLs de Servicios Externos"
echo "=============================================="
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

# Función para configurar URL de servicio
set_service_url() {
    local secret_name=$1
    local service_type=$2
    local environment=$3
    local example_url=$4

    echo ""
    echo "🔧 Configuración de $secret_name ($service_type - $environment)"
    echo "📝 URL de ejemplo: $example_url"
    echo ""

    read -p "¿Quieres usar la URL de ejemplo? (y/n): " use_example

    if [ "$use_example" = "y" ] || [ "$use_example" = "Y" ]; then
        echo "$example_url" | gh secret set "$secret_name"
        echo "✅ Configurado con URL de ejemplo"
    else
        read -p "Ingresa la URL real de $service_type para $environment: " real_url
        if [ -n "$real_url" ]; then
            echo "$real_url" | gh secret set "$secret_name"
            echo "✅ Configurado con URL personalizada"
        else
            echo "⚠️  No se configuró ninguna URL"
        fi
    fi
}

echo "🐘 Configuración de PostgreSQL URLs"
echo "==================================="

set_service_url "DATABASE_URL_DEV" "PostgreSQL" "desarrollo" "postgresql://neondb_owner:xxxxxxxxxxxx@ep-cool-mode-a5m4r6zq.us-east-2.aws.neon.tech/neondb?sslmode=require"

set_service_url "DATABASE_URL_STAGING" "PostgreSQL" "staging" "postgresql://postgres.xxxxxxxxxxxxxx:xxxxxxxxxxxx@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

set_service_url "DATABASE_URL_PROD" "PostgreSQL" "producción" "postgresql://postgres:xxxxxxxxxxxx@containers-us-west-1.railway.app:5432/railway?sslmode=require"

echo ""
echo "🔴 Configuración de Redis URLs"
echo "=============================="

set_service_url "REDIS_URL_DEV" "Redis" "desarrollo" "redis://default:xxxxxxxxxxxx@usw1-famous-termite-12345.upstash.io:5432"

set_service_url "REDIS_URL_STAGING" "Redis" "staging" "redis://default:xxxxxxxxxxxx@usw1-cool-rabbit-12345.upstash.io:5432"

set_service_url "REDIS_URL_PROD" "Redis" "producción" "redis://h:xxxxxxxxxxxx@usw1-actual-termite-12345.ec2.cloud.redislabs.com:12345"

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "📋 Servicios recomendados:"
echo ""
echo "🐘 PostgreSQL:"
echo "  • Desarrollo: Neon (https://neon.tech) - Gratuito"
echo "  • Staging: Supabase (https://supabase.com) - Gratuito"
echo "  • Producción: Railway (https://railway.app) - $5/mes"
echo ""
echo "🔴 Redis:"
echo "  • Desarrollo: Upstash (https://upstash.com) - Gratuito"
echo "  • Staging: Upstash (https://upstash.com) - Gratuito"
echo "  • Producción: Redis Labs (https://redis.com) - $15/mes"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Crea cuentas en los servicios recomendados"
echo "2. Obtén las URLs de conexión reales"
echo "3. Ejecuta este script nuevamente para actualizar las URLs"
echo "4. Haz merge del PR para activar los despliegues"