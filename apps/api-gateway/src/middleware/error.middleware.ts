import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: (req as any).id,
    timestamp: new Date().toISOString()
  });

  // Determinar código de estado
  const statusCode = error.statusCode || 500;
  
  // Determinar si mostrar detalles del error
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Respuesta base
  const errorResponse: any = {
    error: true,
    message: statusCode === 500 && !isDevelopment 
      ? 'Error interno del servidor' 
      : error.message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Agregar detalles adicionales en desarrollo
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      name: error.name
    };
  }

  // Agregar ID de request si existe
  if ((req as any).id) {
    errorResponse.requestId = (req as any).id;
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const error = {
    error: true,
    message: 'Endpoint no encontrado',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Verificar la URL',
      'Consultar la documentación en /docs',
      'Verificar el método HTTP'
    ]
  };

  logger.warn('404 - Endpoint no encontrado', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  res.status(404).json(error);
};

export const createAppError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
