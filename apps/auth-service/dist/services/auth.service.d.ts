interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface CreateUserData {
    email: string;
    password: string;
    name: string;
}
export declare class AuthService {
    private readonly saltRounds;
    /**
     * Crear nuevo usuario con contraseña hasheada de forma segura
     */
    createUser(data: CreateUserData): Promise<User>;
    /**
     * Buscar usuario por email
     */
    findUserByEmail(email: string): Promise<User | null>;
    /**
     * Buscar usuario por ID
     */
    findUserById(id: string): Promise<User | null>;
    /**
     * Habilitar 2FA para un usuario
     */
    enable2FA(userId: string): Promise<void>;
    /**
     * Deshabilitar 2FA para un usuario
     */
    disable2FA(userId: string): Promise<void>;
    /**
     * Cambiar contraseña del usuario
     */
    changePassword(userId: string, newPassword: string): Promise<void>;
    /**
     * Verificar fortaleza de contraseña
     */
    validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Invalidar todas las sesiones de un usuario
     */
    private invalidateUserSessions;
    /**
     * Generar ID seguro para usuario
     */
    private generateSecureId;
    /**
     * Verificar si el email es válido
     */
    isValidEmail(email: string): boolean;
    /**
     * Sanitizar entrada de usuario
     */
    sanitizeInput(input: string): string;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map