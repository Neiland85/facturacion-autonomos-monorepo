export interface SignerOptions {
    strictValidation?: boolean;
    allowedAlgorithms?: string[];
    includeKeyInfo?: boolean;
}
export interface VerificationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Proporciona funcionalidades para firmar y verificar documentos XML
 * utilizando el estándar XMLDSig.
 */
export declare class XmlDSigSigner {
    private options;
    constructor(options?: SignerOptions);
    /**
     * Firma un documento XML con una firma de tipo "enveloped".
     * La firma se inserta dentro del propio documento XML.
     *
     * @param xml - El documento XML a firmar (como string).
     * @param privateKeyPem - La clave privada en formato PEM.
     * @param certificatePem - El certificado público en formato PEM.
     * @returns El documento XML firmado (como string).
     * @throws Error si la validación falla
     */
    sign(xml: string, privateKeyPem: string, certificatePem: string): string;
    /**
     * Verifica la firma de un documento XML.
     *
     * @param signedXml - El documento XML firmado.
     * @returns Resultado detallado de la verificación.
     */
    verify(signedXml: string): VerificationResult;
    /**
     * Extrae el certificado embebido en la firma XML
     * @param signedXml - Documento XML firmado
     * @returns Certificado en formato PEM o null
     */
    extractCertificateFromSignature(signedXml: string): string | null;
    /**
     * Asegura que el elemento raíz tenga un atributo Id estable
     */
    private ensureRootId;
    /**
     * Encuentra todos los nodos de firma en el XML
     */
    private findAllSignatureNodes;
    /**
     * Valida que la referencia de la firma coincide con el documento
     */
    private validateReference;
    /**
     * Valida que los algoritmos usados son seguros
     */
    private validateAlgorithms;
    /**
     * Verifica si una string está bien formada como XML
     */
    private isWellFormedXml;
    /**
     * Verifica si una string está en formato PEM válido
     */
    private isPemFormat;
}
//# sourceMappingURL=xmldsig-signer.d.ts.map