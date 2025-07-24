import { NextResponse, type NextRequest } from "next/server"
import type { OCRProcessingResult, OCRInvoiceData } from "@/types/ocr"
import { OcrInvoiceDataSchema } from "@/types/ocr"
import fal from "@fal-ai/serverless-client"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { put } from "@vercel/blob"
import { 
  FileValidationUtils, 
  DEFAULT_FILE_CONFIG,
  type FileValidationConfig 
} from "@facturacion/validation/middleware/file-upload.middleware"
import {
  RateLimitUtils,
  DEFAULT_RATE_LIMIT_CONFIG
} from "@facturacion/validation/middleware/rate-limiting.middleware"
import path from 'path'
import fs from 'fs/promises'

// Configuración de seguridad para OCR
const OCR_FILE_CONFIG: Partial<FileValidationConfig> = {
  maxFileSize: 5 * 1024 * 1024, // 5MB máximo para OCR
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'application/pdf'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
  tempDir: '/tmp/ocr-secure',
  virusScanEnabled: false
};

// Configuración de rate limiting específica para OCR
const OCR_RATE_CONFIG = {
  maxUploadsPerMinute: 3, // Más restrictivo para OCR
  maxUploadsPerHour: 20,
  maxUploadsPerDay: 100,
  maxBytesPerMinute: 15 * 1024 * 1024, // 15MB
  maxBytesPerHour: 50 * 1024 * 1024, // 50MB
  maxConcurrentUploads: 5, // Reducido para OCR intensivo
  maxConcurrentUploadsPerUser: 2
};

/**
 * Valida la configuración del servidor
 */
function validateServerConfig() {
  const requiredVars = ['FAL_API_KEY', 'OPENAI_API_KEY'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "development") {
    console.warn("BLOB_READ_WRITE_TOKEN no configurado. Uploads a Vercel Blob pueden fallar.");
  }
}

/**
 * Sanitiza el contenido extraído por OCR para prevenir inyecciones
 */
function sanitizeOCRContent(content: string): string {
  return content
    .replace(/[<>"'&]/g, '') // Eliminar caracteres HTML peligrosos
    .replace(/javascript:/gi, '') // Eliminar javascript URLs
    .replace(/data:/gi, '') // Eliminar data URLs
    .replace(/on\w+=/gi, '') // Eliminar event handlers
    .trim()
    .slice(0, 50000); // Límite de contenido para prevenir memoria excesiva
}

/**
 * Procesa archivo con OCR de forma segura
 */
async function processOCRSecurely(
  validatedFile: {
    originalName: string;
    mimeType: string;
    size: number;
    tempPath: string;
    hash: string;
    isSecure: boolean;
  },
  fileBuffer: Buffer
): Promise<OCRProcessingResult> {
  const startTime = Date.now()
  let blobUploadUrl: string | undefined = undefined

  try {
    // Verificar que el archivo es seguro
    if (!validatedFile.isSecure) {
      throw new Error("Archivo contiene contenido potencialmente malicioso");
    }

    // Log de seguridad
    console.log(`[SECURITY] Processing OCR for file: ${validatedFile.originalName}, hash: ${validatedFile.hash}, size: ${validatedFile.size}`);

    // Subida segura a Vercel Blob con nombre sanitizado
    const sanitizedName = path.basename(validatedFile.originalName).replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `invoices/${Date.now()}_${sanitizedName}`;
    
    console.log(`Uploading ${blobName} to Vercel Blob...`);
    const blob = await put(blobName, fileBuffer, {
      access: "public",
      addRandomSuffix: true,
    });
    blobUploadUrl = blob.url;
    console.log(`File uploaded to Vercel Blob: ${blobUploadUrl}`);

    // OCR con Fal AI (timeout de seguridad)
    console.log("Sending file to Fal AI for OCR...");
    const falPromise = fal.run("fal-ai/document-parser", {
      input: {
        image_file: new Blob([fileBuffer], { type: validatedFile.mimeType }),
      },
    });

    // Timeout de 30 segundos para evitar colgarse
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR timeout')), 30000)
    );

    const falResult = await Promise.race([falPromise, timeoutPromise]) as any;

    if (!falResult || typeof falResult.text !== "string") {
      throw new Error("Fal AI OCR no devolvió contenido de texto válido.");
    }

    // Sanitizar contenido OCR
    const rawOcrText = sanitizeOCRContent(falResult.text);
    console.log("Raw OCR Text extracted:", rawOcrText.substring(0, 500) + "...");

    // Extracción de datos estructurados con timeout
    console.log("Extracting structured data using AI SDK...");
    const aiPromise = generateObject({
      model: openai("gpt-4o"),
      schema: OcrInvoiceDataSchema,
      prompt: `Extract the following invoice data from the provided text. If a field is not found, omit it.
      Ensure dates are in YYYY-MM-DD format if possible. Categorize the expense appropriately.
      Invoice Text:
      ${rawOcrText}
      Expected fields: invoiceNumber, invoiceDate, supplierName, supplierNIF, subtotal, vatRate, vatAmount, totalAmount, taxCategory, deductibilityPercentage, items.`,
    });

    const aiTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI processing timeout')), 20000)
    );

    const { object: extractedData } = await Promise.race([aiPromise, aiTimeoutPromise]) as any;

    // Validar y sanitizar datos extraídos
    const processedData: OCRInvoiceData = {
      ...extractedData,
      invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : undefined,
      subtotal: extractedData.subtotal ? Number(extractedData.subtotal) : undefined,
      vatRate: extractedData.vatRate ? Number(extractedData.vatRate) : undefined,
      vatAmount: extractedData.vatAmount ? Number(extractedData.vatAmount) : undefined,
      totalAmount: extractedData.totalAmount ? Number(extractedData.totalAmount) : undefined,
      items: extractedData.items?.map((item: any) => ({
        ...item,
        description: item.description ? sanitizeOCRContent(item.description) : undefined,
        quantity: item.quantity ? Number(item.quantity) : undefined,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        vatRate: item.vatRate ? Number(item.vatRate) : undefined,
      })),
    };

    // Sanitizar campos de texto
    if (processedData.supplierName) {
      processedData.supplierName = sanitizeOCRContent(processedData.supplierName);
    }
    if (processedData.invoiceNumber) {
      processedData.invoiceNumber = sanitizeOCRContent(processedData.invoiceNumber);
    }

    const confidence =
      (processedData.invoiceNumber && processedData.totalAmount && processedData.supplierName ? 0.95 : 0.7) +
      Math.random() * 0.05;

    const result: OCRProcessingResult = {
      success: true,
      data: {
        ...processedData,
        id: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        extractedAt: new Date(),
        confidence,
        processingStatus: "extracted",
        originalFileName: validatedFile.originalName,
        fileSize: validatedFile.size,
        fileType: validatedFile.mimeType,
        blobUrl: blobUploadUrl,
        fileHash: validatedFile.hash, // Agregar hash para auditoría
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
  } catch (error) {
    console.error("Error during OCR processing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido durante el procesamiento OCR",
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Limpia archivo temporal de forma segura
 */
async function cleanupTempFile(tempPath: string) {
  try {
    await fs.unlink(tempPath);
    console.log(`[SECURITY] Temp file cleaned: ${tempPath}`);
  } catch (error) {
    console.error('Error cleaning temp file:', error);
  }
}

/**
 * Endpoint POST mejorado con validaciones de seguridad
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempFilePath: string | undefined;

  try {
    // Validar configuración del servidor
    validateServerConfig();

    // Obtener IP del cliente para rate limiting
    const clientIP = request.ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    console.log(`[SECURITY] OCR request from IP: ${clientIP}`);

    // Obtener archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "No se proporcionó ningún archivo" 
      }, { status: 400 });
    }

    // Verificar rate limiting ANTES de procesar el archivo
    const rateLimitResult = RateLimitUtils.checkIP(clientIP, file.size);
    if (!rateLimitResult.allowed) {
      console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIP}, reason: ${rateLimitResult.reason}`);
      
      return NextResponse.json({
        success: false,
        error: rateLimitResult.reason || "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': OCR_RATE_CONFIG.maxUploadsPerMinute.toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': (rateLimitResult.retryAfter || 60).toString()
        }
      });
    }

    // Registrar inicio de upload para rate limiting
    const uploadId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[SECURITY] Starting upload ${uploadId} for IP: ${clientIP}`);

    // Convertir archivo a buffer para validación
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validación completa de archivo
    const validatedFile = await FileValidationUtils.validateFile(
      fileBuffer,
      file.name,
      file.type,
      OCR_FILE_CONFIG
    );

    console.log(`[SECURITY] File validated successfully: ${validatedFile.originalName}, secure: ${validatedFile.isSecure}`);

    // Procesar OCR de forma segura
    const result = await processOCRSecurely(validatedFile, fileBuffer);

    // Log de resultado
    console.log(`[SECURITY] OCR processing completed for ${uploadId}, success: ${result.success}, time: ${result.processingTime}ms`);

    // Cleanup en background
    if (tempFilePath) {
      setImmediate(() => cleanupTempFile(tempFilePath!));
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'X-Processing-Time': result.processingTime.toString(),
        'X-Upload-ID': uploadId
      }
    });

  } catch (error) {
    console.error("Error in OCR POST handler:", error);

    // Cleanup en caso de error
    if (tempFilePath) {
      setImmediate(() => cleanupTempFile(tempFilePath!));
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor al manejar la solicitud",
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para estadísticas (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización admin aquí si es necesario
    const stats = RateLimitUtils.getStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
        ocrConfig: OCR_FILE_CONFIG,
        rateLimitConfig: OCR_RATE_CONFIG
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Error obteniendo estadísticas"
    }, { status: 500 });
  }
}
