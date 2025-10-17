export { BarChart, LineChart, PieChart } from './basic-charts';
export { CashFlowChart, InvoiceStatusChart, MonthlyComparison, RevenueChart, } from './business-charts';
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}
export interface TimeSeriesDataPoint extends ChartDataPoint {
    date?: string;
    month?: string;
}
export declare const formatChartValue: (value: number, type?: "currency" | "percentage" | "number") => string;
export declare const generateChartColors: (count: number) => string[];
export declare const calculatePercentages: (data: ChartDataPoint[]) => ChartDataPoint[];
export declare const truncateLabel: (label: string, maxLength?: number) => string;
export declare const CHART_DEFAULTS: {
    readonly barChart: {
        readonly height: 300;
        readonly showValues: true;
        readonly barSpacing: 0.8;
    };
    readonly lineChart: {
        readonly height: 300;
        readonly showPoints: true;
        readonly showArea: false;
        readonly strokeWidth: 3;
    };
    readonly pieChart: {
        readonly size: 200;
        readonly showLabels: true;
        readonly showLegend: true;
        readonly minPercentageForLabel: 5;
    };
    readonly businessCharts: {
        readonly height: 300;
        readonly animationDuration: 800;
        readonly delayBetweenItems: 100;
    };
};
export declare const animateValue: (startValue: number, endValue: number, duration: number, callback: (value: number) => void) => (() => void);
