/**
 * @fileoverview OCR-related type definitions for invoice processing
 * @version 1.0.0
 */

import { z } from "zod";

// Esquema Zod para datos de factura extraídos por OCR
export const OcrInvoiceDataSchema = z.object({
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  supplierName: z.string().optional(),
  supplierNIF: z.string().optional(),
  subtotal: z.number().optional(),
  vatRate: z.number().optional(),
  vatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  taxCategory: z
    .enum(["general", "reduced", "super-reduced", "exempt"])
    .optional(),
  deductibilityPercentage: z.number().min(0).max(100).optional(),
  items: z
    .array(
      z.object({
        description: z.string().optional(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        totalPrice: z.number().optional(),
        vatRate: z.number().optional(),
      })
    )
    .optional(),
});

// Tipos inferidos del esquema
export type OCRInvoiceData = z.infer<typeof OcrInvoiceDataSchema>;

// Resultado del procesamiento OCR
export interface OCRProcessingResult {
  success: boolean;
  data?: OCRInvoiceData & {
    id: string;
    extractedAt: Date;
    confidence: number;
    processingStatus: "extracted" | "failed" | "pending";
    originalFileName: string;
    fileSize: number;
    fileType: string;
    blobUrl?: string;
    fileHash: string;
  };
  error?: string;
  processingTime: number;
  suggestions?: string[];
}

// Configuración para OCR
export interface OCRConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  tempDir: string;
  virusScanEnabled: boolean;
  processingTimeout: number;
  aiTimeout: number;
}

// Estadísticas de OCR
export interface OCRStats {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  errors: {
    validation: number;
    processing: number;
    timeout: number;
  };
}
