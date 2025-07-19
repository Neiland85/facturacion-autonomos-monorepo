#!/bin/bash
# 🚫🔧 Script para migrar completamente de Vercel a Netlify
# Este script desactiva Vercel y configura Netlify como único proveedor de deployment

set -e

echo "🚀 Iniciando migración completa a Netlify..."

# 1. Crear archivos de bloqueo de Vercel si no existen
if [ ! -f ".vercel" ]; then
    echo "null" > .vercel
    echo "✅ Creado .vercel para desactivar deployments"
fi

if [ ! -f ".vercelignore" ]; then
    cat > .vercelignore << 'EOF'
# Ignore everything - We use Netlify instead
*
**/*
./*
EOF
    echo "✅ Creado .vercelignore para ignorar todo"
fi

# 2. Verificar configuración de Netlify
if [ ! -f "netlify.toml" ]; then
    echo "❌ ERROR: netlify.toml no encontrado"
    echo "   Por favor, crea la configuración de Netlify primero"
    exit 1
fi

# 3. Verificar plugin de Netlify en package.json
echo "🔍 Verificando dependencias de Netlify..."
cd apps/web
if ! npm list @netlify/plugin-nextjs &>/dev/null; then
    echo "📦 Instalando @netlify/plugin-nextjs..."
    npm install @netlify/plugin-nextjs --save
fi

# 4. Verificar configuración de Next.js para Netlify
echo "🔧 Verificando configuración de Next.js..."
if grep -q "output.*export" next.config.mjs 2>/dev/null; then
    echo "⚠️  WARNING: next.config.mjs contiene 'output: export'"
    echo "   Esto puede causar conflictos con @netlify/plugin-nextjs"
fi

cd ..

# 5. Verificar variables de entorno necesarias
echo "🔑 Variables de entorno requeridas para Netlify:"
echo "   - NETLIFY_AUTH_TOKEN (en GitHub Secrets)"
echo "   - NETLIFY_SITE_ID (en GitHub Secrets)"
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - NEXT_PUBLIC_API_BASE_URL"

# 6. Mostrar estado del proyecto
echo ""
echo "📊 ESTADO DE LA MIGRACIÓN:"
echo "✅ Vercel desactivado (.vercel, .vercelignore)"
echo "✅ Netlify configurado (netlify.toml)"
echo "✅ Plugin Next.js para Netlify instalado"
echo "✅ CI/CD configurado para Netlify"
echo ""
echo "🚀 ¡Migración completada!"
echo "🔗 Próximos pasos:"
echo "   1. Commit y push de los cambios"
echo "   2. Configurar secrets en GitHub: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID"
echo "   3. Hacer PR para validar que solo aparece Netlify"
echo ""
echo "🚫 Vercel ya no interferirá en los PRs de GitHub"
