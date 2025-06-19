// This file would be shared or its content accessible by both frontend and backend
export interface QuarterlyFinancials {
  quarter: string // e.g., "T1 2024"
  income: number
  expenses: number
  vatPaid: number // Net VAT paid/refunded for Modelo 303
  irpfPaid: number // For Modelo 130
}

export interface TaxProjection {
  nextQuarter: string
  projectedVat: number
  projectedIrpf: number
}

export interface ProjectionAdvice {
  id: string
  text: string
  type: "vat" | "irpf" | "general"
  severity: "info" | "suggestion" | "warning" // For styling/icon
  relatedValue?: number
  valueUnit?: "EUR" | "percentage"
}

// Response type for historical data endpoint
export interface HistoricalDataResponse {
  data: QuarterlyFinancials[]
}

// Response type for projections endpoint
export interface ProjectionResponse {
  projection: TaxProjection
  advice: ProjectionAdvice[]
}
