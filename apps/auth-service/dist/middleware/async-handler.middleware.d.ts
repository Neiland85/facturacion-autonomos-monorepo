import { NextFunction, Request, Response } from 'express';
/**
 * Middleware para manejar errores en funciones async
 * Envuelve controladores async para capturar errores automáticamente
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=async-handler.middleware.d.ts.map