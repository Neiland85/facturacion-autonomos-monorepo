#!/bin/bash

# 🚀 GUÍA DE TROUBLESHOOTING NETLIFY DEV

echo "🎯 GUÍA DE SOLUCIÓN PARA NETLIFY DEV"
echo "======================================"
echo ""

echo "📋 DIAGNÓSTICO AUTOMÁTICO:"
echo ""

# 1. Verificar Netlify CLI
echo "1️⃣ Verificando Netlify CLI..."
if command -v netlify &> /dev/null; then
    echo "   ✅ Netlify CLI instalado: $(netlify --version)"
else
    echo "   ❌ Netlify CLI no encontrado"
    echo "   💡 Instalar con: npm install -g netlify-cli"
    exit 1
fi

# 2. Verificar archivos de configuración
echo ""
echo "2️⃣ Verificando configuración..."
if [ -f "netlify.toml" ]; then
    echo "   ✅ netlify.toml encontrado"
else
    echo "   ❌ netlify.toml no encontrado"
    exit 1
fi

if [ -d "apps/web" ]; then
    echo "   ✅ Directorio apps/web existe"
else
    echo "   ❌ Directorio apps/web no encontrado"
    exit 1
fi

# 3. Verificar package.json
echo ""
echo "3️⃣ Verificando package.json del workspace..."
if [ -f "apps/web/package.json" ]; then
    echo "   ✅ apps/web/package.json encontrado"
    if grep -q '"dev"' apps/web/package.json; then
        echo "   ✅ Script 'dev' encontrado en package.json"
    else
        echo "   ❌ Script 'dev' no encontrado en package.json"
    fi
else
    echo "   ❌ apps/web/package.json no encontrado"
fi

# 4. Verificar puertos
echo ""
echo "4️⃣ Verificando puertos..."
if lsof -i :3000 &> /dev/null; then
    echo "   ⚠️  Puerto 3000 ocupado:"
    lsof -i :3000
    echo "   💡 Mata el proceso con: pkill -f 'next dev'"
else
    echo "   ✅ Puerto 3000 disponible"
fi

if lsof -i :8888 &> /dev/null; then
    echo "   ⚠️  Puerto 8888 ocupado:"
    lsof -i :8888
    echo "   💡 Mata el proceso con: pkill -f 'netlify'"
else
    echo "   ✅ Puerto 8888 disponible"
fi

echo ""
echo "🚀 OPCIONES PARA EJECUTAR:"
echo "========================="
echo ""
echo "OPCIÓN 1 - Netlify Dev Básico:"
echo "  cd apps/web"
echo "  netlify dev"
echo ""
echo "OPCIÓN 2 - Netlify Dev con parámetros:"
echo "  netlify dev --dir apps/web --port 8888"
echo ""
echo "OPCIÓN 3 - Next.js directo (sin Netlify):"
echo "  ./dev-simple.sh"
echo ""
echo "OPCIÓN 4 - Yarn workspace:"
echo "  yarn workspace @facturacion/web dev"
echo ""
echo "💡 TIPS:"
echo "- Si falla Netlify, usa OPCIÓN 3 o 4"
echo "- Netlify dev simula el entorno de producción"
echo "- Next.js directo es más rápido para desarrollo"
echo ""
