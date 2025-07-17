import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Generar ID único para el request
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as any).id = requestId;

  // Log del inicio del request
  logger.info('HTTP Request Start', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Interceptar el final de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('HTTP Request End', {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    });
  });

  next();
};
