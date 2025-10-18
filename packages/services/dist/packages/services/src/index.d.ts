/**
 * @fileoverview Shared services and API clients for the facturacion-autonomos project
 * @version 1.0.0
 */
import { Client, Invoice, User } from '@facturacion/core';
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    headers?: Record<string, string>;
}
export declare class HttpClient {
    private config;
    constructor(config: ApiConfig);
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    put<T>(endpoint: string, data: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare class AuthService {
    private httpClient;
    constructor(config: ApiConfig);
    login(email: string, password: string): Promise<{
        token: string;
        user: User;
    }>;
    register(userData: Partial<User>): Promise<{
        token: string;
        user: User;
    }>;
    logout(): Promise<void>;
    refreshToken(): Promise<{
        token: string;
    }>;
}
export declare class InvoiceService {
    private httpClient;
    constructor(config: ApiConfig);
    getInvoices(): Promise<Invoice[]>;
    getInvoice(id: string): Promise<Invoice>;
    createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice>;
    updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice>;
    deleteInvoice(id: string): Promise<void>;
    generatePDF(id: string): Promise<Blob>;
}
export declare class ClientService {
    private httpClient;
    constructor(config: ApiConfig);
    getClients(): Promise<Client[]>;
    getClient(id: string): Promise<Client>;
    createClient(clientData: Partial<Client>): Promise<Client>;
    updateClient(id: string, clientData: Partial<Client>): Promise<Client>;
    deleteClient(id: string): Promise<void>;
}
export declare class TaxCalculatorService {
    private httpClient;
    constructor(config: ApiConfig);
    calculateTax(data: {
        income: number;
        expenses: number;
        taxYear: number;
        taxpayerType: 'individual' | 'company';
    }): Promise<{
        grossIncome: number;
        netIncome: number;
        irpf: number;
        vat: number;
        socialSecurity: number;
        totalTax: number;
        netAfterTax: number;
    }>;
    getTaxTypes(): Promise<Array<{
        id: string;
        name: string;
        description: string;
    }>>;
}
export declare class ServiceFactory {
    private config;
    constructor(config: ApiConfig);
    createAuthService(): AuthService;
    createInvoiceService(): InvoiceService;
    createClientService(): ClientService;
    createTaxCalculatorService(): TaxCalculatorService;
}
export declare const DEFAULT_API_CONFIG: ApiConfig;
export declare const TAX_CALCULATOR_CONFIG: ApiConfig;
declare const _default: {
    HttpClient: typeof HttpClient;
    AuthService: typeof AuthService;
    InvoiceService: typeof InvoiceService;
    ClientService: typeof ClientService;
    TaxCalculatorService: typeof TaxCalculatorService;
    ServiceFactory: typeof ServiceFactory;
    DEFAULT_API_CONFIG: ApiConfig;
    TAX_CALCULATOR_CONFIG: ApiConfig;
};
export default _default;
export declare const servicesVersion = "1.0.0";
export { CertificateManager, CertificateData } from './digital-signing/certificate-manager';
export { XmlDSigSigner } from './digital-signing/xmldsig-signer';
export { TimestampService, TimestampServiceConfig } from './digital-signing/timestamp-service';
//# sourceMappingURL=index.d.ts.map