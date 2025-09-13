import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Error de validación de Joi
  if (err.isJoi) {
    res.status(400).json({
      error: 'Validation error',
      details: err.details.map((detail: any) => detail.message),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Error por defecto
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: message,
    }),
    timestamp: new Date().toISOString(),
  });
};
