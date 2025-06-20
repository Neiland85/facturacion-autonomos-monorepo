import { NextResponse, type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { QuarterlyFinancials, HistoricalDataResponse } from "@/types/tax-projection" // Adjust path if necessary

// Initialize the Neon client.
// The DATABASE_URL will be automatically picked up from environment variables.
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("postgresql://")) {
  throw new Error("DATABASE_URL debe tener el formato correcto: postgresql://user:password@host.tld/dbname")
}
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const quartersParam = searchParams.get("quarters")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 401 })
    }

    const numQuarters = quartersParam ? Number.parseInt(quartersParam, 10) : 3

    if (isNaN(numQuarters) || numQuarters <= 0 || numQuarters > 12) {
      return NextResponse.json({ message: "Invalid 'quarters' parameter. Must be between 1 and 12." }, { status: 400 })
    }

    const dbResult = await sql`
      SELECT
        quarter_label,
        income,
        expenses,
        vat_paid,
        irpf_paid
      FROM quarterly_financial_records
      WHERE user_id = ${userId}
      ORDER BY year DESC, quarter_num DESC
      LIMIT ${numQuarters};
    `

    const historicalData: QuarterlyFinancials[] = dbResult
      .map((row: any) => ({
        quarter: row.quarter_label,
        income: Number.parseFloat(row.income),
        expenses: Number.parseFloat(row.expenses),
        vatPaid: Number.parseFloat(row.vat_paid),
        irpfPaid: Number.parseFloat(row.irpf_paid),
      }))
      .reverse()

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json(
        { message: `No historical data found for user ${userId}. Ensure data exists or try fewer quarters.` },
        { status: 404 },
      )
    }

    const response: HistoricalDataResponse = { data: historicalData }
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error fetching historical fiscal summary:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
