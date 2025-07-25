/**
 * 🛡️ MANEJO SEGURO DE ERRORES
 *
 * Middleware para manejo seguro de errores en Express sin exponer información sensible
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración de entorno
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Tipos de errores conocidos y sus respuestas seguras
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    code: 'AUTHENTICATION_ERROR',
    message: 'Authentication required',
  },
  AUTHORIZATION_ERROR: {
    status: 403,
    code: 'AUTHORIZATION_ERROR',
    message: 'Insufficient permissions',
  },
  NOT_FOUND_ERROR: {
    status: 404,
    code: 'NOT_FOUND_ERROR',
    message: 'Resource not found',
  },
  RATE_LIMIT_ERROR: {
    status: 429,
    code: 'RATE_LIMIT_ERROR',
    message: 'Too many requests',
  },
  DATABASE_ERROR: {
    status: 500,
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
  },
  EXTERNAL_API_ERROR: {
    status: 502,
    code: 'EXTERNAL_API_ERROR',
    message: 'External service unavailable',
  },
  INTERNAL_ERROR: {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  },
};

/**
 * Patrones de errores sensibles que nunca deben exponerse
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /credential/i,
  /connection.*string/i,
  /database.*url/i,
  /api.*key/i,
  /mongodb:\/\//i,
  /postgres:\/\//i,
  /mysql:\/\//i,
  /redis:\/\//i,
  /file.*path/i,
  /directory/i,
  /env/i,
  /config/i,
];

/**
 * Generar ID único para tracking de errores
 */
function generateErrorId() {
  return `err_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Determinar tipo de error basado en el error original
 */
function determineErrorType(error) {
  // Errores de validación (Joi, Zod, etc.)
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    return ERROR_TYPES.VALIDATION_ERROR;
  }

  // Errores de autenticación JWT
  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    return ERROR_TYPES.AUTHENTICATION_ERROR;
  }

  // Errores de base de datos
  if (
    error.code === 'ECONNREFUSED' ||
    error.name === 'MongoError' ||
    error.name === 'SequelizeError' ||
    (error.code &&
      typeof error.code === 'string' &&
      error.code.startsWith('ER_'))
  ) {
    return ERROR_TYPES.DATABASE_ERROR;
  }

  // Errores HTTP conocidos
  if (error.status === 401 || error.statusCode === 401) {
    return ERROR_TYPES.AUTHENTICATION_ERROR;
  }

  if (error.status === 403 || error.statusCode === 403) {
    return ERROR_TYPES.AUTHORIZATION_ERROR;
  }

  if (error.status === 404 || error.statusCode === 404) {
    return ERROR_TYPES.NOT_FOUND_ERROR;
  }

  if (error.status === 429 || error.statusCode === 429) {
    return ERROR_TYPES.RATE_LIMIT_ERROR;
  }

  // Error interno por defecto
  return ERROR_TYPES.INTERNAL_ERROR;
}

/**
 * Sanitizar mensaje de error para evitar exposición de información sensible
 */
function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return 'An error occurred';
  }

  // Verificar patrones sensibles
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(message)) {
      return 'An error occurred while processing your request';
    }
  }

  // Remover rutas de archivos del sistema
  const sanitized = message
    .replace(/\/[a-zA-Z0-9_\-/.]+\.[a-zA-Z]{2,4}/g, '[FILE_PATH]')
    .replace(/Error: /g, '')
    .replace(/at .+/g, '')
    .trim();

  return sanitized || 'An error occurred';
}

/**
 * Crear log seguro del error para debugging interno
 */
function createSecureErrorLog(error, req, errorId) {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  const userId = req.user?.id || req.session?.userId || 'Anonymous';

  return {
    errorId,
    timestamp,
    level: 'ERROR',
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    status: error.status || error.statusCode,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip,
      userAgent,
      userId,
      headers: IS_PRODUCTION ? {} : req.headers,
      body: IS_PRODUCTION ? {} : req.body,
      query: req.query,
      params: req.params,
    },
    environment: NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
  };
}

/**
 * Escribir log de error a archivo (en producción)
 */
function writeErrorLog(errorLog) {
  if (!IS_PRODUCTION) return;

  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(
      logsDir,
      `errors-${new Date().toISOString().split('T')[0]}.log`
    );

    // Crear directorio si no existe
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Escribir log
    fs.appendFileSync(logFile, JSON.stringify(errorLog) + '\n');
  } catch (logError) {
    console.error('Failed to write error log:', logError.message);
  }
}

/**
 * Middleware de manejo de errores principales
 */
function errorHandler(error, req, res, next) {
  const errorId = generateErrorId();
  const errorType = determineErrorType(error);

  // Crear log seguro del error
  const errorLog = createSecureErrorLog(error, req, errorId);

  // Log interno para debugging
  if (IS_PRODUCTION) {
    console.error(`[${errorId}] Error:`, {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
    writeErrorLog(errorLog);
  } else {
    console.error(`[${errorId}] Development Error:`, error);
  }

  // Preparar respuesta segura para el cliente
  const clientResponse = {
    error: true,
    code: errorType.code,
    message: errorType.message,
    errorId: errorId,
    timestamp: new Date().toISOString(),
  };

  // En desarrollo, añadir información adicional de debugging
  if (!IS_PRODUCTION) {
    clientResponse.debug = {
      originalMessage: sanitizeErrorMessage(error.message),
      stack: error.stack?.split('\n').slice(0, 5), // Solo primeras 5 líneas
      name: error.name,
      code: error.code,
    };
  }

  // Headers de seguridad para respuestas de error
  res.set({
    'X-Error-ID': errorId,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
  });

  // Enviar respuesta
  res.status(errorType.status).json(clientResponse);
}

/**
 * Middleware para capturar errores asíncronos
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware para manejo de rutas no encontradas
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.status = 404;
  error.name = 'NotFoundError';
  next(error);
}

/**
 * Middleware para validación de entrada segura
 */
function validateRequest(schema, options = {}) {
  const {
    body = true,
    query = false,
    params = false,
    sanitize = true,
  } = options;

  return (req, res, next) => {
    try {
      const dataToValidate = {};

      if (body && req.body) dataToValidate.body = req.body;
      if (query && req.query) dataToValidate.query = req.query;
      if (params && req.params) dataToValidate.params = req.params;

      // Validar con schema (compatible con Joi, Zod, etc.)
      const result = schema.validate
        ? schema.validate(dataToValidate)
        : schema.parse(dataToValidate);

      if (result.error) {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.details = sanitize
          ? 'Invalid request data'
          : result.error.details || result.error.message;
        throw validationError;
      }

      // Asignar datos validados
      if (result.value) {
        if (result.value.body) req.body = result.value.body;
        if (result.value.query) req.query = result.value.query;
        if (result.value.params) req.params = result.value.params;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para logging de requests (con información sanitizada)
 */
function requestLogger(options = {}) {
  const {
    logBody = !IS_PRODUCTION,
    logHeaders = !IS_PRODUCTION,
    sensitiveFields = ['password', 'token', 'secret', 'key'],
  } = options;

  return (req, res, next) => {
    const start = Date.now();
    const requestId = generateErrorId().replace('err_', 'req_');

    req.requestId = requestId;

    // Log request
    const requestData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    if (logHeaders) {
      requestData.headers = req.headers;
    }

    if (logBody && req.body) {
      // Sanitizar campos sensibles
      const sanitizedBody = { ...req.body };
      sensitiveFields.forEach(field => {
        if (sanitizedBody[field]) {
          sanitizedBody[field] = '[REDACTED]';
        }
      });
      requestData.body = sanitizedBody;
    }

    console.log('📥 Request:', requestData);

    // Log response cuando termine
    const originalSend = res.send;
    res.send = function (data) {
      const duration = Date.now() - start;
      console.log('📤 Response:', {
        requestId,
        status: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Configuración completa de manejo de errores para Express
 */
function setupErrorHandling(app, options = {}) {
  console.log('🛡️ Configurando manejo seguro de errores...');

  const { enableRequestLogging = true, logSensitiveData = !IS_PRODUCTION } =
    options;

  // Request logging (antes de rutas)
  if (enableRequestLogging) {
    app.use(
      requestLogger({
        logBody: logSensitiveData,
        logHeaders: logSensitiveData,
      })
    );
  }

  // Middleware de validación helper
  app.validateRequest = validateRequest;
  app.asyncHandler = asyncErrorHandler;

  // Handler para rutas no encontradas (debe ir después de todas las rutas)
  app.use(notFoundHandler);

  // Handler principal de errores (debe ir al final)
  app.use(errorHandler);

  console.log('✅ Manejo seguro de errores configurado');
}

/**
 * Utilidades para manejo de errores
 */
const errorUtils = {
  /**
   * Crear error personalizado
   */
  createError(message, status = 500, code = 'CUSTOM_ERROR') {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
  },

  /**
   * Wrapper para funciones async
   */
  asyncWrapper: asyncErrorHandler,

  /**
   * Sanitizar objeto para logging
   */
  sanitizeForLog(obj, sensitiveFields = ['password', 'token', 'secret']) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  },
};

module.exports = {
  setupErrorHandling,
  errorHandler,
  notFoundHandler,
  asyncErrorHandler,
  validateRequest,
  requestLogger,
  errorUtils,
  ERROR_TYPES,
};
