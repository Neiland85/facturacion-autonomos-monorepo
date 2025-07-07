#!/bin/bash

# 🚀 Script para abrir el workspace aislado de Facturación Autónomos
# Este script abre VS Code con el workspace configurado específicamente para este proyecto

echo "🔧 Abriendo workspace aislado de Facturación Autónomos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "facturacion-autonomos-monorepo.code-workspace" ]; then
    echo "❌ Error: No se encontró el archivo de workspace"
    echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Abrir VS Code con el workspace
if command -v code &> /dev/null; then
    echo "✅ Abriendo VS Code con workspace aislado..."
    code facturacion-autonomos-monorepo.code-workspace
    echo "🎉 ¡Workspace abierto exitosamente!"
    echo ""
    echo "📋 Extensiones recomendadas que se instalarán automáticamente:"
    echo "   • GitHub Copilot & Copilot Chat"
    echo "   • TypeScript & JavaScript"
    echo "   • Tailwind CSS IntelliSense"
    echo "   • Prisma"
    echo "   • ESLint & Prettier"
    echo "   • Jest & Playwright"
    echo ""
    echo "🎯 Tareas disponibles en el panel de comandos (Cmd+Shift+P):"
    echo "   • Tasks: Run Task > 🚀 Desarrollo - Todos los servicios"
    echo "   • Tasks: Run Task > 🏗️ Build - Todo el monorepo"
    echo "   • Tasks: Run Task > 🧪 Tests - Todo el monorepo"
    echo ""
    echo "💡 Este workspace está aislado y no afectará tu configuración global de VS Code"
else
    echo "❌ Error: VS Code no está instalado o no está en el PATH"
    echo "   Instala VS Code desde: https://code.visualstudio.com/"
    exit 1
fi
