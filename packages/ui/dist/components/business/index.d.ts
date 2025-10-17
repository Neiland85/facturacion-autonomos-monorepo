export { BusinessDashboard, QuickStats } from './dashboard';
export { InvoiceActions, InvoiceStats, QuickActions } from './invoice-actions';
export { ClientCard, InvoiceCard, InvoiceStatusBadge, PaymentStatusBadge, } from './invoice-client-cards';
export { QuickTaxCalculator, TaxCalculator } from './tax-calculator';
export type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'all' | 'pending' | 'paid' | 'overdue';
export interface Invoice {
    id: string;
    number: string;
    clientId: string;
    clientName: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    issueDate: string;
    dueDate: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    address?: string;
    totalInvoices: number;
    totalRevenue: number;
    outstandingAmount: number;
    createdAt: string;
}
export declare const formatCurrency: (amount: number) => string;
export declare const formatDate: (date: string | Date) => string;
export declare const formatDateTime: (date: string | Date) => string;
export declare const INVOICE_STATUS_CONFIG: {
    readonly draft: {
        readonly label: "Borrador";
        readonly color: "bg-yellow-100 text-yellow-800";
    };
    readonly sent: {
        readonly label: "Enviada";
        readonly color: "bg-blue-100 text-blue-800";
    };
    readonly paid: {
        readonly label: "Pagada";
        readonly color: "bg-green-100 text-green-800";
    };
    readonly overdue: {
        readonly label: "Vencida";
        readonly color: "bg-red-100 text-red-800";
    };
    readonly cancelled: {
        readonly label: "Cancelada";
        readonly color: "bg-gray-100 text-gray-800";
    };
};
export declare const PAYMENT_STATUS_CONFIG: {
    readonly pending: {
        readonly label: "Pendiente";
        readonly color: "bg-orange-100 text-orange-800";
    };
    readonly paid: {
        readonly label: "Pagado";
        readonly color: "bg-green-100 text-green-800";
    };
    readonly overdue: {
        readonly label: "Vencido";
        readonly color: "bg-red-100 text-red-800";
    };
};
export declare const calculateTax: (baseAmount: number, taxRate: number) => number;
export declare const calculateTotalWithTax: (baseAmount: number, taxRate: number) => number;
export declare const calculateTaxRate: (totalAmount: number, taxAmount: number) => number;
