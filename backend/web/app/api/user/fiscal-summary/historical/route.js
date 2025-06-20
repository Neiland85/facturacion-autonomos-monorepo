"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const serverless_1 = require("@neondatabase/serverless");
// Initialize the Neon client.
// The DATABASE_URL will be automatically picked up from environment variables.
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
async function GET(request) {
    try {
        // --- User Authentication/Identification ---
        // In a real application, you would get the userId from an authenticated session or token.
        // For this example, we'll simulate it or expect it as a query parameter (less secure for real apps).
        // const userId = getUserIdFromSession(request); // Replace with your auth logic
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId"); // Example: /api/...historical?userId=user_123
        const quartersParam = searchParams.get("quarters");
        if (!userId) {
            return server_1.NextResponse.json({ message: "User ID is required." }, { status: 401 }); // Unauthorized or Bad Request
        }
        const numQuarters = quartersParam ? Number.parseInt(quartersParam, 10) : 3;
        if (isNaN(numQuarters) || numQuarters <= 0 || numQuarters > 12) {
            return server_1.NextResponse.json({ message: "Invalid 'quarters' parameter. Must be between 1 and 12." }, { status: 400 });
        }
        // --- Database Query ---
        // Fetch the last 'numQuarters' records for the given user_id, ordered by most recent first, then limit.
        // The mapping to QuarterlyFinancials type will happen after fetching.
        const dbResult = await sql `
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
    `;
        // The records are fetched in reverse chronological order, so we reverse them back for the frontend
        // if it expects chronological order for charts.
        const historicalData = dbResult
            .map((row) => ({
            quarter: row.quarter_label,
            income: Number.parseFloat(row.income),
            expenses: Number.parseFloat(row.expenses),
            vatPaid: Number.parseFloat(row.vat_paid),
            irpfPaid: Number.parseFloat(row.irpf_paid),
        }))
            .reverse(); // Reverse to get chronological order (oldest first)
        if (!historicalData || historicalData.length === 0) {
            return server_1.NextResponse.json({ message: `No historical data found for user ${userId}. Ensure data exists or try fewer quarters.` }, { status: 404 });
        }
        const response = { data: historicalData };
        return server_1.NextResponse.json(response, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching historical fiscal summary:", error);
        // Log the error for server-side debugging
        // In a production app, use a proper logging service
        return server_1.NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
