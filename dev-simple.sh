#!/bin/bash

# 🚀 Script de desarrollo alternativo para cuando Netlify CLI falla

echo "🎯 Iniciando servidor de desarrollo local..."

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🧹 Limpiando procesos..."
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

# Verificar que estamos en el directorio correcto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: No se encontró netlify.toml. Ejecuta desde la raíz del proyecto."
    exit 1
fi

echo "📦 Configuración detectada:"
echo "  📂 Workspace: @facturacion/web"
echo "  🌐 URL: http://localhost:3000"
echo "  🎯 Modo: Desarrollo estándar Next.js"

echo ""
echo "🚀 Iniciando Next.js..."
echo "📍 Abre tu navegador en: http://localhost:3000"
echo "🔄 Presiona Ctrl+C para detener"
echo ""

# Ejecutar el comando de desarrollo
cd apps/web && yarn dev

echo "✅ Servidor detenido."
