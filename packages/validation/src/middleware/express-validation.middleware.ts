import DOMPurify from "isomorphic-dompurify";
import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Interfaz para opciones de validación
 */
interface ValidationOptions {
  sanitizeHtml?: boolean;
  stripUnknown?: boolean;
  allowPartial?: boolean;
}

/**
 * Resultado de validación exitosa
 */
interface ValidationResult<T> {
  success: true;
  data: T;
  sanitized: T;
}

/**
 * Resultado de validación fallida
 */
interface ValidationError {
  success: false;
  errors: Array<{
    field: string;
    message: string;
    received?: any;
  }>;
  code: "VALIDATION_ERROR";
}

/**
 * Middleware genérico de validación para Express
 */
export const validateRequest = <T>(
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const {
        sanitizeHtml = true,
        stripUnknown = true,
        allowPartial = false,
      } = options;

      // Construir objeto de datos a validar
      const dataToValidate = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      };

      // Sanitización HTML si está habilitada
      let sanitizedData = dataToValidate;
      if (sanitizeHtml) {
        sanitizedData = deepSanitizeHtml(dataToValidate);
      }

      // Validación con Zod
      const validationResult = schema.safeParse(sanitizedData);

      if (!validationResult.success) {
        const formattedErrors = formatZodErrors(validationResult.error);

        res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: formattedErrors,
          code: "VALIDATION_ERROR",
        } as ValidationError);
        return;
      }

      // Asignar datos validados y sanitizados al request
      req.validatedData = validationResult.data;
      req.sanitizedData = sanitizedData;

      next();
    } catch (error) {
      console.error("Error en validación:", error);
      res.status(500).json({
        success: false,
        message: "Error interno de validación",
        code: "INTERNAL_VALIDATION_ERROR",
      });
    }
  };
};

/**
 * Middleware específico para validar solo el body
 */
export const validateBody = <T>(
  schema: ZodSchema<T>,
  options?: ValidationOptions
) => {
  return validateRequest(z.object({ body: schema }), options);
};

/**
 * Middleware específico para validar solo query parameters
 */
export const validateQuery = <T>(
  schema: ZodSchema<T>,
  options?: ValidationOptions
) => {
  return validateRequest(z.object({ query: schema }), options);
};

/**
 * Middleware específico para validar solo parámetros de ruta
 */
export const validateParams = <T>(
  schema: ZodSchema<T>,
  options?: ValidationOptions
) => {
  return validateRequest(z.object({ params: schema }), options);
};

/**
 * Formatear errores de Zod en formato amigable
 */
function formatZodErrors(error: ZodError): Array<{
  field: string;
  message: string;
  received?: any;
}> {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

/**
 * Sanitización profunda de HTML en objetos
 */
function deepSanitizeHtml(obj: any): any {
  if (typeof obj === "string") {
    return DOMPurify.sanitize(obj, {
      ALLOWED_TAGS: [], // No permitir ningún tag HTML
      ALLOWED_ATTR: [], // No permitir ningún atributo
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSanitizeHtml);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitizeHtml(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware para sanitizar específicamente campos de entrada peligrosos
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query params
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar headers específicos (si es necesario)
    const dangerousHeaders = ["x-forwarded-for", "user-agent", "referer"];
    dangerousHeaders.forEach((header) => {
      if (req.headers[header] && typeof req.headers[header] === "string") {
        req.headers[header] = DOMPurify.sanitize(
          req.headers[header] as string,
          {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
          }
        );
      }
    });

    next();
  } catch (error) {
    console.error("Error en sanitización:", error);
    res.status(500).json({
      success: false,
      message: "Error de procesamiento de datos",
    });
  }
};

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return DOMPurify.sanitize(obj.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar también las claves del objeto
      const sanitizedKey = DOMPurify.sanitize(key, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware para validar límites de datos
 */
export const validateDataLimits = (options: {
  maxBodySize?: number;
  maxQueryParams?: number;
  maxHeaderSize?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {
      maxBodySize = 1024 * 1024, // 1MB por defecto
      maxQueryParams = 50,
      maxHeaderSize = 8192, // 8KB por defecto
    } = options;

    // Validar tamaño del body
    const bodySize = JSON.stringify(req.body || {}).length;
    if (bodySize > maxBodySize) {
      res.status(413).json({
        success: false,
        message: `Payload demasiado grande. Máximo: ${maxBodySize} bytes`,
        code: "PAYLOAD_TOO_LARGE",
      });
      return;
    }

    // Validar número de query parameters
    const queryParamCount = Object.keys(req.query || {}).length;
    if (queryParamCount > maxQueryParams) {
      res.status(400).json({
        success: false,
        message: `Demasiados parámetros de consulta. Máximo: ${maxQueryParams}`,
        code: "TOO_MANY_QUERY_PARAMS",
      });
      return;
    }

    // Validar tamaño de headers
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > maxHeaderSize) {
      res.status(431).json({
        success: false,
        message: "Headers demasiado grandes",
        code: "HEADERS_TOO_LARGE",
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para prevenir inyección SQL en parámetros
 */
export const preventSqlInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%23)|(#))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION[^a-zA-Z]/i,
    /SELECT[^a-zA-Z]/i,
    /INSERT[^a-zA-Z]/i,
    /DELETE[^a-zA-Z]/i,
    /UPDATE[^a-zA-Z]/i,
    /DROP[^a-zA-Z]/i,
    /CREATE[^a-zA-Z]/i,
    /ALTER[^a-zA-Z]/i,
  ];

  const checkForSqlInjection = (obj: any, path = ""): boolean => {
    if (typeof obj === "string") {
      return sqlInjectionPatterns.some((pattern) => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some((item, index) =>
        checkForSqlInjection(item, `${path}[${index}]`)
      );
    }

    if (obj !== null && typeof obj === "object") {
      return Object.entries(obj).some(([key, value]) =>
        checkForSqlInjection(value, path ? `${path}.${key}` : key)
      );
    }

    return false;
  };

  // Verificar body, query y params
  const dataToCheck = {
    ...req.body,
    ...req.query,
    ...req.params,
  };

  if (checkForSqlInjection(dataToCheck)) {
    console.warn("Intento de inyección SQL detectado:", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
      method: req.method,
      suspiciousData: dataToCheck,
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
 * Extender tipos de Express para incluir datos validados
 */
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      sanitizedData?: any;
    }
  }
}
