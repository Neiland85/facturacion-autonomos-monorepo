export interface CertificateData {
    privateKey: string;
    certificate: string;
    publicKey: string;
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Gestiona la carga y el parseo de certificados digitales,
 * especialmente desde archivos P12/PFX, con validación y caché.
 */
export declare class CertificateManager {
    private static readonly certificateCache;
    private static readonly CACHE_TTL_MS;
    /**
     * Carga un certificado y su clave privada desde un archivo P12/PFX.
     * Utiliza caché si el certificado fue cargado recientemente.
     * @param p12Path - Ruta al archivo .p12 o .pfx.
     * @param password - Contraseña del archivo.
     * @returns Un objeto con los datos del certificado o null si hay un error.
     */
    static loadFromP12(p12Path: string, password: string): CertificateData | null;
    /**
     * Carga certificado y clave privada desde archivos PEM separados.
     * @param certPath - Ruta al archivo de certificado PEM
     * @param keyPath - Ruta al archivo de clave privada PEM
     * @returns Un objeto con los datos del certificado o null si hay un error
     */
    static loadFromPEM(certPath: string, keyPath: string): CertificateData | null;
    /**
     * Valida que un certificado sea válido y no esté expirado.
     * @param certData - Datos del certificado a validar
     * @returns Resultado de validación con lista de errores si aplica
     */
    static validateCertificate(certData: CertificateData): ValidationResult;
    /**
     * Limpia el caché de certificados
     */
    static clearCache(): void;
    /**
     * Obtiene información legible del certificado
     * @param certData - Datos del certificado
     * @returns String con información del certificado
     */
    static getCertificateInfo(certData: CertificateData): string;
    /**
     * Genera clave de caché segura para los parámetros
     */
    private static getCacheKey;
    /**
     * Verifica si una string está en formato PEM válido
     */
    private static isPemFormat;
}
//# sourceMappingURL=certificate-manager.d.ts.map