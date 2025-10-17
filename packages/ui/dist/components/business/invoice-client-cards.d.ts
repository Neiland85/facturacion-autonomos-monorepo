export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "partial" | "overdue";
interface Invoice {
    id: string;
    number: string;
    client: string;
    amount: number;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    issueDate: string;
    dueDate: string;
    description?: string;
}
interface InvoiceCardProps {
    invoice: Invoice;
    onView?: (invoice: Invoice) => void;
    onEdit?: (invoice: Invoice) => void;
    onDelete?: (invoice: Invoice) => void;
    onSend?: (invoice: Invoice) => void;
    className?: string;
}
export declare function InvoiceStatusBadge({ status }: {
    status: InvoiceStatus;
}): import("react").JSX.Element;
export declare function PaymentStatusBadge({ status }: {
    status: PaymentStatus;
}): import("react").JSX.Element;
export declare function InvoiceCard({ invoice, onView, onEdit, onDelete, onSend, className, }: InvoiceCardProps): import("react").JSX.Element;
interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
    address?: string;
    totalInvoices: number;
    totalAmount: number;
    outstandingAmount: number;
}
interface ClientCardProps {
    client: Client;
    onView?: (client: Client) => void;
    onEdit?: (client: Client) => void;
    onCreateInvoice?: (client: Client) => void;
    className?: string;
}
export declare function ClientCard({ client, onView, onEdit, onCreateInvoice, className, }: ClientCardProps): import("react").JSX.Element;
export {};
