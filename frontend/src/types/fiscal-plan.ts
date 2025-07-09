// Existing Advice interface (ensure it's here or imported if in another file)
export interface Advice {
  id: string
  text: string
  category: "expense" | "income" | "timing" | "compliance" | "general"
  severity: "low" | "medium" | "high" | "info"
  relatedExpenseCategory?: string
}

// New FiscalOptimizationPlanData interface
export interface FiscalOptimizationPlanData {
  planTitle: string
  currentQuarter: string
  generatedDate: string // ISO string
  fiscalRisk: {
    overall: "low" | "medium" | "high"
    details: Array<{
      area: string
      level: "low" | "medium" | "high"
      message: string
    }>
  }
  vatForecast: {
    period: string
    collected: number
    deductible: number
    payable: number
  }
  irpfForecast: {
    period: string
    totalIncome: number
    deductibleExpenses: number
    taxableBase: number
    effectiveRate: number // percentage, e.g., 18.5 for 18.5%
    estimatedTax: number
  }
  advice: Advice[]
  expenseBreakdown: Array<{
    category: string
    amount: number
    percentage: number // Percentage of total expenses
  }>
}
