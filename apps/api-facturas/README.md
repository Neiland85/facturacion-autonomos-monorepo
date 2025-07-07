# 🧾 API de Facturas - Sistema de Facturación para Autónomos

API RESTful completa para la gestión de facturas, clientes y reportes fiscales, construida con Node.js, Express, TypeScript y Prisma.

## 🚀 Características Principales

### 📋 Gestión de Facturas
- ✅ Crear, leer, actualizar y eliminar facturas
- ✅ Facturas emitidas y recibidas
- ✅ Cálculo automático de impuestos (IVA, IRPF)
- ✅ Generación de números de factura automática
- ✅ Estados de factura (borrador, enviada, pagada, anulada)
- ✅ Líneas de detalle con productos/servicios
- ✅ Generación de PDF
- ✅ Envío por email

### 👥 Gestión de Clientes
- ✅ CRUD completo de clientes
- ✅ Validación de NIF/CIF
- ✅ Historial de facturas por cliente
- ✅ Búsqueda y filtrado avanzado

### 💰 Cálculos Fiscales
- ✅ Cálculo automático de IVA (0%, 4%, 10%, 21%)
- ✅ Cálculo de IRPF
- ✅ Validación de datos fiscales
- ✅ Tipos de IVA vigentes

### 📊 Reportes y Analytics
- ✅ Reportes trimestrales
- ✅ Reportes anuales
- ✅ Reportes de ventas y gastos
- ✅ Exportación a PDF, Excel, CSV

### 🔗 Integración AEAT/SII
- ✅ Preparado para integración con SII
- ✅ Validación de facturas
- ✅ Envío automático a Hacienda

### 🛡️ Seguridad y Rendimiento
- ✅ Autenticación JWT
- ✅ Rate limiting
- ✅ Validación de datos con Joi
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado
- ✅ Logging estructurado

### 📚 Documentación
- ✅ OpenAPI 3.0 completa
- ✅ Swagger UI interactivo
- ✅ Ejemplos de uso
- ✅ Validación de esquemas

## 🏗️ Arquitectura

```
src/
├── controllers/          # Controladores de la API
│   ├── facturas.ts      # Gestión de facturas
│   ├── clientes.ts      # Gestión de clientes
│   ├── fiscal.ts        # Cálculos fiscales
│   └── reportes.ts      # Generación de reportes
├── routes/              # Definición de rutas
│   ├── facturas.ts      # Rutas de facturas
│   ├── clientes.ts      # Rutas de clientes
│   ├── fiscal.ts        # Rutas fiscales
│   └── reportes.ts      # Rutas de reportes
├── middleware/          # Middleware personalizado
│   └── validation.ts    # Validación de datos
├── utils/               # Utilidades
│   └── fiscal.ts        # Funciones fiscales
├── types/               # Tipos TypeScript
└── index.ts             # Punto de entrada
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- Yarn (recomendado)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd facturacion-autonomos-monorepo/apps/api-facturas
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Cargar datos de ejemplo
npx prisma db seed
```

5. **Iniciar servidor de desarrollo**
```bash
yarn dev
```

La API estará disponible en `http://localhost:3001`

## 📚 Documentación de la API

### Acceso a la documentación
- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI YAML**: `http://localhost:3001/api/openapi.yaml`
- **OpenAPI JSON**: `http://localhost:3001/api/openapi.json`

### Endpoints Principales

#### 🧾 Facturas
```
GET    /api/v1/facturas              # Listar facturas
POST   /api/v1/facturas              # Crear factura
GET    /api/v1/facturas/{id}         # Obtener factura
PUT    /api/v1/facturas/{id}         # Actualizar factura
DELETE /api/v1/facturas/{id}         # Eliminar factura
GET    /api/v1/facturas/{id}/pdf     # Generar PDF
POST   /api/v1/facturas/{id}/enviar  # Enviar factura
```

#### 👥 Clientes
```
GET    /api/v1/clientes              # Listar clientes
POST   /api/v1/clientes              # Crear cliente
GET    /api/v1/clientes/{id}         # Obtener cliente
PUT    /api/v1/clientes/{id}         # Actualizar cliente
DELETE /api/v1/clientes/{id}         # Eliminar cliente
```

#### 💰 Fiscal
```
POST   /api/v1/fiscal/calcular       # Calcular impuestos
GET    /api/v1/fiscal/tipos-iva      # Obtener tipos de IVA
POST   /api/v1/fiscal/validar-nif    # Validar NIF/CIF
```

#### 📊 Reportes
```
GET    /api/v1/reportes/trimestral   # Reporte trimestral
GET    /api/v1/reportes/anual        # Reporte anual
GET    /api/v1/reportes/ventas       # Reporte de ventas
GET    /api/v1/reportes/gastos       # Reporte de gastos
POST   /api/v1/reportes/exportar/{formato} # Exportar reporte
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `DATABASE_URL` | URL de PostgreSQL | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | `http://localhost:3000` |

### Base de Datos

La API utiliza PostgreSQL con Prisma como ORM. El esquema incluye:

- **Usuarios y empresas**: Gestión multiempresa
- **Facturas y líneas**: Facturación completa
- **Clientes**: Gestión de contactos
- **Productos**: Catálogo de productos/servicios
- **Gastos**: Registro de gastos deducibles
- **Configuración**: Ajustes por empresa

## 🧪 Testing

```bash
# Ejecutar tests
yarn test

# Tests en modo watch
yarn test:watch

# Coverage
yarn test:coverage
```

## 🚀 Despliegue

### Desarrollo
```bash
yarn dev
```

### Producción
```bash
# Build
yarn build

# Iniciar
yarn start
```

### Docker
```bash
# Build imagen
docker build -t api-facturas .

# Ejecutar contenedor
docker run -p 3001:3001 api-facturas
```

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `yarn dev` | Inicia el servidor en modo desarrollo |
| `yarn build` | Compila TypeScript para producción |
| `yarn start` | Inicia el servidor compilado |
| `yarn test` | Ejecuta los tests |
| `yarn lint` | Ejecuta el linter |
| `yarn lint:fix` | Arregla errores de linting automáticamente |
| `yarn type-check` | Verifica tipos TypeScript |

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación:

```bash
# Header requerido
Authorization: Bearer <tu-jwt-token>

# O API Key
X-API-Key: <tu-api-key>
```

## 📝 Ejemplos de Uso

### Crear una factura
```javascript
const factura = await fetch('/api/v1/facturas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    fecha: '2024-01-15',
    clienteId: 'uuid-del-cliente',
    tipo: 'emitida',
    concepto: 'Servicios de consultoría',
    baseImponible: 100.00,
    tipoIVA: 21,
    lineas: [
      {
        descripcion: 'Consultoría tecnológica',
        cantidad: 10,
        precioUnitario: 10.00
      }
    ]
  })
});
```

### Calcular impuestos
```javascript
const calculo = await fetch('/api/v1/fiscal/calcular', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    baseImponible: 100.00,
    tipoIVA: 21,
    tipoIRPF: 15
  })
});
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- **Documentación**: [API Docs](http://localhost:3001/api-docs)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/facturacion-autonomos/issues)
- **Email**: dev@facturacion-autonomos.com

## 🚗 Roadmap

- [ ] Integración completa con AEAT SII
- [ ] Generación avanzada de PDFs
- [ ] Sistema de notificaciones
- [ ] Dashboard analytics
- [ ] App móvil
- [ ] Integración con bancos
- [ ] Facturación electrónica
- [ ] Múltiples idiomas
