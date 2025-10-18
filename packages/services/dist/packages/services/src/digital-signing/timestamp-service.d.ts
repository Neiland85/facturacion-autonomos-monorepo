export declare class TimestampError extends Error {
    code: 'TSA_UNAVAILABLE' | 'INVALID_RESPONSE' | 'TIMEOUT' | 'INVALID_XML';
    constructor(code: 'TSA_UNAVAILABLE' | 'INVALID_RESPONSE' | 'TIMEOUT' | 'INVALID_XML', message: string);
}
export interface TimestampServiceConfig {
    tsaUrl: string;
    timeout?: number;
    username?: string;
    password?: string;
    enableStub?: boolean;
}
/**
 * Servicio de sellado de tiempo RFC 3161 para firmas XML digitales.
 * Proporciona integración con servidores TSA (Time Stamping Authority).
 */
export declare class TimestampService {
    private config;
    private axiosInstance;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY_MS;
    constructor(config: TimestampServiceConfig);
    /**
     * Añade timestamp RFC 3161 a un XML firmado
     */
    addTimestamp(signedXml: string): Promise<string>;
    /**
     * Solicita timestamp a la TSA
     */
    private requestTimestamp;
    /**
     * Crea petición RFC 3161 (versión simplificada)
     */
    private createTimestampRequest;
    /**
     * Parsea respuesta RFC 3161 (versión simplificada)
     */
    private parseTimestampResponse;
    /**
     * Incrusta timestamp en XML firmado (formato XAdES)
     */
    private embedTimestampInXml;
    /**
     * Extrae el valor de firma del XML
     */
    private extractSignatureValue;
    /**
     * Añade timestamp simulado para desarrollo
     */
    private addStubTimestamp;
    /**
     * Delay con control preciso
     */
    private delay;
}
//# sourceMappingURL=timestamp-service.d.ts.map