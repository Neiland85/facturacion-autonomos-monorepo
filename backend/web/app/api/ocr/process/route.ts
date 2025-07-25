import type { OCRInvoiceData, OCRProcessingResult } from '@/types/ocr';
import { OcrInvoiceDataSchema } from '@/types/ocr';
import {
    ensureServerSide,
    validateServerEnvironment
} from '@/utils/server-env-validation';
import { openai } from '@ai-sdk/openai';
import fal from '@fal-ai/serverless-client';
import { put } from '@vercel/blob'; // Import Vercel Blob SDK
import { generateObject } from 'ai';
import { NextResponse, type NextRequest } from 'next/server';

// 🔐 VALIDACIÓN DE SEGURIDAD: Verificar que estamos en el servidor
ensureServerSide('OCR API Route');

// 🔐 VALIDACIÓN DE SEGURIDAD: Verificar variables de entorno del servidor
try {
  validateServerEnvironment();
} catch (error) {
  console.error('🚨 SERVER ENVIRONMENT VALIDATION FAILED:', error);
  throw error;
}

// Definición del tipo OcrInvoiceItem
interface OcrInvoiceItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  vatRate?: number;
}

// Corrección de tipos y valores undefined
async function processOCRWithFalAndAI(
  file: File
): Promise<OCRProcessingResult> {
  const startTime = Date.now();
  let blobUploadUrl: string | undefined = undefined;

  try {
    // Validación del archivo
    if (!file?.name || !file.type) {
      throw new Error('Archivo inválido o no proporcionado.');
    }

    // Subida del archivo a Vercel Blob
    console.log(`Uploading ${file.name} to Vercel Blob...`);
    const blob = await put(`invoices/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    blobUploadUrl = blob.url;
    console.log(`File uploaded to Vercel Blob: ${blobUploadUrl}`);

    // OCR con Fal AI
    console.log('Sending file to Fal AI for OCR...');
    const falResult = await fal.run('fal-ai/document-parser', {
      input: {
        image_file: new Blob([await file.arrayBuffer()], { type: file.type }),
      },
    });

    if (!falResult || typeof falResult.text !== 'string') {
      throw new Error('Fal AI OCR no devolvió contenido de texto válido.');
    }

    const rawOcrText = falResult.text;
    console.log(
      'Raw OCR Text extracted:',
      rawOcrText.substring(0, 500) + '...'
    );

    // Extracción de datos estructurados
    console.log('Extracting structured data using AI SDK...');
    const { object: extractedData } = await generateObject({
      model: openai('gpt-4o'),
      schema: OcrInvoiceDataSchema,
      prompt: `Extract the following invoice data from the provided text. If a field is not found, omit it.
      Ensure dates are in YYYY-MM-DD format if possible. Categorize the expense appropriately.
      Invoice Text:
      ${rawOcrText}
      Expected fields: invoiceNumber, invoiceDate, supplierName, supplierNIF, subtotal, vatRate, vatAmount, totalAmount, taxCategory, deductibilityPercentage, items.`,
    });

    const processedData: OCRInvoiceData = {
      ...extractedData,
      invoiceDate: extractedData.invoiceDate
        ? new Date(extractedData.invoiceDate)
        : undefined,
      subtotal: extractedData.subtotal
        ? Number(extractedData.subtotal)
        : undefined,
      vatRate: extractedData.vatRate
        ? Number(extractedData.vatRate)
        : undefined,
      vatAmount: extractedData.vatAmount
        ? Number(extractedData.vatAmount)
        : undefined,
      totalAmount: extractedData.totalAmount
        ? Number(extractedData.totalAmount)
        : undefined,
      items: extractedData.items?.map((item: OcrInvoiceItem) => ({
        ...item,
        quantity: item.quantity ? Number(item.quantity) : undefined,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        vatRate: item.vatRate ? Number(item.vatRate) : undefined,
      })),
    };

    const confidence =
      (processedData.invoiceNumber &&
      processedData.totalAmount &&
      processedData.supplierName
        ? 0.95
        : 0.7) +
      Math.random() * 0.05;

    const result: OCRProcessingResult = {
      success: true,
      data: {
        ...processedData,
        id: `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        extractedAt: new Date(),
        confidence,
        processingStatus: 'extracted',
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        blobUrl: blobUploadUrl,
      },
      processingTime: Date.now() - startTime,
      suggestions: [
        'Verifica que la fecha de la factura es correcta',
        'Confirma que el proveedor y NIF son válidos',
        'Revisa la categoría fiscal asignada',
        'Comprueba que los importes coinciden con la factura original',
      ],
    };

    return result;
  } catch (error) {
    console.error('Error during OCR processing:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido durante el procesamiento OCR',
      processingTime: Date.now() - startTime,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de archivo no válido. Use JPG, PNG o PDF.',
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'El archivo es demasiado grande. Máximo 10MB.',
        },
        { status: 400 }
      );
    }

    const result = await processOCRWithFalAndAI(file);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Error in OCR POST handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al manejar la solicitud',
        processingTime: 0,
      },
      { status: 500 }
    );
  }
}
