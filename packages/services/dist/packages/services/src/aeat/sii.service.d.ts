import { InvoiceWithDetails } from '@facturacion/database';
export interface SIIConfig {
    apiUrl: string;
    nif: string;
    testMode: boolean;
    certificatePath: string;
    certificatePassword: string;
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
}
export interface SIITaxDetail {
    rate: number;
    baseAmount: number;
    taxAmount: number;
}
export interface SIIInvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    year: number;
    period: string;
    companyNIF: string;
    companyName: string;
    clientNIF: string;
    clientName: string;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    taxDetails: SIITaxDetail[];
    operationType: string;
}
export interface SIIResponse {
    csv: string;
    estado: 'Correcto' | 'AceptadoConErrores' | 'Incorrecto';
    codigoErrorRegistro?: string;
    descripcionErrorRegistro?: string;
}
export interface SIISubmissionResult {
    success: boolean;
    csv?: string;
    errors?: string[];
    rawResponse?: string;
}
/**
 * SIIService - Real AEAT SII integration with SOAP XML transformation,
 * certificate-based authentication, and retry logic.
 */
export declare class SIIService {
    private axiosInstance;
    private certificate;
    private logger;
    private config;
    constructor(config: SIIConfig);
    /**
     * Initialize the service: load certificate and create HTTPS agent
     */
    private initialize;
    /**
     * Build SOAP envelope with AEAT format - Dynamic year/period and multiple tax rates
     */
    private buildSOAPEnvelope;
    private transformInvoiceToSII;
    /**
     * Parse AEAT SII response XML - Robust parsing with namespace handling
     */
    private parseSIIResponse;
    /**
     * Check if error is retryable
     */
    private shouldRetry;
    /**
     * Delay with exponential backoff
     */
    private delay;
    /**
     * Escape XML special characters
     */
    private escapeXml;
    /**
     * Transform invoice to SOAP XML
     */
    transformInvoice(invoice: InvoiceWithDetails): Promise<string>;
    /**
     * Send SOAP XML to AEAT with retry logic
     */
    sendToAEAT(soapXml: string): Promise<SIISubmissionResult>;
    /**
     * High-level method: transform and submit invoice
     */
    submitInvoice(invoice: InvoiceWithDetails): Promise<SIISubmissionResult>;
}
/**
 * Factory function to create SIIService instance with config from environment
 */
export declare function createSIIService(config?: Partial<SIIConfig>): SIIService;
//# sourceMappingURL=sii.service.d.ts.map