import { z } from 'zod';

/**
 * Validadores específicos para facturación de autónomos españoles
 */

// Regex optimizadas para identificadores fiscales españoles
const NIF_REGEX = /^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const NIE_REGEX = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const CIF_REGEX = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i;

/**
 * Validador de identificadores fiscales españoles
 */
export const fiscalIdValidator = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => {
    // Sanitizar entrada - solo letras y números
    const sanitized = value.replace(/[^A-Z0-9]/g, '');
    return NIF_REGEX.test(sanitized) || NIE_REGEX.test(sanitized) || CIF_REGEX.test(sanitized);
  }, {
    message: 'Identificador fiscal inválido. Debe ser un NIF, NIE o CIF válido.'
  })
  .transform((value) => value.replace(/[^A-Z0-9]/g, ''));

/**
 * Validador de importes monetarios con sanitización
 */
export const amountValidator = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'string') {
      // Sanitizar: eliminar caracteres peligrosos y de formato
      const sanitized = val.replace(/[^\d.,-]/g, '').replace(/,/g, '.');
      const parsed = parseFloat(sanitized);
      return isFinite(parsed) ? parsed : 0;
    }
    return isFinite(val) ? val : 0;
  })
  .pipe(
    z.number()
      .min(0, 'El importe no puede ser negativo')
      .max(999999999.99, 'El importe es demasiado alto')
      .refine((val) => Number.isInteger(val * 100), {
        message: 'El importe no puede tener más de 2 decimales'
      })
  );

/**
 * Validador de fechas con sanitización
 */
export const dateValidator = z
  .union([z.string(), z.date()])
  .transform((val) => {
    if (typeof val === 'string') {
      // Sanitizar fecha - eliminar caracteres peligrosos
      const sanitized = val.replace(/[^0-9\-T:Z.]/g, '');
      const date = new Date(sanitized);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return val instanceof Date ? val : new Date();
  })
  .pipe(
    z.date()
      .min(new Date('2000-01-01'), 'Fecha demasiado antigua')
      .max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'Fecha demasiado futura')
  );

/**
 * Validador de texto con sanitización anti-XSS
 */
export const safeTextValidator = (maxLength = 255) => z
  .string()
  .transform((val) => {
    // Sanitización básica anti-XSS
    return val
      .replace(/[<>\"'&]/g, '') // Eliminar caracteres HTML peligrosos
      .replace(/javascript:/gi, '') // Eliminar javascript: URLs
      .replace(/on\w+=/gi, '') // Eliminar event handlers
      .trim()
      .slice(0, maxLength);
  })
  .refine((val) => val.length > 0, {
    message: 'El campo no puede estar vacío'
  });

/**
 * Validador de email con sanitización
 */
export const emailValidator = z
  .string()
  .transform((val) => {
    // Sanitizar email
    return val.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
  })
  .pipe(
    z.string()
      .email('Email inválido')
      .max(254, 'Email demasiado largo')
  );

/**
 * Validador de número de factura
 */
export const invoiceNumberValidator = z
  .string()
  .transform((val) => {
    // Sanitizar número de factura - solo alfanuméricos, guiones y barras
    return val.toUpperCase().replace(/[^A-Z0-9\-_/]/g, '').slice(0, 50);
  })
  .refine((val) => val.length > 0, {
    message: 'El número de factura es obligatorio'
  });

/**
 * Esquema de línea de factura
 */
export const invoiceLineSchema = z.object({
  description: safeTextValidator(500),
  quantity: z
    .number()
    .min(0.001, 'La cantidad debe ser mayor que 0')
    .max(999999, 'Cantidad demasiado alta')
    .refine((val) => Number.isInteger(val * 1000), {
      message: 'Máximo 3 decimales permitidos'
    }),
  unitPrice: amountValidator,
  vatRate: z
    .number()
    .refine((rate) => [0, 4, 10, 21].includes(rate), {
      message: 'Tipo de IVA inválido (0%, 4%, 10%, 21%)'
    })
});

/**
 * Esquema de cliente/empresa
 */
export const clientSchema = z.object({
  name: safeTextValidator(100),
  fiscalId: fiscalIdValidator,
  email: emailValidator.optional(),
  phone: z
    .string()
    .transform((val) => val.replace(/[^\d\s\-\+\(\)]/g, ''))
    .optional(),
  address: z.object({
    street: safeTextValidator(100),
    city: safeTextValidator(50),
    postalCode: z
      .string()
      .transform((val) => val.replace(/\D/g, ''))
      .pipe(z.string().regex(/^\d{5}$/, 'Código postal español inválido')),
    province: safeTextValidator(50)
  })
});

/**
 * Esquema principal de factura con validación y sanitización completa
 */
export const invoiceSchema = z.object({
  number: invoiceNumberValidator,
  date: dateValidator,
  dueDate: dateValidator.optional(),
  issuer: clientSchema,
  client: clientSchema,
  lines: z
    .array(invoiceLineSchema)
    .min(1, 'La factura debe tener al menos una línea')
    .max(100, 'Máximo 100 líneas por factura'),
  notes: safeTextValidator(1000).optional(),
  paymentMethod: z
    .enum(['transfer', 'cash', 'card', 'check'])
    .optional()
});

/**
 * Función para validar y sanitizar datos de factura
 */
export function validateInvoiceData(data: unknown): {
  success: boolean;
  data?: any;
  errors?: string[];
} {
  try {
    const result = invoiceSchema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ['Error de validación interno']
    };
  }
}

/**
 * Función para detectar inyección SQL
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /\b(select|insert|update|delete|drop|create|alter|union|join)\b/i,
    /('|"|;|--|\*|\/\*|\*\/)/,
    /\b(or|and)\s+[\w\d]+\s*=\s*[\w\d'"]/i,
    /\b(exec|execute|sp_|xp_)\b/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Función para sanitizar recursivamente un objeto
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Detectar inyección SQL
    if (detectSqlInjection(obj)) {
      throw new Error('Contenido sospechoso detectado');
    }
    
    // Sanitización básica
    return obj
      .replace(/[<>\"'&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .slice(0, 10000); // Límite de longitud
  }

  if (typeof obj === 'number') {
    return isFinite(obj) ? obj : 0;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      const sanitizedKey = key.replace(/[<>\"'&]/g, '').slice(0, 100);
      sanitized[sanitizedKey] = sanitizeObject(value);
    });
    return sanitized;
  }

  return obj;
}

/**
 * Tipos TypeScript
 */
export type ValidatedInvoice = z.infer<typeof invoiceSchema>;
export type ValidatedClient = z.infer<typeof clientSchema>;
export type ValidatedInvoiceLine = z.infer<typeof invoiceLineSchema>;
