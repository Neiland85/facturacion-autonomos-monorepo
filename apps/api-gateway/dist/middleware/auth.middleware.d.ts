import { NextFunction, Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        roles: string[];
        permissions: string[];
    };
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requirePermission: (...permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateApiKey: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { AuthenticatedRequest };
//# sourceMappingURL=auth.middleware.d.ts.map