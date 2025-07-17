import { Invoice } from '../models/invoice.model';

interface PdfOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

class PdfService {
  /**
   * Generate PDF from invoice (STUB - PDF generation disabled)
   */
  async generateInvoicePdf(
    invoice: Invoice,
    options: PdfOptions = {}
  ): Promise<Buffer> {
    // Temporarily disabled until dependencies are properly installed
    const stubPdfContent = `
      Invoice PDF Stub
      ================
      
      Invoice: ${invoice.number}
      Date: ${invoice.issueDate}
      Client: ${invoice.client.name}
      Total: ${invoice.total} EUR
      
      This is a temporary stub while PDF dependencies are being resolved.
      To enable full PDF generation, install puppeteer and handlebars:
      pnpm add puppeteer handlebars @types/handlebars
    `;

    return Buffer.from(stubPdfContent, 'utf-8');
  }

  /**
   * Save PDF to file (STUB)
   */
  async savePdfToFile(
    invoice: Invoice,
    filePath: string,
    options: PdfOptions = {}
  ): Promise<void> {
    const pdfBuffer = await this.generateInvoicePdf(invoice, options);
    // In real implementation, this would write to file system
    console.log(`PDF would be saved to: ${filePath}`);
    console.log(`PDF content length: ${pdfBuffer.length} bytes`);
  }

  /**
   * Create templates directory if it doesn't exist (STUB)
   */
  async ensureTemplatesDirectory(): Promise<void> {
    console.log('Templates directory ensured (stub)');
  }
}

export const pdfService = new PdfService();
