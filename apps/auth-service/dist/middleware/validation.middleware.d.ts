import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
/**
 * Esquemas de validación con Zod
 */
export declare const schemas: {
    register: z.ZodObject<{
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
            name: string;
        }, {
            email: string;
            password: string;
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            password: string;
            name: string;
        };
    }, {
        body: {
            email: string;
            password: string;
            name: string;
        };
    }>;
    login: z.ZodObject<{
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            password: string;
        };
    }, {
        body: {
            email: string;
            password: string;
        };
    }>;
    verify2FA: z.ZodObject<{
        body: z.ZodObject<{
            token: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            token: string;
        }, {
            token: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            token: string;
        };
    }, {
        body: {
            token: string;
        };
    }>;
    setup2FA: z.ZodObject<{
        body: z.ZodObject<{
            token: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            token: string;
        }, {
            token: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            token: string;
        };
    }, {
        body: {
            token: string;
        };
    }>;
    changePassword: z.ZodObject<{
        body: z.ZodObject<{
            currentPassword: z.ZodString;
            newPassword: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currentPassword: string;
            newPassword: string;
        }, {
            currentPassword: string;
            newPassword: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            currentPassword: string;
            newPassword: string;
        };
    }, {
        body: {
            currentPassword: string;
            newPassword: string;
        };
    }>;
    refreshToken: z.ZodObject<{
        body: z.ZodObject<{
            refreshToken: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            refreshToken?: string | undefined;
        }, {
            refreshToken?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            refreshToken?: string | undefined;
        };
    }, {
        body: {
            refreshToken?: string | undefined;
        };
    }>;
};
/**
 * Middleware genérico de validación con Zod
 */
export declare const validate: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para sanitizar entrada
 */
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para validar headers requeridos
 */
export declare const validateHeaders: (requiredHeaders: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para validar Content-Type
 */
export declare const validateContentType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para limitar tamaño del payload
 */
export declare const validatePayloadSize: (maxSizeKB: number) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para validar IP whitelist (opcional)
 */
export declare const validateIPWhitelist: (allowedIPs: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para validar User-Agent (prevenir bots básicos)
 */
export declare const validateUserAgent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validadores específicos exportados
 */
export declare const validateRegister: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateVerify2FA: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateSetup2FA: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateChangePassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRefreshToken: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map