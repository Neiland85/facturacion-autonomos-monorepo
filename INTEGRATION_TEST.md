# 🚀 Prueba de Integración Completa

Este documento explica cómo probar la integración completa entre el frontend Next.js y el backend Invoice Service.

## 📋 Prerrequisitos

- Node.js 18+
- pnpm instalado globalmente (`npm install -g pnpm`)
- Puerto 3000 y 3002 disponibles

## 🛠️ Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar desde la raíz del proyecto
chmod +x setup-integration.sh
./setup-integration.sh
```

Este script:

- ✅ Instala todas las dependencias
- ✅ Compila todos los proyectos
- ✅ Crea scripts auxiliares
- ✅ Prepara el entorno de integración

### Opción 2: Manual

```bash
# 1. Instalar dependencias
pnpm install

# 2. Compilar backend
cd apps/invoice-service
pnpm build
cd ../..

# 3. Verificar frontend
cd apps/web
pnpm run type-check
cd ../..
```

## 🚀 Iniciando los Servicios

### Iniciar Todo de una vez

```bash
./start-all-services.sh
```

### Iniciar Manualmente (2 terminales)

**Terminal 1 - Backend:**

```bash
cd apps/invoice-service
pnpm dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/web
pnpm dev
```

## 🧪 Verificación de la Integración

### 1. Health Check del Backend

```bash
curl http://localhost:3002/health
```

### 2. Test Rápido de la API

```bash
./quick-test.sh
```

### 3. Verificar Frontend

Abre: http://localhost:3000

### 4. Swagger Documentation

Abre: http://localhost:3002/api-docs

## 🌍 URLs Importantes

| Servicio     | URL                            | Descripción            |
| ------------ | ------------------------------ | ---------------------- |
| Frontend     | http://localhost:3000          | Aplicación web Next.js |
| API Backend  | http://localhost:3002          | Servicio de facturas   |
| API Docs     | http://localhost:3002/api-docs | Documentación Swagger  |
| Health Check | http://localhost:3002/health   | Estado del servicio    |

## 📊 Funcionalidades a Probar

### En el Frontend (http://localhost:3000)

- [ ] Dashboard carga correctamente
- [ ] Estadísticas se muestran
- [ ] Lista de facturas recientes aparece
- [ ] No hay errores en la consola del navegador

### En la API (http://localhost:3002)

- [ ] Health check responde OK
- [ ] GET /api/invoices/stats funciona
- [ ] GET /api/invoices funciona
- [ ] POST /api/invoices acepta nuevas facturas
- [ ] Swagger está disponible

## 🔧 Troubleshooting

### Error: Puerto ya en uso

```bash
# Matar procesos en puerto 3000
lsof -ti:3000 | xargs kill -9

# Matar procesos en puerto 3002
lsof -ti:3002 | xargs kill -9
```

### Error: "Cannot connect to API"

1. Verificar que el backend está funcionando: `curl http://localhost:3002/health`
2. Verificar la configuración en `apps/web/.env.local`
3. Revisar logs del backend en la terminal

### Error de CORS

- Verificar que el backend permite `http://localhost:3000` en CORS
- Revisar configuración en `apps/invoice-service/.env`

## 📝 Estructura de la Integración

```
Frontend (Next.js) → API Client → Invoice Service (Express)
     ↓                    ↓              ↓
  Dashboard           HTTP Requests    Business Logic
  Components          Error Handling   Database Layer
  Types/Interfaces    Response Parsing PDF Generation
```

## 🎯 Flujo de Datos

1. **Frontend** hace petición HTTP a través del API Client
2. **API Client** formatea la petición y maneja errores
3. **Invoice Service** procesa la petición
4. **Business Logic** ejecuta la operación
5. **Database** almacena/recupera datos
6. **Response** vuelve al frontend formateada

## 🚦 Estados de la Integración

- 🟢 **Verde**: Todo funcionando correctamente
- 🟡 **Amarillo**: Advertencias menores (ver logs)
- 🔴 **Rojo**: Errores que impiden funcionamiento

## 📞 Testing de Endpoints

```bash
# Obtener estadísticas
curl http://localhost:3002/api/invoices/stats

# Listar facturas
curl http://localhost:3002/api/invoices

# Crear factura
curl -X POST http://localhost:3002/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"number":"TEST-001","series":"TEST","customer":{"name":"Test"},"items":[],"total":100}'
```

¡Listo para probar la integración completa! 🎉
