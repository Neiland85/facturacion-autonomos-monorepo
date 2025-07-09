import type { ClientFilters, InvoiceFilters, InvoiceStats, MonthlyRevenue } from './types';
export declare const invoiceHelpers: {
    getFilteredInvoices(filters?: InvoiceFilters): Promise<({
        client: {
            name: string;
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            nifCif: string;
            address: string | null;
            city: string | null;
            postalCode: string | null;
            province: string | null;
            phone: string | null;
        };
        company: {
            name: string;
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            address: string;
            city: string;
            postalCode: string;
            province: string;
            phone: string | null;
            cif: string;
            website: string | null;
            taxRegime: import("@/generated").$Enums.TaxRegime;
            vatNumber: string | null;
        };
        lines: {
            id: string;
            description: string;
            quantity: import("@/generated/runtime/library").Decimal;
            unitPrice: import("@/generated/runtime/library").Decimal;
            vatRate: import("@/generated/runtime/library").Decimal;
            amount: import("@/generated/runtime/library").Decimal;
            invoiceId: string;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        series: string;
        issueDate: Date;
        dueDate: Date | null;
        subtotal: import("@/generated/runtime/library").Decimal;
        vatAmount: import("@/generated/runtime/library").Decimal;
        total: import("@/generated/runtime/library").Decimal;
        status: import("@/generated").$Enums.InvoiceStatus;
        paidAt: Date | null;
        siiSent: boolean;
        siiReference: string | null;
        siiSentAt: Date | null;
        companyId: string;
        clientId: string;
        userId: string;
        notes: string | null;
    })[]>;
    getInvoiceStats(userId: string): Promise<InvoiceStats>;
    getNextInvoiceNumber(userId: string, series?: string): Promise<string>;
};
export declare const clientHelpers: {
    getFilteredClients(userId: string, filters?: ClientFilters): Promise<({
        _count: {
            invoices: number;
        };
    } & {
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        nifCif: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
        province: string | null;
        phone: string | null;
    })[]>;
    getClientWithInvoices(clientId: string): Promise<({
        invoices: ({
            lines: {
                id: string;
                description: string;
                quantity: import("@/generated/runtime/library").Decimal;
                unitPrice: import("@/generated/runtime/library").Decimal;
                vatRate: import("@/generated/runtime/library").Decimal;
                amount: import("@/generated/runtime/library").Decimal;
                invoiceId: string;
            }[];
        } & {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            series: string;
            issueDate: Date;
            dueDate: Date | null;
            subtotal: import("@/generated/runtime/library").Decimal;
            vatAmount: import("@/generated/runtime/library").Decimal;
            total: import("@/generated/runtime/library").Decimal;
            status: import("@/generated").$Enums.InvoiceStatus;
            paidAt: Date | null;
            siiSent: boolean;
            siiReference: string | null;
            siiSentAt: Date | null;
            companyId: string;
            clientId: string;
            userId: string;
            notes: string | null;
        })[];
    } & {
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        nifCif: string;
        address: string | null;
        city: string | null;
        postalCode: string | null;
        province: string | null;
        phone: string | null;
    }) | null>;
};
export declare const analyticsHelpers: {
    getMonthlyRevenue(userId: string, year?: number): Promise<MonthlyRevenue[]>;
};
//# sourceMappingURL=helpers.d.ts.map