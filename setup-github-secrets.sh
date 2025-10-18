#!/bin/bash

echo "🔐 Configuración de Secrets en GitHub Actions para Vercel"
echo "========================================================"
echo ""

# Verificar que GitHub CLI esté instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado. Instálalo con:"
    echo "brew install gh  # macOS"
    echo "winget install --id GitHub.cli  # Windows"
    echo "sudo apt install gh  # Ubuntu/Debian"
    exit 1
fi

# Verificar que estamos autenticados
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado en GitHub CLI. Ejecuta:"
    echo "gh auth login"
    exit 1
fi

echo "✅ GitHub CLI está configurado"

# Credenciales de Vercel (deben coincidir con .env por entorno)
VERCEL_TOKEN="8MaMflyLy6c8A7prEMRKv5BY"
VERCEL_PROJECT_ID="prj_asVGzmIka4hgkSsLIDcEHEZ5syLw"
VERCEL_ORG_ID="ciSmJvy2ITmzaape3bWxMkcw"

echo ""
echo "🔧 Configurando secrets en GitHub Actions..."

# Función para configurar secret
set_github_secret() {
    local secret_name=$1
    local secret_value=$2

    echo "Configurando $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name"
}

# Configurar secrets base de Vercel
echo "🚀 Configurando secrets base de Vercel..."
set_github_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
set_github_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID"
set_github_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID"

# Configurar placeholders para variables de entorno específicas
echo ""
echo "📝 Configurando placeholders para variables de entorno..."
echo "⚠️  IMPORTANTE: Estas son variables de EJEMPLO."
echo "   Debes actualizarlas con valores reales en el dashboard de GitHub."

# Variables de producción (requieren configuración manual)
set_github_secret "DATABASE_URL_PROD" "postgresql://prod_user:prod_pass@prod_host:5432/prod_db?sslmode=require"
set_github_secret "JWT_SECRET_PROD" "tu_jwt_secret_produccion_muy_seguro_min_32_caracteres"
set_github_secret "REDIS_URL_PROD" "redis://prod_user:prod_pass@prod_host:port/prod_db"

# Variables de staging (requieren configuración manual)
set_github_secret "DATABASE_URL_STAGING" "postgresql://staging_user:staging_pass@staging_host:5432/staging_db?sslmode=require"
set_github_secret "JWT_SECRET_STAGING" "tu_jwt_secret_staging_seguro_min_32_caracteres"
set_github_secret "REDIS_URL_STAGING" "redis://staging_user:staging_pass@staging_host:port/staging_db"

# Variables de desarrollo (requieren configuración manual)
set_github_secret "DATABASE_URL_DEV" "postgresql://dev_user:dev_pass@dev_host:5432/dev_db"
set_github_secret "JWT_SECRET_DEV" "tu_jwt_secret_desarrollo_seguro_min_32_caracteres"
set_github_secret "REDIS_URL_DEV" "redis://dev_user:dev_pass@dev_host:port/dev_db"

echo ""
echo "✅ Secrets configurados exitosamente!"
echo ""
echo "📋 Verificación:"
echo "Ve a https://github.com/Neiland85/facturacion-autonomos-monorepo/settings/secrets/actions"
echo "y verifica que las siguientes secrets estén configuradas:"
echo "  • VERCEL_TOKEN"
echo "  • VERCEL_PROJECT_ID"
echo "  • VERCEL_ORG_ID"
echo ""
echo "🎉 ¡Configuración completada!"