interface TwoFactorSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
export declare class TwoFactorService {
    private readonly serviceName;
    private readonly issuer;
    /**
     * Generar secreto 2FA y código QR para el usuario
     */
    generateTwoFactorSecret(userId: string, userEmail: string): Promise<TwoFactorSetup>;
    /**
     * Verificar código 2FA y confirmar setup
     */
    verifyAndEnableCode(userId: string, token: string): Promise<boolean>;
    /**
     * Verificar código 2FA durante login
     */
    verifyCode(userId: string, token: string): Promise<boolean>;
    /**
     * Verificar código de backup
     */
    private verifyBackupCode;
    /**
     * Deshabilitar 2FA para un usuario
     */
    disable2FA(userId: string): Promise<boolean>;
    /**
     * Generar nuevos códigos de backup
     */
    regenerateBackupCodes(userId: string): Promise<string[]>;
    /**
     * Obtener estado 2FA del usuario
     */
    get2FAStatus(userId: string): Promise<{
        enabled: boolean;
        backupCodesRemaining?: number;
        lastUsed?: string;
    }>;
    /**
     * Generar códigos de backup seguros
     */
    private generateBackupCodes;
    /**
     * Verificar si un código es un código de backup (8 caracteres hex)
     */
    private isBackupCode;
    /**
     * Limpiar configuraciones 2FA expiradas
     */
    cleanup2FASetups(): Promise<void>;
    /**
     * Validar formato de código TOTP
     */
    isValidTOTPFormat(token: string): boolean;
    /**
     * Obtener tiempo restante para el próximo código TOTP
     */
    getTimeRemaining(): number;
}
export {};
//# sourceMappingURL=two-factor.service.d.ts.map