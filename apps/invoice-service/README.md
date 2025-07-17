# Invoice Service - Microservicio de Facturación

## Descripción

Microservicio especializado en la gestión completa de facturas para autónomos, incluyendo creación, validación, PDF generation y cumplimiento fiscal.

## Características Principales

### 🧾 Gestión de Facturas

- Creación y edición de facturas
- Validación automática de campos
- Numeración secuencial automática
- Estados de factura (borrador, enviada, pagada, anulada)
- Duplicación de facturas existentes

### 📊 Cálculos Fiscales

- Cálculo automático de IVA
- Aplicación de retenciones IRPF
- Descuentos y recargos
- Totales y subtotales
- Validación de tipos impositivos

### 📄 Generación de Documentos

- PDF con diseño profesional
- Personalización de templates
- Códigos QR para verificación
- Archivos adjuntos
- Envío por email automatizado

### 🔗 Integraciones

- Sincronización con AEAT (SII)
- Exportación a contabilidad
- API REST completa
- Webhooks para notificaciones

## Arquitectura

```
📦 apps/invoice-service/
├── src/
│   ├── controllers/
│   │   ├── invoice.controller.ts
│   │   ├── pdf.controller.ts
│   │   └── integration.controller.ts
│   ├── models/
│   │   ├── invoice.model.ts
│   │   ├── client.model.ts
│   │   └── line-item.model.ts
│   ├── services/
│   │   ├── invoice.service.ts
│   │   ├── pdf.service.ts
│   │   ├── calculation.service.ts
│   │   └── notification.service.ts
│   ├── middleware/
│   │   ├── validation.ts
│   │   └── auth.ts
│   ├── routes/
│   │   ├── invoice.routes.ts
│   │   ├── pdf.routes.ts
│   │   └── health.routes.ts
│   ├── utils/
│   │   ├── pdf-generator.ts
│   │   ├── number-formatter.ts
│   │   └── logger.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── templates/
│   └── invoice-template.html
├── tests/
├── Dockerfile
├── .env
├── package.json
└── tsconfig.json
```

## Endpoints Principales

### Facturas

- `POST /api/invoices` - Crear factura
- `GET /api/invoices` - Listar facturas
- `GET /api/invoices/:id` - Obtener factura
- `PUT /api/invoices/:id` - Actualizar factura
- `DELETE /api/invoices/:id` - Eliminar factura
- `POST /api/invoices/:id/duplicate` - Duplicar factura

### PDF y Documentos

- `GET /api/invoices/:id/pdf` - Generar PDF
- `POST /api/invoices/:id/send` - Enviar por email
- `GET /api/invoices/:id/preview` - Vista previa

### Integraciones

- `POST /api/invoices/:id/submit-sii` - Enviar a AEAT
- `GET /api/invoices/:id/status` - Estado en AEAT
- `POST /api/invoices/batch-export` - Exportación masiva

## Modelos de Datos

### Invoice

```typescript
interface Invoice {
  id: string;
  number: string;
  series: string;
  date: Date;
  dueDate: Date;
  clientId: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  retentionAmount: number;
  total: number;
  items: LineItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### LineItem

```typescript
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  retentionRate: number;
  total: number;
}
```

## Estados de Desarrollo

- ⏳ **Pendiente**: Estructura base y modelos
- 🔄 **En Progreso**: Controladores y servicios
- ✅ **Completado**: Auth Service (base para este)

## Próximos Pasos

1. Crear estructura del proyecto
2. Definir modelos y base de datos
3. Implementar controladores CRUD
4. Desarrollar generación de PDF
5. Integrar con sistemas fiscales
