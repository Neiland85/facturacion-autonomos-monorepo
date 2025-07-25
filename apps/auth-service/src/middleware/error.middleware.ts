import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Middleware central de manejo de errores para Auth Service
 * Proporciona respuestas consistentes y logging de errores
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`Error en ${req.method} ${req.path}:`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Errores de validación Zod
  if (error instanceof ZodError) {
    errorResponse.message = 'Datos de entrada inválidos';
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    res.status(400).json(errorResponse);
    return;
  }

  // Errores de autenticación
  if (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized')) {
    errorResponse.message = 'No autorizado. Token inválido o expirado';
    errorResponse.code = 'UNAUTHORIZED';
    res.status(401).json(errorResponse);
    return;
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    errorResponse.message = 'Token inválido';
    errorResponse.code = 'INVALID_TOKEN';
    res.status(401).json(errorResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expirado';
    errorResponse.code = 'TOKEN_EXPIRED';
    res.status(401).json(errorResponse);
    return;
  }

  // Errores de duplicación (usuario ya existe)
  if (error.message.includes('duplicate') || error.message.includes('already exists')) {
    errorResponse.message = 'El recurso ya existe';
    errorResponse.code = 'DUPLICATE_RESOURCE';
    res.status(409).json(errorResponse);
    return;
  }

  // Errores de no encontrado
  if (error.message.includes('not found') || error.message.includes('Not found')) {
    errorResponse.message = 'Recurso no encontrado';
    errorResponse.code = 'NOT_FOUND';
    res.status(404).json(errorResponse);
    return;
  }

  // Errores de rate limiting
  if (error.message.includes('Too many requests')) {
    errorResponse.message = 'Demasiadas solicitudes. Intenta de nuevo más tarde';
    errorResponse.code = 'RATE_LIMIT_EXCEEDED';
    res.status(429).json(errorResponse);
    return;
  }

  // Errores de Redis/conexión
  if (error.message.includes('Redis') || error.message.includes('ECONNREFUSED')) {
    errorResponse.message = 'Error de conexión con el servidor. Intenta de nuevo';
    errorResponse.code = 'CONNECTION_ERROR';
    res.status(503).json(errorResponse);
    return;
  }

  // Error de CORS
  if (error.message.includes('CORS')) {
    errorResponse.message = 'Origen no permitido por políticas CORS';
    errorResponse.code = 'CORS_ERROR';
    res.status(403).json(errorResponse);
    return;
  }

  // Errores específicos del servicio
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      errorResponse.message = 'Credenciales inválidas';
      errorResponse.code = 'INVALID_CREDENTIALS';
      res.status(401).json(errorResponse);
      return;

    case 'ACCOUNT_LOCKED':
      errorResponse.message = 'Cuenta bloqueada por exceso de intentos fallidos';
      errorResponse.code = 'ACCOUNT_LOCKED';
      res.status(423).json(errorResponse);
      return;

    case 'TWO_FACTOR_REQUIRED':
      errorResponse.message = 'Código de autenticación de dos factores requerido';
      errorResponse.code = 'TWO_FACTOR_REQUIRED';
      res.status(206).json(errorResponse); // 206 Partial Content
      return;

    case 'INVALID_2FA_CODE':
      errorResponse.message = 'Código de autenticación inválido';
      errorResponse.code = 'INVALID_2FA_CODE';
      res.status(400).json(errorResponse);
      return;

    case 'SESSION_EXPIRED':
      errorResponse.message = 'Sesión expirada. Por favor inicia sesión nuevamente';
      errorResponse.code = 'SESSION_EXPIRED';
      res.status(401).json(errorResponse);
      return;

    default:
      // Error genérico del servidor
      errorResponse.message = process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor'
        : error.message || 'Error desconocido';
      
      errorResponse.code = 'INTERNAL_SERVER_ERROR';
      
      // En desarrollo, incluir más detalles
      if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = {
          stack: error.stack,
          name: error.name
        };
      }

      res.status(500).json(errorResponse);
      return;
  }
};

/**
 * Wrapper para funciones async para capturar errores automáticamente
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware para capturar errores 404
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: `Endpoint ${req.method} ${req.path} no encontrado`,
    code: 'ENDPOINT_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  res.status(404).json(errorResponse);
};

/**
 * Middleware para logging de errores críticos
 */
export const criticalErrorLogger = (error: any, req: Request): void => {
  // En producción, aquí enviarías a un servicio como Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 CRITICAL ERROR:', {
      message: error.message,
      stack: error.stack,
      url: `${req.method} ${req.path}`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      sessionId: req.sessionID
    });
  }
};
