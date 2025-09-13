import { NextFunction, Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        sessionId?: string;
    };
}
/**
 * Middleware para verificar JWT desde cookies HttpOnly
 */
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar roles específicos
 */
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar que el usuario es admin
 */
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar que el usuario es el propietario del recurso
 */
export declare const requireOwnership: (userIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para limpiar cookies de autenticación
 */
export declare const clearAuthCookies: (req: Request, res: Response, next: NextFunction) => void;
export type { AuthenticatedRequest };
//# sourceMappingURL=auth.middleware.d.ts.map