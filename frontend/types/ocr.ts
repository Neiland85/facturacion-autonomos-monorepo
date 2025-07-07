import { z } from "zod"

export type ExpenseCategory =
  | "professional_services"
  | "office_supplies"
  | "travel_accommodation"
  | "meals_entertainment"
  | "equipment_software"
  | "utilities"
  | "rent"
  | "insurance"
  | "marketing_advertising"
  | "training_education"
  | "telecommunications"
  | "vehicle_transport"
  | "other_deductible"

export interface InvoiceTaxCategory {
  type: "expense" | "income"
  category: ExpenseCategory
  description: string
  quarterlyReportingCode: string
  annualReportingCode: string
}

export interface InvoiceItem {
  description: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  vatRate?: number
}

export interface OCRInvoiceData {
  id: string
  extractedAt: Date
  confidence: number // 0-1
  invoiceNumber?: string
  invoiceDate?: Date
  supplierName?: string
  supplierNIF?: string
  supplierAddress?: string
  subtotal?: number
  vatRate?: number
  vatAmount?: number
  totalAmount?: number
  items?: InvoiceItem[]
  taxCategory?: InvoiceTaxCategory
  deductibilityPercentage?: number // 0-100
  processingStatus: "extracted" | "pending_review" | "error"
  originalFileName: string
  fileSize: number
  fileType: string
  blobUrl?: string // Added for Vercel Blob URL
}

export interface OCRProcessingResult {
  success: boolean
  data?: OCRInvoiceData
  error?: string
  processingTime: number // in ms
  suggestions?: string[] // Suggestions for user review
}

// Zod schema for structured data extraction from LLM
export const OcrInvoiceDataSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(), // LLM will return string, convert to Date later
  supplierName: z.string().optional(),
  supplierNIF: z.string().optional(),
  subtotal: z.number().optional(),
  vatRate: z.number().optional(),
  vatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  taxCategory: z
    .object({
      type: z.enum(["expense", "income"]),
      category: z.enum([
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
      description: z.string(),
      quarterlyReportingCode: z.string(),
      annualReportingCode: z.string(),
    })
    .optional(),
  deductibilityPercentage: z.number().optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        totalPrice: z.number().optional(),
        vatRate: z.number().optional(),
      }),
    )
    .optional(),
})
