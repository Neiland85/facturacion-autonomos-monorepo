/**
 * @fileoverview Core business logic and utilities for the facturacion-autonomos project
 * @version 1.0.0
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}
export interface Invoice {
    id: string;
    number: string;
    clientId: string;
    amount: number;
    vat: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    issueDate: Date;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const validateEmail: (email: string) => boolean;
export declare const validateTaxId: (taxId: string) => boolean;
export declare const formatCurrency: (amount: number) => string;
export declare const formatDate: (date: Date) => string;
export declare const VAT_RATES: {
    readonly GENERAL: 0.21;
    readonly REDUCED: 0.1;
    readonly SUPER_REDUCED: 0.04;
};
export declare const INVOICE_STATUS: {
    readonly DRAFT: "draft";
    readonly SENT: "sent";
    readonly PAID: "paid";
    readonly OVERDUE: "overdue";
};
export declare const calculateVAT: (amount: number, rate?: number) => number;
export declare const calculateTotalAmount: (amount: number, vatRate?: number) => number;
export declare const generateInvoiceNumber: () => string;
export declare class BusinessError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare const logger: {
    info: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string, data?: any) => void;
};
export { CalculadorFiscal } from './fiscal/calculador';
declare const _default: {
    validateEmail: (email: string) => boolean;
    validateTaxId: (taxId: string) => boolean;
    formatCurrency: (amount: number) => string;
    formatDate: (date: Date) => string;
    VAT_RATES: {
        readonly GENERAL: 0.21;
        readonly REDUCED: 0.1;
        readonly SUPER_REDUCED: 0.04;
    };
    INVOICE_STATUS: {
        readonly DRAFT: "draft";
        readonly SENT: "sent";
        readonly PAID: "paid";
        readonly OVERDUE: "overdue";
    };
    calculateVAT: (amount: number, rate?: number) => number;
    calculateTotalAmount: (amount: number, vatRate?: number) => number;
    generateInvoiceNumber: () => string;
    BusinessError: typeof BusinessError;
    logger: {
        info: (message: string, data?: any) => void;
        error: (message: string, error?: any) => void;
        warn: (message: string, data?: any) => void;
    };
};
export default _default;
export declare const version = "1.0.0";
//# sourceMappingURL=index.d.ts.map