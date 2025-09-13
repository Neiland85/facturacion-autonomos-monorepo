#!/bin/bash

echo "🚀 GUIA DE DESPLIEGUE A VERCEL - PASO A PASO"
echo "============================================"
echo ""

echo "📋 PASO 1: OBTENER CREDENCIALES DE VERCEL"
echo "------------------------------------------"
echo "Ve a https://vercel.com/dashboard/integrations y obtén:"
echo "• VERCEL_TOKEN: Token de autenticación"
echo "• VERCEL_ORG_ID: ID de tu organización"
echo "• VERCEL_PROJECT_ID: ID del proyecto (crea uno nuevo si no existe)"
echo ""

echo "📋 PASO 2: CONFIGURAR VARIABLES DE ENTORNO"
echo "-------------------------------------------"
echo "Ejecuta estos comandos con tus credenciales reales:"
echo ""
echo "export VERCEL_TOKEN='tu_token_aqui'"
echo "export VERCEL_ORG_ID='tu_org_id_aqui'"
echo "export VERCEL_PROJECT_ID='tu_project_id_aqui'"
echo ""

echo "📋 PASO 3: VINCULAR PROYECTO (si no está vinculado)"
echo "--------------------------------------------------"
echo "vercel link"
echo ""

echo "📋 PASO 4: DESPLEGAR"
echo "---------------------"
echo "vercel --prod --yes"
echo ""

echo "📋 PASO 5: VERIFICAR DESPLIEGUE"
echo "--------------------------------"
echo "• Visita la URL proporcionada por Vercel"
echo "• Verifica que el frontend cargue"
echo "• Prueba las rutas de API:"
echo "  - GET /api/health"
echo "  - POST /auth/login"
echo "  - GET /api/facturas"
echo ""

echo "⚠️  IMPORTANTE:"
echo "• Asegúrate de que las variables de entorno estén configuradas"
echo "• El proyecto se desplegará como monorepo con múltiples servicios"
echo "• Las rutas de API estarán disponibles según la configuración"
echo ""

echo "🔧 VARIABLES DE ENTORNO ADICIONALES RECOMENDADAS:"
echo "• DATABASE_URL: URL de conexión a PostgreSQL"
echo "• JWT_ACCESS_SECRET: Secreto para tokens de acceso"
echo "• JWT_REFRESH_SECRET: Secreto para tokens de refresh"
echo "• REDIS_URL: URL de conexión a Redis (si usas Redis)"
echo ""

read -p "¿Has configurado las variables de entorno? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "¡Perfecto! Procediendo con el despliegue..."
    echo "Ejecutando: vercel --prod --yes"
    vercel --prod --yes
else
    echo "Por favor configura las variables de entorno primero."
    echo "Ejecuta este script nuevamente cuando estén listas."
fi
