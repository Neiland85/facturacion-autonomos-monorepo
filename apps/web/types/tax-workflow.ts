export interface QuarterlyActivityData {
  period: string // e.g., "T1 2024"
  totalIncome: number
  totalExpenses: number
  netProfit: number
  transactionsCount: number
}

export interface TaxFormField {
  id: string // e.g., "m303_casilla_28"
  label: string
  value: number | string | null // string for descriptive fields, number for amounts
  calculatedValue?: number // if the system auto-calculates it
  isEditable?: boolean // Some fields might be, others purely informational
  validationStatus?: "ok" | "warning" | "error" | "info"
  validationMessage?: string
  tooltip?: string // For explanations
}

export interface Modelo303Data {
  period: string
  regimenGeneral: {
    baseImponibleRepercutido: TaxFormField[] // Multiple for different tax rates
    cuotaRepercutida: TaxFormField[]
    baseImponibleSoportado: TaxFormField[]
    cuotaSoportada: TaxFormField[]
  }
  totalCuotaDevengada: TaxFormField // Sum of cuotas repercutidas
  totalCuotasDeducibles: TaxFormField // Sum of cuotas soportadas
  resultadoRegimenGeneral: TaxFormField // Devengada - Deducible
  // ... other relevant fields like compensaciones, a devolver, a ingresar
  resultadoFinal: TaxFormField // The final amount to pay or get back
}

export interface Modelo130Data {
  period: string
  rendimientosActividad: {
    ingresosComputables: TaxFormField
    gastosDeducibles: TaxFormField
    rendimientoNetoPrevio: TaxFormField
    reducciones?: TaxFormField // e.g., 7% for general expenses
    rendimientoNetoActividad: TaxFormField
  }
  liquidación: {
    baseCalculoPagoFraccionado: TaxFormField // Sum of rendimientos
    porcentajeAplicable: TaxFormField // Usually 20%
    pagoFraccionadoPrevio: TaxFormField
    deducciones?: TaxFormField // e.g., retenciones soportadas
    resultadoPagoFraccionado: TaxFormField // Amount to pay
  }
}

export interface AIWarning {
  id: string
  message: string
  severity: "info" | "warning" | "critical"
  relatedFieldIds?: string[] // Link to specific form fields
  suggestion?: string // Actionable suggestion
}

export interface FilingAdviceItem {
  id: string
  title: string
  description: string
  category: "deadline" | "documentation" | "deduction" | "general"
  link?: string // Optional link to more info
}

export interface TaxWorkflowData {
  activitySummary: QuarterlyActivityData
  modelo303?: Modelo303Data // Optional initially, then populated
  modelo130?: Modelo130Data // Optional initially, then populated
  aiWarnings: AIWarning[]
  filingAdvice: FilingAdviceItem[]
}
