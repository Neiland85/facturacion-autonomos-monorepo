import { Request, Response, NextFunction } from "express";

/**
 * Funciones de sanitización para prevenir inyecciones
 */

/**
 * Sanitizar cadenas para prevenir XSS básico
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>\"']/g, "") // Eliminar caracteres HTML peligrosos
    .replace(/javascript:/gi, "") // Eliminar javascript: urls
    .replace(/on\w+=/gi, "") // Eliminar event handlers
    .replace(/data:/gi, "") // Eliminar data: urls
    .slice(0, 10000); // Limitar longitud máxima
}

/**
 * Sanitizar números para prevenir inyección
 */
export function sanitizeNumber(input: unknown): number | null {
  if (typeof input === "number") {
    return isFinite(input) ? input : null;
  }

  if (typeof input === "string") {
    // Permitir solo números, puntos y comas
    const cleaned = input.replace(/[^\d.,-]/g, "");
    const parsed = parseFloat(cleaned);
    return isFinite(parsed) ? parsed : null;
  }

  return null;
}

/**
 * Validar y sanitizar identificadores fiscales españoles
 */
export function validateAndSanitizeFiscalId(input: string): {
  isValid: boolean;
  sanitized: string;
} {
  if (typeof input !== "string") {
    return { isValid: false, sanitized: "" };
  }

  const sanitized = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  // Validar NIF
  const nifRegex = /^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  if (nifRegex.test(sanitized)) {
    return { isValid: true, sanitized };
  }

  // Validar NIE
  const nieRegex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  if (nieRegex.test(sanitized)) {
    return { isValid: true, sanitized };
  }

  // Validar CIF
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  if (cifRegex.test(sanitized)) {
    return { isValid: true, sanitized };
  }

  return { isValid: false, sanitized };
}

/**
 * Sanitizar email
 */
export function sanitizeEmail(input: string): {
  isValid: boolean;
  sanitized: string;
} {
  if (typeof input !== "string") {
    return { isValid: false, sanitized: "" };
  }

  const sanitized = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return {
    isValid: emailRegex.test(sanitized) && sanitized.length <= 254,
    sanitized,
  };
}

/**
 * Detectar patrones de inyección SQL
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false;

  const sqlPatterns = [
    /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b)/i,
    /(\bunion\b|\bjoin\b)/i,
    /('|"|;|--|\*|\/\*|\*\/)/,
    /(\bor\b|\band\b)\s+[\w\d]+\s*=\s*[\w\d'"]/i,
    /\b(exec|execute|sp_|xp_)\b/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Middleware principal de sanitización
 */
export const sanitizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitizar body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query params
    if (req.query && typeof req.query === "object") {
      const sanitizedQuery: Record<string, unknown> = {};
      Object.entries(req.query).forEach(([key, value]) => {
        const sanitizedKey = sanitizeString(key);
        if (Array.isArray(value)) {
          sanitizedQuery[sanitizedKey] = value.map((v) =>
            typeof v === "string" ? sanitizeString(v) : v
          );
        } else if (typeof value === "string") {
          sanitizedQuery[sanitizedKey] = sanitizeString(value);
        } else {
          sanitizedQuery[sanitizedKey] = value;
        }
      });
      (req as { query: Record<string, unknown> }).query = sanitizedQuery;
    }

    // Sanitizar params
    if (req.params && typeof req.params === "object") {
      const sanitizedParams: Record<string, unknown> = {};
      Object.entries(req.params).forEach(([key, value]) => {
        sanitizedParams[sanitizeString(key)] =
          typeof value === "string" ? sanitizeString(value) : value;
      });
      (req as { params: Record<string, unknown> }).params = sanitizedParams;
    }

    next();
  } catch (error) {
    console.error("Error en sanitización:", error);
    res.status(500).json({
      success: false,
      message: "Error de procesamiento",
    });
  }
};

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (typeof obj === "number") {
    return isFinite(obj) ? obj : null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, value]) => {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    });
    return sanitized;
  }

  return obj;
}

/**
 * Middleware para validar límites de datos específicos de facturación
 */
export const validateInvoiceDataLimits = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  if (req.body) {
    // Validar límites específicos de facturación
    if (req.body.lines && Array.isArray(req.body.lines)) {
      if (req.body.lines.length > 100) {
        errors.push("Una factura no puede tener más de 100 líneas");
      }

      req.body.lines.forEach((line: unknown, index: number) => {
        if (
          line &&
          typeof line === "object" &&
          "description" in line &&
          typeof line.description === "string" &&
          line.description.length > 500
        ) {
          errors.push(
            `Descripción de línea ${index + 1} demasiado larga (máximo 500 caracteres)`
          );
        }

        if (
          line &&
          typeof line === "object" &&
          "quantity" in line &&
          typeof line.quantity === "number" &&
          (line.quantity < 0 || line.quantity > 999999)
        ) {
          errors.push(`Cantidad inválida en línea ${index + 1}`);
        }
      });
    }

    // Validar importes
    if (req.body.total !== undefined) {
      const total = sanitizeNumber(req.body.total);
      if (total === null || total < 0 || total > 999999999.99) {
        errors.push("Importe total inválido");
      }
    }

    // Validar identificador fiscal
    if (
      req.body.client &&
      typeof req.body.client === "object" &&
      "fiscalId" in req.body.client
    ) {
      const { isValid } = validateAndSanitizeFiscalId(
        req.body.client.fiscalId as string
      );
      if (!isValid) {
        errors.push("Identificador fiscal del cliente inválido");
      }
    }

    if (
      req.body.issuer &&
      typeof req.body.issuer === "object" &&
      "fiscalId" in req.body.issuer
    ) {
      const { isValid } = validateAndSanitizeFiscalId(
        req.body.issuer.fiscalId as string
      );
      if (!isValid) {
        errors.push("Identificador fiscal del emisor inválido");
      }
    }

    // Validar emails
    if (
      req.body.client &&
      typeof req.body.client === "object" &&
      "email" in req.body.client
    ) {
      const { isValid } = sanitizeEmail(req.body.client.email as string);
      if (!isValid) {
        errors.push("Email del cliente inválido");
      }
    }

    // Validar fechas
    if (req.body.date) {
      const date = new Date(req.body.date as string);
      if (isNaN(date.getTime())) {
        errors.push("Fecha de factura inválida");
      } else {
        const now = new Date();
        const oneYearAgo = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        const oneYearFromNow = new Date(
          now.getFullYear() + 1,
          now.getMonth(),
          now.getDate()
        );

        if (date < oneYearAgo || date > oneYearFromNow) {
          errors.push("Fecha de factura fuera del rango permitido");
        }
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Datos de factura inválidos",
      errors,
    });
    return;
  }

  next();
};

/**
 * Middleware para detectar inyecciones SQL
 */
export const sqlInjectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkSqlInjection = (obj: unknown, path = ""): string | null => {
    if (typeof obj === "string" && detectSqlInjection(obj)) {
      return path || "entrada";
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = checkSqlInjection(obj[i], `${path}[${i}]`);
        if (result) return result;
      }
    }

    if (obj !== null && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        const result = checkSqlInjection(value, path ? `${path}.${key}` : key);
        if (result) return result;
      }
    }

    return null;
  };

  // Verificar todos los datos de entrada
  const dataToCheck = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const suspiciousField = checkSqlInjection(dataToCheck);

  if (suspiciousField) {
    console.warn("Intento de inyección SQL detectado:", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
      method: req.method,
      field: suspiciousField,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      code: "INVALID_INPUT",
    });
    return;
  }

  next();
};

/**
 * Middleware combinado para validación completa
 */
export const completeValidationMiddleware = [
  sanitizeMiddleware,
  sqlInjectionMiddleware,
  validateInvoiceDataLimits,
];
