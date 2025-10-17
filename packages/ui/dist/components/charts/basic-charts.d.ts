interface BarChartProps {
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    title?: string;
    height?: number;
    showValues?: boolean;
    className?: string;
}
export declare function BarChart({ data, title, height, showValues, className, }: BarChartProps): import("react").JSX.Element;
interface LineChartProps {
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    title?: string;
    height?: number;
    showPoints?: boolean;
    showArea?: boolean;
    className?: string;
}
export declare function LineChart({ data, title, height, showPoints, showArea, className, }: LineChartProps): import("react").JSX.Element;
interface PieChartProps {
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    title?: string;
    size?: number;
    showLabels?: boolean;
    showLegend?: boolean;
    className?: string;
}
export declare function PieChart({ data, title, size, showLabels, showLegend, className, }: PieChartProps): import("react").JSX.Element;
export {};
