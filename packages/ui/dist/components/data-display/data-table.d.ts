interface DataTableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}
interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    className?: string;
}
export declare function DataTable<T extends Record<string, any>>({ data, columns, searchable, searchPlaceholder, onRowClick, className, }: DataTableProps<T>): import("react").JSX.Element;
interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    className?: string;
}
export declare function StatCard({ title, value, description, icon: Icon, trend, className, }: StatCardProps): import("react").JSX.Element;
interface EmptyStateProps {
    icon?: React.ComponentType<{
        className?: string;
    }>;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}
export declare function EmptyState({ icon: Icon, title, description, action, className, }: EmptyStateProps): import("react").JSX.Element;
export {};
