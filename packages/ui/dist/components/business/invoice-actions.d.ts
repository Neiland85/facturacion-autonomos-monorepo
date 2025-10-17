interface InvoiceActionsProps {
    invoiceId: string;
    invoiceStatus: string;
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onSend?: (id: string) => void;
    onDownload?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    className?: string;
}
export declare function InvoiceActions({ invoiceId, invoiceStatus, onView, onEdit, onDelete, onSend, onDownload, onDuplicate, className, }: InvoiceActionsProps): import("react").JSX.Element;
interface QuickActionsProps {
    onNewInvoice?: () => void;
    onNewClient?: () => void;
    onImport?: () => void;
    onExport?: () => void;
    className?: string;
}
export declare function QuickActions({ onNewInvoice, onNewClient, onImport, onExport, className, }: QuickActionsProps): import("react").JSX.Element;
interface InvoiceStatsProps {
    totalInvoices: number;
    totalAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    className?: string;
}
export declare function InvoiceStats({ totalInvoices, totalAmount, pendingAmount, overdueAmount, className, }: InvoiceStatsProps): import("react").JSX.Element;
export {};
