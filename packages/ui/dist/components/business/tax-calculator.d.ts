interface TaxCalculation {
    baseAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    taxType: string;
}
interface TaxCalculatorProps {
    onCalculation?: (calculation: TaxCalculation) => void;
    defaultAmount?: number;
    defaultTaxRate?: number;
    className?: string;
}
export declare function TaxCalculator({ onCalculation, defaultAmount, defaultTaxRate, className, }: TaxCalculatorProps): import("react").JSX.Element;
interface QuickTaxCalculatorProps {
    amount: number;
    taxRate?: number;
    taxType?: string;
    showDetails?: boolean;
    className?: string;
}
export declare function QuickTaxCalculator({ amount, taxRate, taxType, showDetails, className, }: QuickTaxCalculatorProps): import("react").JSX.Element;
export {};
