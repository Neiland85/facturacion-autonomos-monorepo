import { Request, Response } from 'express';
declare module 'express-session' {
    interface SessionData {
        userId?: string;
        isAuthenticated?: boolean;
        twoFactorPending?: boolean;
        loginAttempts?: number;
        lastLoginAttempt?: number;
    }
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                twoFactorEnabled?: boolean;
            };
        }
    }
}
export declare class AuthController {
    private authService;
    private jwtService;
    private twoFactorService;
    constructor();
    /**
     * Registrar nuevo usuario
     */
    register: (req: Request, res: Response) => Promise<void>;
    /**
     * Iniciar sesión con protección contra ataques de fuerza bruta
     */
    login: (req: Request, res: Response) => Promise<void>;
    /**
     * Cerrar sesión de forma segura
     */
    logout: (req: Request, res: Response) => Promise<void>;
    /**
     * Renovar token de acceso
     */
    refresh: (req: Request, res: Response) => Promise<void>;
    /**
     * Obtener información del usuario actual
     */
    me: (req: Request, res: Response) => Promise<void>;
    /**
     * Configurar autenticación de dos factores
     */
    setup2FA: (req: Request, res: Response) => Promise<void>;
    /**
     * Verificar código 2FA
     */
    verify2FA: (req: Request, res: Response) => Promise<void>;
    /**
     * Deshabilitar 2FA
     */
    disable2FA: (req: Request, res: Response) => Promise<void>;
    /**
     * Cambiar contraseña
     */
    changePassword: (req: Request, res: Response) => Promise<void>;
    /**
     * Configurar cookies seguras con JWT
     */
    private setSecureCookies;
    /**
     * Limpiar cookies de forma segura
     */
    private clearSecureCookies;
    /**
     * Manejar intento de login fallido
     */
    private handleFailedLogin;
    /**
     * Manejar login exitoso
     */
    private handleSuccessfulLogin;
}
//# sourceMappingURL=auth.controller.d.ts.map