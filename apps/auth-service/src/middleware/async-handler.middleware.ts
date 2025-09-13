import { NextFunction, Request, Response } from 'express';

/**
 * Middleware para manejar errores en funciones async
 * Envuelve controladores async para capturar errores automáticamente
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
