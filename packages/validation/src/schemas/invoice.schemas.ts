import { z } from 'zod';

/**
 * Validaciones específicas para datos de facturación española
 */

// Regex para validar NIF/NIE/CIF españoles
const NIF_REGEX = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const NIE_REGEX = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const CIF_REGEX = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;

// Validación de códigos postales españoles
const SPANISH_POSTAL_CODE_REGEX = /^[0-5][0-9]{4}$/;

// IBAN español
const SPANISH_IBAN_REGEX = /^ES[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{1}[0-9]{1}[0-9]{10}$/;

/**
 * Validador para identificadores fiscales españoles
 */
export const fiscalIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => {
    return NIF_REGEX.test(value) || NIE_REGEX.test(value) || CIF_REGEX.test(value);
  }, {
    message: 'Identificador fiscal inválido. Debe ser un NIF, NIE o CIF válido.'
  })
  .transform((value) => value.toUpperCase());

/**
 * Validador para importes monetarios
 */
export const amountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'string') {
      // Limpiar caracteres de formato
      const cleaned = val.replace(/[€$\s,]/g, '').replace(',', '.');
      return parseFloat(cleaned);
    }
    return val;
  })
  .pipe(
    z.number()
      .min(0, 'El importe no puede ser negativo')
      .max(999999999.99, 'El importe es demasiado alto')
      .refine((val) => {
        // Validar máximo 2 decimales
        return Number.isInteger(val * 100);
      }, {
        message: 'El importe no puede tener más de 2 decimales'
      })
  );

/**
 * Validador para porcentajes de IVA españoles
 */
export const vatRateSchema = z
  .number()
  .refine((rate) => {
    // Tipos de IVA válidos en España (2024)
    const validRates = [0, 4, 10, 21];
    return validRates.includes(rate);
  }, {
    message: 'Tipo de IVA inválido. Debe ser 0%, 4%, 10% o 21%'
  });

/**
 * Validador para fechas de factura
 */
export const invoiceDateSchema = z
  .union([z.string(), z.date()])
  .transform((val) => {
    if (typeof val === 'string') {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      return date;
    }
    return val;
  })
  .pipe(
    z.date()
      .min(new Date('2000-01-01'), 'La fecha no puede ser anterior al año 2000')
      .max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'La fecha no puede ser más de un año en el futuro')
  );

/**
 * Validador para números de factura
 */
export const invoiceNumberSchema = z
  .string()
  .trim()
  .min(1, 'El número de factura es obligatorio')
  .max(50, 'El número de factura no puede exceder 50 caracteres')
  .regex(/^[A-Z0-9\-_/]+$/i, 'El número de factura solo puede contener letras, números, guiones y barras')
  .transform((val) => val.toUpperCase());

/**
 * Validador para códigos postales españoles
 */
export const postalCodeSchema = z
  .string()
  .trim()
  .regex(SPANISH_POSTAL_CODE_REGEX, 'Código postal español inválido (debe ser 5 dígitos entre 00000-59999)');

/**
 * Validador para IBAN español
 */
export const ibanSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(SPANISH_IBAN_REGEX, 'IBAN español inválido')
  .transform((val) => val.replace(/\s/g, ''));

/**
 * Esquema para dirección completa
 */
export const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria')
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-º]+$/, 'La dirección contiene caracteres inválidos'),
  
  city: z
    .string()
    .trim()
    .min(1, 'La ciudad es obligatoria')
    .max(50, 'La ciudad no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, 'La ciudad contiene caracteres inválidos'),
  
  postalCode: postalCodeSchema,
  
  province: z
    .string()
    .trim()
    .min(1, 'La provincia es obligatoria')
    .max(50, 'La provincia no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.-]+$/, 'La provincia contiene caracteres inválidos'),
  
  country: z
    .string()
    .trim()
    .default('España')
    .refine((val) => val === 'España' || val === 'Spain', {
      message: 'Solo se permiten direcciones españolas'
    })
});

/**
 * Esquema para cliente/empresa
 */
export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-&()]+$/, 'El nombre contiene caracteres inválidos'),
  
  fiscalId: fiscalIdSchema,
  
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),
  
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-()]{9,15}$/, 'Teléfono inválido')
    .optional(),
  
  address: addressSchema
});

/**
 * Esquema para línea de factura
 */
export const invoiceLineSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-_()%/]+$/, 'La descripción contiene caracteres inválidos'),
  
  quantity: z
    .number()
    .min(0.01, 'La cantidad debe ser mayor que 0')
    .max(999999, 'La cantidad es demasiado alta')
    .refine((val) => {
      // Máximo 3 decimales para cantidades
      return Number.isInteger(val * 1000);
    }, {
      message: 'La cantidad no puede tener más de 3 decimales'
    }),
  
  unitPrice: amountSchema,
  vatRate: vatRateSchema,
  
  // Campos calculados (opcionales para validación)
  subtotal: amountSchema.optional(),
  vatAmount: amountSchema.optional(),
  total: amountSchema.optional()
});

/**
 * Esquema principal de factura
 */
export const invoiceSchema = z.object({
  number: invoiceNumberSchema,
  date: invoiceDateSchema,
  dueDate: invoiceDateSchema.optional(),
  
  // Datos del emisor
  issuer: clientSchema,
  
  // Datos del cliente
  client: clientSchema,
  
  // Líneas de factura
  lines: z
    .array(invoiceLineSchema)
    .min(1, 'La factura debe tener al menos una línea')
    .max(100, 'La factura no puede tener más de 100 líneas'),
  
  // Notas adicionales
  notes: z
    .string()
    .trim()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.-_()%/\n\r]*$/, 'Las notas contienen caracteres inválidos')
    .optional(),
  
  // Campos de pago
  paymentMethod: z
    .enum(['transfer', 'cash', 'card', 'check'], {
      errorMap: () => ({ message: 'Método de pago inválido' })
    })
    .optional(),
  
  bankAccount: ibanSchema.optional(),
  
  // Campos calculados (opcionales en entrada, requeridos en salida)
  subtotal: amountSchema.optional(),
  totalVat: amountSchema.optional(),
  total: amountSchema.optional()
});

/**
 * Esquema para actualización de factura (campos opcionales)
 */
export const invoiceUpdateSchema = invoiceSchema.partial().extend({
  id: z.string().uuid('ID de factura inválido')
});

/**
 * Esquema para filtros de búsqueda de facturas
 */
export const invoiceFiltersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val) : 1)
    .pipe(z.number().min(1).max(1000)),
  
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val) : 10)
    .pipe(z.number().min(1).max(100)),
  
  startDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .pipe(z.date().optional()),
  
  endDate: z
    .string()
    .optional()
    .transform((val) => val ? new Date(val) : undefined)
    .pipe(z.date().optional()),
  
  clientId: z.string().uuid().optional(),
  
  status: z
    .enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
    .optional(),
  
  minAmount: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .pipe(z.number().min(0).optional()),
  
  maxAmount: z
    .string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined)
    .pipe(z.number().min(0).optional()),
  
  search: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-_]*$/, 'Término de búsqueda inválido')
    .optional()
});

/**
 * Tipo TypeScript inferido de los esquemas
 */
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceUpdate = z.infer<typeof invoiceUpdateSchema>;
export type InvoiceFilters = z.infer<typeof invoiceFiltersSchema>;
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Address = z.infer<typeof addressSchema>;
