#!/bin/bash

set -e  # Exit on any error

echo "🚀 Iniciando prueba de integración completa del sistema de facturación..."
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del monorepo"
    exit 1
fi

echo "📂 Directorio: $(pwd)"

# 1. Instalar dependencias
echo -e "\n📦 Instalando dependencias..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo "❌ pnpm no está instalado. Instalando..."
    npm install -g pnpm
    pnpm install
fi

# 2. Compilar TypeScript
echo -e "\n🔨 Compilando proyectos..."

# Compilar invoice-service
cd apps/invoice-service
echo "  📊 Compilando servicio de facturas..."
pnpm build
cd ../..

# Compilar web
cd apps/web
echo "  🌐 Compilando frontend..."
pnpm run type-check
cd ../..

echo -e "\n✅ Compilación completada"

# 3. Crear archivos de prueba
echo -e "\n📝 Preparando archivos de prueba..."

# Script para iniciar servicios en paralelo
cat > start-all-services.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando todos los servicios..."

# Función para limpiar al salir
cleanup() {
    echo -e "\n🛑 Deteniendo servicios..."
    jobs -p | xargs -r kill
    exit 0
}
trap cleanup EXIT INT TERM

# Iniciar servicio de facturas
echo "📊 Iniciando servicio de facturas (puerto 3002)..."
cd apps/invoice-service
pnpm dev &
INVOICE_PID=$!
cd ../..

# Esperar a que el servicio inicie
echo "⏳ Esperando que el servicio de facturas se inicie..."
for i in {1..30}; do
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        echo "✅ Servicio de facturas funcionando"
        break
    fi
    sleep 1
    echo -n "."
done

# Iniciar frontend
echo -e "\n🌐 Iniciando frontend (puerto 3000)..."
cd apps/web
pnpm dev &
FRONTEND_PID=$!
cd ../..

echo -e "\n🎉 Servicios iniciados!"
echo "🌍 URLs disponibles:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:3002"
echo "  - Swagger: http://localhost:3002/api-docs"
echo "  - Health: http://localhost:3002/health"
echo -e "\nPresiona Ctrl+C para detener todos los servicios..."

# Esperar
wait
EOF

chmod +x start-all-services.sh

# Script de prueba rápida
cat > quick-test.sh << 'EOF'
#!/bin/bash

echo "🧪 Prueba rápida de la API..."

# Verificar que el servicio está funcionando
if ! curl -s http://localhost:3002/health > /dev/null; then
    echo "❌ El servicio no está funcionando en puerto 3002"
    echo "💡 Ejecuta: ./start-all-services.sh"
    exit 1
fi

echo "✅ Servicio funcionando"

# Probar endpoint de estadísticas
echo "📊 Probando estadísticas..."
curl -s http://localhost:3002/api/invoices/stats | jq . || echo "Respuesta recibida"

echo -e "\n✅ Prueba básica completada"
EOF

chmod +x quick-test.sh

echo -e "\n🎯 Scripts creados exitosamente:"
echo "  - ./start-all-services.sh  : Inicia todos los servicios"
echo "  - ./quick-test.sh          : Prueba rápida de la API"

echo -e "\n🚀 INSTRUCCIONES PARA PROBAR LA INTEGRACIÓN:"
echo "=================================================="
echo "1. Ejecuta: ./start-all-services.sh"
echo "2. Abre otra terminal y ejecuta: ./quick-test.sh"
echo "3. Abre el navegador en: http://localhost:3000"
echo "4. Verifica la documentación en: http://localhost:3002/api-docs"

echo -e "\n✨ ¡Todo listo para probar la integración completa!"
