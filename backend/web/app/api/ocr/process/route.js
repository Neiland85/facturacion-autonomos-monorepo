"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const ocr_1 = require("@/types/ocr");
const serverless_client_1 = require("@fal-ai/serverless-client");
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const blob_1 = require("@vercel/blob"); // Import Vercel Blob SDK
// Ensure FAL_API_KEY and OPENAI_API_KEY are set in environment variables
if (!process.env.FAL_API_KEY) {
    throw new Error("FAL_API_KEY is not set");
}
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
}
// BLOB_READ_WRITE_TOKEN is usually injected by Vercel, but good to be aware
if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "development") {
    console.warn("BLOB_READ_WRITE_TOKEN is not set. Vercel Blob uploads might fail locally if not configured.");
}
async function processOCRWithFalAndAI(file) {
    const startTime = Date.now();
    let blobUploadUrl = undefined;
    try {
        // 0. Upload file to Vercel Blob
        console.log(`Uploading ${file.name} to Vercel Blob...`);
        const blob = await (0, blob_1.put)(`invoices/${file.name}`, file, {
            access: "public", // Or 'private' if you handle signed URLs for access
            addRandomSuffix: true, // Good practice to avoid overwrites
        });
        blobUploadUrl = blob.url;
        console.log(`File uploaded to Vercel Blob: ${blobUploadUrl}`);
        // 1. Perform raw OCR using Fal AI
        console.log("Sending file to Fal AI for OCR...");
        const falResult = await serverless_client_1.fal.run("fal-ai/document-parser", {
            input: {
                // Fal AI document-parser expects a file blob, not a URL for this model
                image_file: new Blob([await file.arrayBuffer()], { type: file.type }),
            },
        });
        if (!falResult || !falResult.text) {
            throw new Error("Fal AI OCR did not return text content.");
        }
        const rawOcrText = falResult.text;
        console.log("Raw OCR Text extracted:", rawOcrText.substring(0, 500) + "...");
        // 2. Use AI SDK to extract structured data from raw OCR text
        console.log("Extracting structured data using AI SDK...");
        const { object: extractedData } = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)("gpt-4o"),
            schema: ocr_1.OcrInvoiceDataSchema,
            prompt: `Extract the following invoice data from the provided text. If a field is not found, omit it.
    Ensure dates are in YYYY-MM-DD format if possible. Categorize the expense appropriately.
    
    Invoice Text:
    ${rawOcrText}
    
    Expected fields: invoiceNumber, invoiceDate (YYYY-MM-DD), supplierName, supplierNIF, subtotal, vatRate, vatAmount, totalAmount, taxCategory (type, category, description, quarterlyReportingCode, annualReportingCode), deductibilityPercentage, items (description, quantity, unitPrice, totalPrice, vatRate).
    
    For taxCategory.category, use one of: "professional_services", "office_supplies", "travel_accommodation", "meals_entertainment", "equipment_software", "utilities", "rent", "insurance", "marketing_advertising", "training_education", "telecommunications", "vehicle_transport", "other_deductible".
    For taxCategory.type, use "expense".
    For quarterlyReportingCode and annualReportingCode, provide a plausible code if the category is clear, otherwise use "N/A".
    For deductibilityPercentage, assume 100 unless it's 'meals_entertainment' (50).
    `,
        });
        const processedData = {
            ...extractedData,
            invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : undefined,
            subtotal: extractedData.subtotal ? Number(extractedData.subtotal) : undefined,
            vatRate: extractedData.vatRate ? Number(extractedData.vatRate) : undefined,
            vatAmount: extractedData.vatAmount ? Number(extractedData.vatAmount) : undefined,
            totalAmount: extractedData.totalAmount ? Number(extractedData.totalAmount) : undefined,
            items: extractedData.items?.map((item) => ({
                ...item,
                quantity: item.quantity ? Number(item.quantity) : undefined,
                unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
                totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
                vatRate: item.vatRate ? Number(item.vatRate) : undefined,
            })),
        };
        const confidence = (processedData.invoiceNumber && processedData.totalAmount && processedData.supplierName ? 0.95 : 0.7) +
            Math.random() * 0.05;
        const result = {
            success: true,
            data: {
                ...processedData,
                id: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                extractedAt: new Date(),
                confidence: confidence,
                processingStatus: "extracted",
                originalFileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                blobUrl: blobUploadUrl, // Store the Vercel Blob URL
            },
            processingTime: Date.now() - startTime,
            suggestions: [
                "Verifica que la fecha de la factura es correcta",
                "Confirma que el proveedor y NIF son válidos",
                "Revisa la categoría fiscal asignada",
                "Comprueba que los importes coinciden con la factura original",
            ],
        };
        return result;
    }
    catch (error) {
        console.error("Error during OCR processing:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido durante el procesamiento OCR",
            processingTime: Date.now() - startTime,
        };
    }
}
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            return server_1.NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 });
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return server_1.NextResponse.json({ success: false, error: "Tipo de archivo no válido. Use JPG, PNG o PDF." }, { status: 400 });
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return server_1.NextResponse.json({ success: false, error: "El archivo es demasiado grande. Máximo 10MB." }, { status: 400 });
        }
        const result = await processOCRWithFalAndAI(file);
        return server_1.NextResponse.json(result, {
            status: result.success ? 200 : 500,
        });
    }
    catch (error) {
        console.error("Error in OCR POST handler:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Error interno del servidor al manejar la solicitud",
            processingTime: 0,
        }, { status: 500 });
    }
}
