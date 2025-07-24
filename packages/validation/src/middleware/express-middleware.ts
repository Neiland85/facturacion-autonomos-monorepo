import { detectSqlInjection, sanitizeObject, validateInvoiceData } from '../validators/invoice-validator';

/**
 * Middleware para validar datos de factura en Express
 */
export function validateInvoiceMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Verificar que hay datos en el body
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Datos de factura requeridos',
        errors: ['El cuerpo de la petición no puede estar vacío']
      });
      return;
    }

    // Sanitizar y validar datos
    const sanitizedData = sanitizeObject(req.body);
    const validation = validateInvoiceData(sanitizedData);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Datos de factura inválidos',
        errors: validation.errors
      });
      return;
    }

    // Asignar datos validados al request
    (req as any).validatedData = validation.data;
    next();

  } catch (error) {
    console.error('Error en validación de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno de validación'
    });
  }
}

/**
 * Middleware para sanitización básica de entrada
 */
export function basicSanitizationMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Sanitizar body si existe
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query params básicos
    if (req.query) {
      const sanitizedQuery: any = {};
      Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Verificar inyección SQL
          if (detectSqlInjection(value)) {
            res.status(400).json({
              success: false,
              message: 'Datos de entrada inválidos'
            });
            return;
          }
          sanitizedQuery[key] = value.replace(/[<>"'&]/g, '').trim().slice(0, 1000);
        } else {
          sanitizedQuery[key] = value;
        }
      });
      (req as any).query = sanitizedQuery;
    }

    next();
  } catch (error) {
    console.error('Error en sanitización:', error);
    res.status(500).json({
      success: false,
      message: 'Error de procesamiento'
    });
  }
}

/**
 * Middleware para validar límites de datos
 */
export function dataLimitsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const MAX_BODY_SIZE = 1024 * 1024; // 1MB
  const MAX_QUERY_PARAMS = 50;

  // Verificar tamaño del body
  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > MAX_BODY_SIZE) {
    res.status(413).json({
      success: false,
      message: `Datos demasiado grandes. Máximo ${MAX_BODY_SIZE} bytes`
    });
    return;
  }

  // Verificar número de query parameters
  const queryCount = Object.keys(req.query || {}).length;
  if (queryCount > MAX_QUERY_PARAMS) {
    res.status(400).json({
      success: false,
      message: `Demasiados parámetros. Máximo ${MAX_QUERY_PARAMS}`
    });
    return;
  }

  next();
}

/**
 * Middleware para logging de seguridad
 */
export function securityLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Log de peticiones sospechosas
  const userAgent = req.get('User-Agent') || '';
  const suspiciousAgents = ['curl', 'wget', 'python', 'bot', 'crawler'];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    console.warn('Petición sospechosa detectada:', {
      ip: req.ip,
      userAgent,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Middleware combinado para validación completa
 */
export const completeValidationMiddleware = [
  dataLimitsMiddleware,
  basicSanitizationMiddleware,
  securityLoggingMiddleware
];

/**
 * Middleware específico para rutas de factura
 */
export const invoiceValidationMiddleware = [
  ...completeValidationMiddleware,
  validateInvoiceMiddleware
];
