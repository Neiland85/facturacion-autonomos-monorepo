import { z } from 'zod';

// Enums
export const InvoiceStatus = z.enum([
  'draft',      // Borrador
  'sent',       // Enviada
  'paid',       // Pagada
  'overdue',    // Vencida
  'cancelled'   // Anulada
]);

export const TaxType = z.enum([
  'iva_21',     // IVA 21%
  'iva_10',     // IVA 10% 
  'iva_4',      // IVA 4%
  'iva_0',      // IVA 0%
  'exento'      // Exento
]);

// Esquemas de validación
export const LineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.number().positive('La cantidad debe ser positiva'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo'),
  discount: z.number().min(0).max(100).default(0),
  taxType: TaxType.default('iva_21'),
  taxRate: z.number().min(0).max(100),
  retentionRate: z.number().min(0).max(100).default(0),
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(), 
  retentionAmount: z.number().optional(),
  total: z.number().optional()
});

export const ClientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  taxId: z.string().min(1, 'El CIF/NIF es requerido'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().default('España')
  }),
  isCompany: z.boolean().default(false)
});

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  number: z.string().optional(), // Se genera automáticamente
  series: z.string().default('A'),
  date: z.date().default(() => new Date()),
  dueDate: z.date().optional(),
  client: ClientSchema,
  clientId: z.string().optional(),
  status: InvoiceStatus.default('draft'),
  items: z.array(LineItemSchema).min(1, 'Debe incluir al menos un elemento'),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentMethod: z.string().optional(),
  subtotal: z.number().optional(),
  totalTax: z.number().optional(),
  totalRetention: z.number().optional(), 
  total: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const InvoiceSearchSchema = z.object({
  page: z.number().default(1),
  limit: z.number().max(100).default(20),
  status: InvoiceStatus.optional(),
  clientId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  series: z.string().optional(),
  search: z.string().optional() // Búsqueda en número, cliente, etc.
});

export const InvoiceUpdateSchema = InvoiceSchema.partial().omit({
  id: true,
  number: true,
  createdAt: true
});

// Tipos TypeScript derivados
export type Invoice = z.infer<typeof InvoiceSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type InvoiceStatusType = z.infer<typeof InvoiceStatus>;
export type TaxTypeValue = z.infer<typeof TaxType>;
export type InvoiceSearch = z.infer<typeof InvoiceSearchSchema>;
export type InvoiceUpdate = z.infer<typeof InvoiceUpdateSchema>;

// Esquemas de respuesta API
export const InvoiceResponseSchema = z.object({
  success: z.boolean(),
  data: InvoiceSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

export const InvoiceListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    invoices: z.array(InvoiceSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    })
  }).optional(),
  message: z.string().optional(),
  error: z.string().optional()
});

export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>;
export type InvoiceListResponse = z.infer<typeof InvoiceListResponseSchema>;
