export interface CertificateData {
    privateKey: string;
    certificate: string;
    publicKey: string;
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
}
/**
 * Gestiona la carga y el parseo de certificados digitales,
 * especialmente desde archivos P12/PFX.
 */
export declare class CertificateManager {
    /**
     * Carga un certificado y su clave privada desde un archivo P12/PFX.
     * @param p12Path - Ruta al archivo .p12 o .pfx.
     * @param password - Contraseña del archivo.
     * @returns Un objeto con los datos del certificado o null si hay un error.
     */
    static loadFromP12(p12Path: string, password: string): CertificateData | null;
}
//# sourceMappingURL=certificate-manager.d.ts.map