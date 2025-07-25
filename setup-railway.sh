#!/bin/bash
# 🚀 Railway Setup Script for Security System

echo "🔧 Configurando Railway para sistema de seguridad integral..."

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no encontrado. Instalando..."
    npm install -g @railway/cli
fi

# Login a Railway (si no está logueado)
echo "🔑 Verificando autenticación Railway..."
railway whoami || railway login

# Crear nuevo proyecto Railway
echo "📦 Creando proyecto Railway..."
railway project create facturacion-autonomos-security

# Configurar variables de ambiente
echo "⚙️ Configurando variables de ambiente..."

# Variables de seguridad
railway variables set NODE_ENV=production
railway variables set NODE_VERSION=20
railway variables set ENABLE_CSP=true
railway variables set ENABLE_FRAME_GUARD=true
railway variables set ENABLE_METRICS=true
railway variables set ENABLE_SENTRY=true

# Variables de Next.js (se configuran automáticamente con Railway)
railway variables set NEXT_PUBLIC_APP_URL='${{RAILWAY_PUBLIC_DOMAIN}}'
railway variables set NEXT_PUBLIC_API_BASE_URL='${{RAILWAY_PUBLIC_DOMAIN}}/api'

# Variables de seguridad críticas (requieren configuración manual)
echo "🔐 Configurando variables de seguridad críticas..."
echo "Por favor, configura estas variables manualmente en Railway Dashboard:"
echo "  - JWT_SECRET: $(openssl rand -base64 32)"
echo "  - CSRF_SECRET: $(openssl rand -base64 32)" 
echo "  - SESSION_SECRET: $(openssl rand -base64 32)"
echo "  - SENTRY_DSN: tu-sentry-dsn-aqui"
echo "  - DATABASE_URL: se configurará automáticamente con PostgreSQL"

# Agregar PostgreSQL
echo "🗄️ Agregando base de datos PostgreSQL..."
railway add postgresql

# Desplegar aplicación
echo "🚀 Iniciando despliegue..."
railway up

echo "✅ Configuración Railway completada!"
echo "🌐 Tu aplicación estará disponible en: https://facturacion-autonomos-security.up.railway.app"
echo "📊 Dashboard de seguridad: https://facturacion-autonomos-security.up.railway.app/admin/security-dashboard"
