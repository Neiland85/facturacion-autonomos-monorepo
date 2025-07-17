#!/bin/bash

# Script para probar la integración completa del sistema de facturación
echo "🚀 Iniciando prueba de integración completa..."

# Navegar al directorio raíz del proyecto
cd "$(dirname "$0")"

# Verificar que estamos en el directorio correcto
echo "📂 Directorio actual: $(pwd)"

# Verificar pnpm
echo "🔧 Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado"
    exit 1
fi

echo "✅ pnpm versión: $(pnpm --version)"

# Instalar dependencias si es necesario
echo "📦 Instalando dependencias..."
pnpm install

# Compilar TypeScript en el servicio de facturas
echo "🔨 Compilando servicio de facturas..."
cd apps/invoice-service
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Error compilando servicio de facturas"
    exit 1
fi

# Volver al directorio raíz
cd ../..

# Compilar el frontend
echo "🔨 Compilando frontend..."
cd apps/web
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Error compilando frontend"
    exit 1
fi

# Volver al directorio raíz
cd ../..

echo "✅ Compilación completada exitosamente!"

# Crear script para iniciar servicios
echo "📝 Creando script de inicio de servicios..."
cat > start-services.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando servicios para integración..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    pkill -f "pnpm dev"
    exit 0
}

trap cleanup EXIT

# Iniciar servicio de facturas en background
echo "📊 Iniciando servicio de facturas en puerto 3002..."
cd apps/invoice-service
pnpm dev &
INVOICE_PID=$!

# Esperar un poco para que el servicio se inicie
sleep 5

# Verificar que el servicio está corriendo
if kill -0 $INVOICE_PID 2>/dev/null; then
    echo "✅ Servicio de facturas iniciado (PID: $INVOICE_PID)"
else
    echo "❌ Error iniciando servicio de facturas"
    exit 1
fi

# Volver al directorio raíz
cd ../..

# Iniciar frontend
echo "🌐 Iniciando frontend en puerto 3000..."
cd apps/web
pnpm dev &
FRONTEND_PID=$!

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Servicios iniciados exitosamente!"
echo "📊 Servicio de facturas: http://localhost:3002"
echo "🌐 Frontend: http://localhost:3000"
echo "📚 Swagger API: http://localhost:3002/api-docs"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios..."

# Esperar indefinidamente
wait
EOF

chmod +x start-services.sh

echo ""
echo "✅ Script de integración completado!"
echo "🚀 Para iniciar los servicios ejecuta: ./start-services.sh"
echo "🧪 Para probar la API ejecuta: cd apps/invoice-service && pnpm test:service"
