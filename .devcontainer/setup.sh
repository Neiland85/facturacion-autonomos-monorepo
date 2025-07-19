#!/bin/bash
# 🚀 Script de configuración inicial para el entorno de desarrollo
# Este script se ejecuta automáticamente después de crear el devcontainer

set -e  # Salir inmediatamente si un comando falla

echo "🔧 Iniciando configuración del entorno de desarrollo..."

# Configurar Node.js 20 usando NVM
echo "📦 Configurando Node.js 20..."
export NVM_DIR=/usr/local/share/nvm
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
    echo "✅ Node.js $(node --version) configurado correctamente"
else
    echo "ℹ️  NVM no encontrado, usando Node.js del sistema: $(node --version)"
fi

# Instalar PNPM globalmente
echo "📦 Instalando PNPM..."
npm install -g pnpm@latest
echo "✅ PNPM $(pnpm --version) instalado correctamente"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en el directorio actual"
    exit 1
fi

# Instalar dependencias del monorepo
echo "📦 Instalando dependencias del monorepo..."
pnpm install

# Generar tipos de Prisma si existe schema
echo "🗄️ Generando esquemas de Prisma..."
if [ -f "packages/database/prisma/schema.prisma" ] || [ -f "apps/api-facturas/prisma/schema.prisma" ]; then
    pnpm db:generate || echo "⚠️  Error al generar Prisma schemas (normal si no hay DB configurada)"
fi

# Compilar el proyecto
echo "🏗️ Compilando el proyecto..."
pnpm build || echo "⚠️  Error en build (normal en primera configuración)"

# Configurar Git hooks si existe husky
if [ -f ".husky/pre-commit" ]; then
    echo "🪝 Configurando Git hooks..."
    pnpm prepare || echo "⚠️  No se pudieron configurar Git hooks"
fi

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo ""
echo "📋 Comandos útiles disponibles:"
echo "  pnpm dev          - Iniciar todos los servicios en modo desarrollo"
echo "  pnpm build        - Compilar todo el monorepo"
echo "  pnpm test         - Ejecutar todos los tests"
echo "  pnpm lint         - Ejecutar linting"
echo "  pnpm db:studio    - Abrir Prisma Studio"
echo ""
echo "🌐 Puertos expuestos:"
echo "  - 3000: Frontend Web"
echo "  - 3001: API Gateway"
echo "  - 3002: Invoice Service"
echo "  - 3003: Auth Service"
echo "  - 3004: Tax Calculator API"
echo "  - 5432: PostgreSQL Database"
echo ""
echo "🚀 ¡El entorno está listo para desarrollar!"
