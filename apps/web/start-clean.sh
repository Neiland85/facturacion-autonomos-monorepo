#!/bin/bash

# 🚀 Script para ejecutar yarn dev sin interferencias de VS Code

echo "🎯 Iniciando Next.js sin debugger VS Code..."

# Desactivar debugger de VS Code
unset NODE_OPTIONS
unset VSCODE_INJECT_NODE_MODULE_LOOKUP_PATH

# Limpiar variables de entorno que pueden interferir
unset AUTO_ATTACH
unset VSCODE_INSPECTOR_OPTIONS

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta desde apps/web/"
    exit 1
fi

echo "📦 Configuración:"
echo "  📂 Directory: $(pwd)"
echo "  🌐 URL: http://localhost:3000"
echo "  🔧 Node: $(node --version)"
echo "  📦 Yarn: $(yarn --version)"

echo ""
echo "🚀 Iniciando servidor..."
echo "📍 Abre tu navegador en: http://localhost:3000"
echo "🔄 Presiona Ctrl+C para detener"
echo ""

# Ejecutar yarn dev con entorno limpio
exec yarn dev
