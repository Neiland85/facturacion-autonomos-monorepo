/**
 * Paquete de validación y sanitización para facturación de autónomos
 * 
 * Características principales:
 * - Validación de identificadores fiscales españoles (NIF/NIE/CIF)
 * - Sanitización anti-XSS e inyección SQL
 * - Validación específica para datos de facturación
 * - Middleware para Express.js
 */

// Exportar validadores principales
export {
  amountValidator, clientSchema, dateValidator, detectSqlInjection, emailValidator, fiscalIdValidator, invoiceLineSchema, invoiceNumberValidator, invoiceSchema, safeTextValidator, sanitizeObject, validateInvoiceData, type ValidatedClient, type ValidatedInvoice, type ValidatedInvoiceLine
} from './validators/invoice-validator';

// Exportar esquemas originales (si existen)
export {
  addressSchema, amountSchema, fiscalIdSchema, ibanSchema, invoiceDateSchema, invoiceFiltersSchema,
  invoiceUpdateSchema, postalCodeSchema, type Address, type Client, type Invoice, type InvoiceFilters,
  type InvoiceLine, type InvoiceUpdate
} from './schemas/invoice.schemas';

// Funciones de utilidad
export const ValidationUtils = {
  /**
   * Validar NIF español con algoritmo de verificación
   */
  validateNIF(nif: string): boolean {
    const cleanNif = nif.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!/^\d{8}[A-Z]$/.test(cleanNif)) return false;

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(cleanNif.substring(0, 8), 10);
    const letter = cleanNif.charAt(8);
    
    return letters.charAt(number % 23) === letter;
  },

  /**
   * Validar NIE español
   */
  validateNIE(nie: string): boolean {
    const cleanNie = nie.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!/^[XYZ]\d{7}[A-Z]$/.test(cleanNie)) return false;

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const prefixMap: { [key: string]: string } = { X: '0', Y: '1', Z: '2' };
    
    const number = parseInt(prefixMap[cleanNie.charAt(0)] + cleanNie.substring(1, 8), 10);
    const letter = cleanNie.charAt(8);
    
    return letters.charAt(number % 23) === letter;
  },

  /**
   * Validar CIF español
   */
  validateCIF(cif: string): boolean {
    const cleanCif = cif.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(cleanCif)) return false;

    const orgType = cleanCif.charAt(0);
    const number = cleanCif.substring(1, 8);
    const control = cleanCif.charAt(8);

    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(number.charAt(i), 10);
      if (i % 2 === 0) {
        // Posiciones pares: multiplicar por 2
        const doubled = digit * 2;
        sum += doubled > 9 ? Math.floor(doubled / 10) + (doubled % 10) : doubled;
      } else {
        // Posiciones impares: sumar directamente
        sum += digit;
      }
    }

    const units = sum % 10;
    const expectedDigit = units === 0 ? 0 : 10 - units;
    const expectedLetter = 'JABCDEFGHI'.charAt(expectedDigit);

    // Algunos tipos de organización usan letra, otros dígito
    const useDigit = 'NPQRSW'.includes(orgType);
    return useDigit ? control === expectedDigit.toString() : control === expectedLetter;
  },

  /**
   * Formatear importe para mostrar
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Calcular IVA
   */
  calculateVAT(amount: number, rate: number): number {
    const vatAmount = amount * (rate / 100);
    return Math.round(vatAmount * 100) / 100; // Redondear a 2 decimales
  },

  /**
   * Validar código postal español
   */
  validateSpanishPostalCode(postalCode: string): boolean {
    const cleaned = postalCode.replace(/\D/g, '');
    return /^[0-5]\d{4}$/.test(cleaned);
  },

  /**
   * Sanitizar texto para prevenir XSS
   */
  sanitizeText(text: string): string {
    return text
      .replace(/[<>"'&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  /**
   * Validar IBAN español
   */
  validateSpanishIBAN(iban: string): boolean {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^ES\d{22}$/.test(cleaned)) return false;

    // Algoritmo de validación IBAN
    const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );

    // Validación módulo 97
    let remainder = '';
    for (let i = 0; i < numericString.length; i += 7) {
      remainder = (parseInt(remainder + numericString.substring(i, i + 7), 10) % 97).toString();
    }

    return parseInt(remainder, 10) === 1;
  }
};

// Constantes útiles
export const ValidationConstants = {
  SPANISH_VAT_RATES: [0, 4, 10, 21],
  MAX_INVOICE_LINES: 100,
  MAX_INVOICE_AMOUNT: 999999999.99,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  VALID_PAYMENT_METHODS: ['transfer', 'cash', 'card', 'check'] as const,
  
  // Regex patterns
  PATTERNS: {
    NIF: /^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
    NIE: /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i,
    CIF: /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i,
    SPANISH_POSTAL_CODE: /^[0-5]\d{4}$/,
    SPANISH_IBAN: /^ES\d{22}$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^[+]?[\d\s\-\(\)]{9,15}$/
  }
};

// Error types
export class ValidationError extends Error {
  public readonly code: string;
  public readonly field?: string;

  constructor(message: string, code = 'VALIDATION_ERROR', field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.field = field;
  }
}

export class SecurityError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high';

  constructor(message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    super(message);
    this.name = 'SecurityError';
    this.code = 'SECURITY_ERROR';
    this.severity = severity;
  }
}
