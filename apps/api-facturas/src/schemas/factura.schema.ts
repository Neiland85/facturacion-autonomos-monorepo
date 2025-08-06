import { z } from 'zod';

// Schema para líneas de factura
export const LineaFacturaSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  cantidad: z.number().positive('La cantidad debe ser positiva'),
  precioUnitario: z.number().nonnegative('El precio unitario no puede ser negativo'),
  tipoIVA: z.number().min(0).max(21, 'El tipo de IVA debe estar entre 0 y 21'),
  descuento: z.number().min(0).max(100, 'El descuento debe estar entre 0 y 100').optional(),
});

// Schema para crear factura
export const CreateFacturaSchema = z.object({
  numeroFactura: z.string()
    .regex(/^[A-Z0-9\-\/]+$/, 'Formato de número de factura inválido')
    .optional(),
  fecha: z.string().datetime().or(z.date()),
  clienteId: z.string().uuid('ID de cliente inválido').optional(),
  
  // Datos opcionales del cliente (para facturas rápidas)
  datosCliente: z.object({
    nombre: z.string().min(1),
    nif: z.string().regex(/^[A-Z]?\d{7,8}[A-Z]$/, 'NIF/CIF inválido'),
    direccion: z.string().optional(),
    codigoPostal: z.string().regex(/^\d{5}$/, 'Código postal inválido').optional(),
    ciudad: z.string().optional(),
    provincia: z.string().optional(),
    pais: z.string().default('ES'),
    email: z.string().email().optional(),
    telefono: z.string().optional(),
  }).optional(),
  
  lineas: z.array(LineaFacturaSchema).min(1, 'La factura debe tener al menos una línea'),
  
  // Retenciones
  tipoRetencion: z.number().min(0).max(100).optional(),
  
  // Datos adicionales
  observaciones: z.string().max(500).optional(),
  formaPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'DOMICILIACION', 'OTRO']).optional(),
  vencimiento: z.string().datetime().or(z.date()).optional(),
  
  // Metadatos
  estado: z.enum(['BORRADOR', 'EMITIDA', 'ENVIADA', 'COBRADA', 'ANULADA']).default('BORRADOR'),
  moneda: z.string().length(3).default('EUR'),
  idioma: z.string().length(2).default('es'),
});

// Schema para actualizar factura
export const UpdateFacturaSchema = CreateFacturaSchema.partial().extend({
  id: z.string().uuid('ID de factura inválido'),
});

// Schema para filtros de búsqueda
export const FacturaFilterSchema = z.object({
  numeroFactura: z.string().optional(),
  clienteId: z.string().uuid().optional(),
  estado: z.enum(['BORRADOR', 'EMITIDA', 'ENVIADA', 'COBRADA', 'ANULADA']).optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  importeMinimo: z.number().nonnegative().optional(),
  importeMaximo: z.number().nonnegative().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
  orderBy: z.enum(['fecha', 'numero', 'importe', 'estado']).default('fecha'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para respuesta de factura
export const FacturaResponseSchema = z.object({
  id: z.string().uuid(),
  numeroFactura: z.string(),
  fecha: z.date(),
  cliente: z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    nif: z.string(),
    email: z.string().email().nullable(),
  }),
  lineas: z.array(z.object({
    id: z.string().uuid(),
    descripcion: z.string(),
    cantidad: z.number(),
    precioUnitario: z.number(),
    tipoIVA: z.number(),
    descuento: z.number().nullable(),
    subtotal: z.number(),
    totalIVA: z.number(),
    total: z.number(),
  })),
  subtotal: z.number(),
  totalIVA: z.number(),
  totalRetencion: z.number(),
  total: z.number(),
  estado: z.string(),
  observaciones: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Types exportados
export type CreateFacturaInput = z.infer<typeof CreateFacturaSchema>;
export type UpdateFacturaInput = z.infer<typeof UpdateFacturaSchema>;
export type FacturaFilter = z.infer<typeof FacturaFilterSchema>;
export type FacturaResponse = z.infer<typeof FacturaResponseSchema>;
export type LineaFactura = z.infer<typeof LineaFacturaSchema>;