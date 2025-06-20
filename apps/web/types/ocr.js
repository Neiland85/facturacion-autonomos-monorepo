"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrInvoiceDataSchema = void 0;
const zod_1 = require("zod");
// Zod schema for structured data extraction from LLM
exports.OcrInvoiceDataSchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string().optional(),
    invoiceDate: zod_1.z.string().optional(), // LLM will return string, convert to Date later
    supplierName: zod_1.z.string().optional(),
    supplierNIF: zod_1.z.string().optional(),
    subtotal: zod_1.z.number().optional(),
    vatRate: zod_1.z.number().optional(),
    vatAmount: zod_1.z.number().optional(),
    totalAmount: zod_1.z.number().optional(),
    taxCategory: zod_1.z
        .object({
        type: zod_1.z.enum(["expense", "income"]),
        category: zod_1.z.enum([
            "professional_services",
            "office_supplies",
            "travel_accommodation",
            "meals_entertainment",
            "equipment_software",
            "utilities",
            "rent",
            "insurance",
            "marketing_advertising",
            "training_education",
            "telecommunications",
            "vehicle_transport",
            "other_deductible",
        ]),
        description: zod_1.z.string(),
        quarterlyReportingCode: zod_1.z.string(),
        annualReportingCode: zod_1.z.string(),
    })
        .optional(),
    deductibilityPercentage: zod_1.z.number().optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().optional(),
        unitPrice: zod_1.z.number().optional(),
        totalPrice: zod_1.z.number().optional(),
        vatRate: zod_1.z.number().optional(),
    }))
        .optional(),
});
