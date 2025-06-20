import { NextResponse, type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { TaxReportingStructure, OCRInvoiceData, ExpenseCategory, IncomeCategory } from "@/types/ocr"

// Validación de la variable de entorno
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("postgresql://")) {
  throw new Error("DATABASE_URL debe tener el formato correcto: postgresql://user:password@host.tld/dbname")
}
const sql = neon(process.env.DATABASE_URL!)

function getCurrentQuarter(): { quarter: string; year: number } {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  let quarter: string
  if (month <= 3) quarter = "T1"
  else if (month <= 6) quarter = "T2"
  else if (month <= 9) quarter = "T3"
  else quarter = "T4"

  return { quarter, year }
}

/**
 * GET /tax-reporting/structure
 * Devuelve la estructura fiscal agregada para un usuario y periodo
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const quarterParam = searchParams.get("quarter")
    const yearParam = searchParams.get("year")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 401 })
    }

    const { quarter: currentQuarter, year: currentYear } = getCurrentQuarter()
    const targetQuarter = quarterParam || currentQuarter
    const targetYear = yearParam ? Number.parseInt(yearParam, 10) : currentYear

    // Consulta de facturas procesadas
    const invoicesResult = await sql`
      SELECT 
        invoice_data,
        processed_at,
        confidence_score
      FROM processed_invoices 
      WHERE user_id = ${userId}
      AND quarter = ${targetQuarter}
      AND year = ${targetYear}
      ORDER BY processed_at DESC;
    `

    const processedInvoices: OCRInvoiceData[] = invoicesResult.map((row: any) => JSON.parse(row.invoice_data))

    // Inicialización de agregados
    let vatCollected = 0
    let vatPaid = 0
    let totalIncome = 0
    let totalExpenses = 0

    const expensesByCategory: Record<ExpenseCategory, { totalAmount: number; vatDeductible: number; invoiceCount: number; averageAmount: number }> = {
      office_supplies: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      professional_services: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      travel_accommodation: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      meals_entertainment: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      equipment_software: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      utilities: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      rent: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      insurance: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      marketing_advertising: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      training_education: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      telecommunications: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      vehicle_transport: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
      other_deductible: { totalAmount: 0, vatDeductible: 0, invoiceCount: 0, averageAmount: 0 },
    }

    const incomeByCategory: Record<IncomeCategory, { totalAmount: number; vatCollected: number; invoiceCount: number; averageAmount: number }> = {
      professional_services: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
      product_sales: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
      consulting: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
      training_workshops: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
      licenses_royalties: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
      other_income: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
    }

    // Procesar cada factura
    processedInvoices.forEach((invoice) => {
      const amount = invoice.totalAmount || 0
      const vatAmount = invoice.vatAmount || 0
      const deductibilityFactor = (invoice.deductibilityPercentage || 100) / 100

      if (invoice.taxCategory.type === "expense") {
        const category = invoice.taxCategory.category as ExpenseCategory
        if (expensesByCategory[category]) {
          expensesByCategory[category].totalAmount += amount
          expensesByCategory[category].vatDeductible += vatAmount * deductibilityFactor
          expensesByCategory[category].invoiceCount += 1
          totalExpenses += amount
          vatPaid += vatAmount * deductibilityFactor
        }
      } else if (invoice.taxCategory.type === "income") {
        const category = invoice.taxCategory.category as IncomeCategory
        if (incomeByCategory[category]) {
          incomeByCategory[category].totalAmount += amount
          incomeByCategory[category].vatCollected += vatAmount
          incomeByCategory[category].invoiceCount += 1
          totalIncome += amount
          vatCollected += vatAmount
        }
      }
    })

    // Calcular promedios
    Object.values(expensesByCategory).forEach((cat) => {
      if (cat.invoiceCount > 0) {
        cat.averageAmount = cat.totalAmount / cat.invoiceCount
      }
    })
    Object.values(incomeByCategory).forEach((cat) => {
      if (cat.invoiceCount > 0) {
        cat.averageAmount = cat.totalAmount / cat.invoiceCount
      }
    })

    const deductibleExpenses = totalExpenses
    const netIncome = totalIncome - deductibleExpenses
    const estimatedIRPF = Math.max(0, netIncome * 0.2)

    const taxReportingStructure: TaxReportingStructure = {
      quarter: targetQuarter,
      year: targetYear,
      vatCollected,
      vatPaid,
      vatNetPosition: vatCollected - vatPaid,
      totalIncome,
      deductibleExpenses,
      netIncome,
      estimatedIRPF,
      expensesByCategory,
      incomeByCategory,
      processedInvoices,
      validationSummary: {
        totalProcessed: processedInvoices.length,
        successfulExtractions: processedInvoices.filter((inv) => inv.confidence >= 0.7).length,
        requiresManualReview: processedInvoices.filter((inv) => inv.confidence < 0.7).length,
        avgConfidenceScore:
          processedInvoices.length > 0
            ? processedInvoices.reduce((sum, inv) => sum + inv.confidence, 0) / processedInvoices.length
            : 0,
      },
    }

    return NextResponse.json(taxReportingStructure, { status: 200 })
  } catch (error) {
    console.error("Error generating tax reporting structure:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
