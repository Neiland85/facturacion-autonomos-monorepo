interface RevenueChartProps {
    data: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
    }>;
    title?: string;
    height?: number;
    className?: string;
}
export declare function RevenueChart({ data, title, height, className, }: RevenueChartProps): import("react").JSX.Element;
interface InvoiceStatusChartProps {
    data: {
        draft: number;
        sent: number;
        paid: number;
        overdue: number;
        cancelled: number;
    };
    title?: string;
    className?: string;
}
export declare function InvoiceStatusChart({ data, title, className, }: InvoiceStatusChartProps): import("react").JSX.Element;
interface MonthlyComparisonProps {
    currentMonth: {
        revenue: number;
        invoices: number;
        clients: number;
    };
    previousMonth: {
        revenue: number;
        invoices: number;
        clients: number;
    };
    title?: string;
    className?: string;
}
export declare function MonthlyComparison({ currentMonth, previousMonth, title, className, }: MonthlyComparisonProps): import("react").JSX.Element;
interface CashFlowChartProps {
    data: Array<{
        date: string;
        inflow: number;
        outflow: number;
        balance: number;
    }>;
    title?: string;
    height?: number;
    className?: string;
}
export declare function CashFlowChart({ data, title, height, className, }: CashFlowChartProps): import("react").JSX.Element;
export {};
