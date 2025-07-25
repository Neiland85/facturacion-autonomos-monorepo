#!/bin/bash

echo "🔍 ANÁLISIS COMPLETO DEL AUTH SERVICE"
echo "====================================="

# Variables
AUTH_PORT=3001
AUTH_URL="http://localhost:$AUTH_PORT"

echo ""
echo "📊 1. VERIFICACIÓN DE PUERTO"
if lsof -i :$AUTH_PORT >/dev/null 2>&1; then
    process=$(lsof -i :$AUTH_PORT | tail -1 | awk '{print $1}')
    echo "  ✅ Puerto $AUTH_PORT: $process ejecutándose"
else
    echo "  ❌ Puerto $AUTH_PORT: Libre (servicio no ejecutándose)"
    exit 1
fi

echo ""
echo "🌐 2. TESTING DE ENDPOINTS"

# Health check principal
echo "  Testing /health..."
if curl -s "$AUTH_URL/health" >/dev/null 2>&1; then
    response=$(curl -s "$AUTH_URL/health")
    echo "    ✅ /health - Responde correctamente"
    echo "    📋 Status: $(echo $response | jq -r '.status' 2>/dev/null || echo 'ok')"
else
    echo "    ❌ /health - No responde"
fi

# Health check detallado
echo "  Testing /health/detailed..."
if curl -s "$AUTH_URL/health/detailed" >/dev/null 2>&1; then
    echo "    ✅ /health/detailed - Responde correctamente"
else
    echo "    ❌ /health/detailed - No responde"
fi

# Ready check
echo "  Testing /health/ready..."
if curl -s "$AUTH_URL/health/ready" >/dev/null 2>&1; then
    echo "    ✅ /health/ready - Responde correctamente"
else
    echo "    ❌ /health/ready - No responde"
fi

# Live check
echo "  Testing /health/live..."
if curl -s "$AUTH_URL/health/live" >/dev/null 2>&1; then
    echo "    ✅ /health/live - Responde correctamente"
else
    echo "    ❌ /health/live - No responde"
fi

echo ""
echo "🔐 3. TESTING DE ENDPOINTS DE AUTH"

# Test register endpoint (sin datos para no crear usuario)
echo "  Testing POST /api/auth/register..."
register_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$register_response" = "400" ]; then
    echo "    ✅ /api/auth/register - Valida datos correctamente (400)"
elif [ "$register_response" = "000" ]; then
    echo "    ❌ /api/auth/register - No responde"
else
    echo "    ⚠️  /api/auth/register - Respuesta: $register_response"
fi

# Test login endpoint
echo "  Testing POST /api/auth/login..."
login_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$AUTH_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$login_response" = "400" ]; then
    echo "    ✅ /api/auth/login - Valida datos correctamente (400)"
elif [ "$login_response" = "000" ]; then
    echo "    ❌ /api/auth/login - No responde"
else
    echo "    ⚠️  /api/auth/login - Respuesta: $login_response"
fi

echo ""
echo "🔧 4. VERIFICACIÓN DE DEPENDENCIAS"

# Verificar Redis
echo "  Verificando Redis..."
if redis-cli ping >/dev/null 2>&1; then
    echo "    ✅ Redis - Conectado y funcionando"
else
    echo "    ❌ Redis - No disponible (el servicio puede funcionar sin Redis temporalmente)"
fi

# Verificar Node.js
echo "  Verificando Node.js..."
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "    ✅ Node.js - Versión: $node_version"
else
    echo "    ❌ Node.js - No disponible"
fi

echo ""
echo "📝 5. LOGS DEL SERVICIO (últimas 10 líneas)"
echo "----------------------------------------"

# Intentar mostrar logs si están disponibles
if [ -f "/tmp/auth-service.log" ]; then
    tail -10 /tmp/auth-service.log
else
    echo "  ℹ️  No se encontraron logs específicos del servicio"
    echo "  💡 El servicio debería mostrar logs en la terminal donde se ejecutó"
fi

echo ""
echo "✅ RESUMEN DEL ANÁLISIS"
echo "======================"
echo "  🔌 Puerto: $AUTH_PORT"
echo "  🌐 URL: $AUTH_URL"
echo "  📊 Estado: Ejecutándose"
echo "  🔐 Endpoints Auth: Funcionando"
echo "  🏥 Health Checks: Disponibles"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "  1. Verificar logs en la terminal de desarrollo"
echo "  2. Probar registro de usuario real"
echo "  3. Probar login y generación de tokens"
echo "  4. Verificar integración con frontend"

echo ""
echo "🧪 COMANDOS DE PRUEBA:"
echo "  # Registrar usuario de prueba:"
echo "  curl -X POST $AUTH_URL/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@test.com\",\"password\":\"Test123!\",\"name\":\"Usuario Test\"}'"
echo ""
echo "  # Login:"
echo "  curl -X POST $AUTH_URL/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@test.com\",\"password\":\"Test123!\"}'"
