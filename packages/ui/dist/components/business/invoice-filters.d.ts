export type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'all' | 'pending' | 'paid' | 'overdue';
interface InvoiceFilters {
    search: string;
    status: InvoiceStatus;
    paymentStatus: PaymentStatus;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
    clientId: string;
}
interface InvoiceFiltersProps {
    filters: InvoiceFilters;
    onFiltersChange: (filters: InvoiceFilters) => void;
    onReset: () => void;
    className?: string;
}
export declare function InvoiceFilters({ filters, onFiltersChange, onReset, className, }: InvoiceFiltersProps): import("react").JSX.Element;
interface InvoiceSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}
export declare function InvoiceSearch({ value, onChange, placeholder, className, }: InvoiceSearchProps): import("react").JSX.Element;
interface FilterChipsProps {
    filters: InvoiceFilters;
    onRemoveFilter: (key: keyof InvoiceFilters) => void;
    className?: string;
}
export declare function FilterChips({ filters, onRemoveFilter, className, }: FilterChipsProps): import("react").JSX.Element;
export {};
