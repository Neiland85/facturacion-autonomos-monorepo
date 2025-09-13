#!/bin/bash

echo "🔧 CONFIGURACIÓN DE CREDENCIALES VERCEL"
echo "======================================="
echo ""

# Verificar si las variables están configuradas
check_env_vars() {
    local missing_vars=()

    if [ -z "$VERCEL_TOKEN" ]; then
        missing_vars+=("VERCEL_TOKEN")
    fi

    if [ -z "$VERCEL_ORG_ID" ]; then
        missing_vars+=("VERCEL_ORG_ID")
    fi

    if [ -z "$VERCEL_PROJECT_ID" ]; then
        missing_vars+=("VERCEL_PROJECT_ID")
    fi

    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "✅ Todas las variables de entorno de Vercel están configuradas"
        return 0
    else
        echo "❌ Faltan las siguientes variables de entorno:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
        return 1
    fi
}

# Mostrar instrucciones para obtener credenciales
show_instructions() {
    echo ""
    echo "📋 INSTRUCCIONES PARA OBTENER LAS CREDENCIALES:"
    echo ""
    echo "1️⃣ VERCEL_TOKEN:"
    echo "   • Ve a: https://vercel.com/account/tokens"
    echo "   • Crea un token llamado 'facturacion-autonomos'"
    echo "   • Copia el token generado"
    echo ""
    echo "2️⃣ VERCEL_ORG_ID:"
    echo "   • Ve a: https://vercel.com/dashboard"
    echo "   • Selecciona tu organización"
    echo "   • El ID estará en la URL: vercel.com/dashboard/[ORG_ID]"
    echo ""
    echo "3️⃣ VERCEL_PROJECT_ID:"
    echo "   • Crea un proyecto en Vercel llamado 'facturacion-autonomos-monorepo'"
    echo "   • O usa un proyecto existente"
    echo "   • El Project ID se encuentra en Settings > General"
    echo ""
}

# Configurar variables de entorno
setup_env_vars() {
    echo ""
    echo "🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO:"
    echo ""

    read -p "Ingresa tu VERCEL_TOKEN: " vercel_token
    read -p "Ingresa tu VERCEL_ORG_ID: " vercel_org_id
    read -p "Ingresa tu VERCEL_PROJECT_ID: " vercel_project_id

    export VERCEL_TOKEN="$vercel_token"
    export VERCEL_ORG_ID="$vercel_org_id"
    export VERCEL_PROJECT_ID="$vercel_project_id"

    echo ""
    echo "✅ Variables de entorno configuradas:"
    echo "   VERCEL_TOKEN: ${VERCEL_TOKEN:0:10}..."
    echo "   VERCEL_ORG_ID: $VERCEL_ORG_ID"
    echo "   VERCEL_PROJECT_ID: $VERCELEL_PROJECT_ID"
}

# Función principal
main() {
    echo "🔍 Verificando configuración actual..."
    echo ""

    # Verificar si ya están configuradas
    if check_env_vars; then
        echo ""
        echo "🚀 Procediendo con el despliegue..."
        echo "Ejecutando: vercel --prod --yes"
        vercel --prod --yes
        return
    fi

    # Mostrar instrucciones
    show_instructions

    # Preguntar si quiere configurar ahora
    echo ""
    read -p "¿Quieres configurar las variables de entorno ahora? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_env_vars

        # Verificar nuevamente
        if check_env_vars; then
            echo ""
            echo "🚀 ¡Excelente! Procediendo con el despliegue..."
            echo "Ejecutando: vercel --prod --yes"
            vercel --prod --yes
        else
            echo "❌ Error en la configuración. Inténtalo de nuevo."
            exit 1
        fi
    else
        echo "ℹ️  Para configurar manualmente, ejecuta:"
        echo "   export VERCEL_TOKEN='tu_token'"
        echo "   export VERCEL_ORG_ID='tu_org_id'"
        echo "   export VERCEL_PROJECT_ID='tu_project_id'"
        echo ""
        echo "Luego ejecuta: vercel --prod --yes"
        exit 0
    fi
}

# Ejecutar función principal
main
