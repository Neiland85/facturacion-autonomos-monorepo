interface BusinessDashboardProps {
    metrics: {
        totalRevenue: number;
        monthlyRevenue: number;
        totalInvoices: number;
        pendingInvoices: number;
        totalClients: number;
        overdueInvoices: number;
        averageInvoiceValue: number;
        collectionRate: number;
    };
    className?: string;
}
export declare function BusinessDashboard({ metrics, className, }: BusinessDashboardProps): import("react").JSX.Element;
interface QuickStatsProps {
    stats: {
        todayRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        pendingPayments: number;
        overduePayments: number;
    };
    className?: string;
}
export declare function QuickStats({ stats, className, }: QuickStatsProps): import("react").JSX.Element;
export {};
