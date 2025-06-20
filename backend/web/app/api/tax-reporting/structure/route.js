"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const serverless_1 = require("@neondatabase/serverless");
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
// Helper function to get the current quarter
function getCurrentQuarter() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let quarter;
    if (month <= 3)
        quarter = "T1";
    else if (month <= 6)
        quarter = "T2";
    else if (month <= 9)
        quarter = "T3";
    else
        quarter = "T4";
    return { quarter, year };
}
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");
        const quarterParam = searchParams.get("quarter");
        const yearParam = searchParams.get("year");
        if (!userId) {
            return server_1.NextResponse.json({ message: "User ID is required." }, { status: 401 });
        }
        const { quarter: currentQuarter, year: currentYear } = getCurrentQuarter();
        const targetQuarter = quarterParam || currentQuarter;
        const targetYear = yearParam ? Number.parseInt(yearParam, 10) : currentYear;
        // Fetch all processed invoices for the specified period
        const invoicesResult = await sql `
      SELECT 
        invoice_data,
        processed_at,
        confidence_score
      FROM processed_invoices 
      WHERE user_id = ${userId}
      AND quarter = ${targetQuarter}
      AND year = ${targetYear}
      ORDER BY processed_at DESC;
    `;
        const processedInvoices = invoicesResult.map((row) => JSON.parse(row.invoice_data));
        // Calculate aggregated tax reporting structure
        let vatCollected = 0;
        let vatPaid = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
        const expensesByCategory = {
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
        };
        const incomeByCategory = {
            professional_services: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
            product_sales: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
            consulting: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
            training_workshops: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
            licenses_royalties: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
            other_income: { totalAmount: 0, vatCollected: 0, invoiceCount: 0, averageAmount: 0 },
        };
        // Process each invoice for categorization
        processedInvoices.forEach((invoice) => {
            const amount = invoice.totalAmount || 0;
            const vatAmount = invoice.vatAmount || 0;
            const deductibilityFactor = (invoice.deductibilityPercentage || 100) / 100;
            if (invoice.taxCategory.type === "expense") {
                const category = invoice.taxCategory.category;
                if (expensesByCategory[category]) {
                    expensesByCategory[category].totalAmount += amount;
                    expensesByCategory[category].vatDeductible += vatAmount * deductibilityFactor;
                    expensesByCategory[category].invoiceCount += 1;
                    totalExpenses += amount;
                    vatPaid += vatAmount * deductibilityFactor;
                }
            }
            else if (invoice.taxCategory.type === "income") {
                const category = invoice.taxCategory.category;
                if (incomeByCategory[category]) {
                    incomeByCategory[category].totalAmount += amount;
                    incomeByCategory[category].vatCollected += vatAmount;
                    incomeByCategory[category].invoiceCount += 1;
                    totalIncome += amount;
                    vatCollected += vatAmount;
                }
            }
        });
        // Calculate averages
        Object.values(expensesByCategory).forEach((cat) => {
            if (cat.invoiceCount > 0) {
                cat.averageAmount = cat.totalAmount / cat.invoiceCount;
            }
        });
        Object.values(incomeByCategory).forEach((cat) => {
            if (cat.invoiceCount > 0) {
                cat.averageAmount = cat.totalAmount / cat.invoiceCount;
            }
        });
        const deductibleExpenses = totalExpenses; // Simplified for now
        const netIncome = totalIncome - deductibleExpenses;
        const estimatedIRPF = Math.max(0, netIncome * 0.2); // 20% simplified rate
        const taxReportingStructure = {
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
                avgConfidenceScore: processedInvoices.length > 0
                    ? processedInvoices.reduce((sum, inv) => sum + inv.confidence, 0) / processedInvoices.length
                    : 0,
            },
        };
        return server_1.NextResponse.json(taxReportingStructure, { status: 200 });
    }
    catch (error) {
        console.error("Error generating tax reporting structure:", error);
        return server_1.NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}
