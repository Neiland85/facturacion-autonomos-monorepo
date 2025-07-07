import { NextFunction, Request, Response } from 'express';

/**
 * Wrapper para manejo de errores async/await en rutas de Express
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
