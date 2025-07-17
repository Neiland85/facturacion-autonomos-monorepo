import fs from 'fs/promises';
import handlebars, { type TemplateDelegate } from 'handlebars';
import path from 'path';
import puppeteer from 'puppeteer';
import { Invoice } from '../models/invoice.model';
import { calculationService } from './calculation.service';

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
  private templateCache: Map<string, TemplateDelegate> = new Map();

  /**
   * Generate PDF from invoice
   */
  async generateInvoicePdf(invoice: Invoice, options: PdfOptions = {}): Promise<Buffer> {
    try {
      // Calculate invoice totals before generating PDF
      const calculatedInvoice = calculationService.calculateInvoiceTotals(invoice);
      
      // Get HTML content from template
      const html = await this.renderInvoiceTemplate(calculatedInvoice);
      
      // Generate PDF
      const pdf = await this.generatePdfFromHtml(html, options);
      
      return pdf;
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Render invoice template with data
   */
  private async renderInvoiceTemplate(invoice: Invoice): Promise<string> {
    try {
      // Get compiled template
      const template = await this.getTemplate('invoice');
      
      // Prepare template data
      const templateData = this.prepareTemplateData(invoice);
      
      // Render template
      return template(templateData);
    } catch (error) {
      throw new Error(`Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get compiled Handlebars template
   */
  private async getTemplate(templateName: string): Promise<TemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    try {
      // Read template file
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      
      // Compile template
      const compiledTemplate = handlebars.compile(templateContent);
      
      // Cache compiled template
      this.templateCache.set(templateName, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      // Fallback to default template if file doesn't exist
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        const defaultTemplate = this.getDefaultInvoiceTemplate();
        const compiledTemplate = handlebars.compile(defaultTemplate);
        this.templateCache.set(templateName, compiledTemplate);
        return compiledTemplate;
      }
      throw error;
    }
  }

  /**
   * Prepare data for template rendering
   */
  private prepareTemplateData(invoice: Invoice) {
    const taxBreakdown = calculationService.calculateTaxBreakdown(invoice);
    
    return {
      invoice: {
        ...invoice,
        issueDate: this.formatDate(invoice.issueDate),
        dueDate: invoice.dueDate ? this.formatDate(invoice.dueDate) : null,
        subtotalFormatted: calculationService.formatCurrency(invoice.subtotal || 0),
        totalTaxFormatted: calculationService.formatCurrency(invoice.totalTax || 0),
        totalRetentionFormatted: calculationService.formatCurrency(invoice.totalRetention || 0),
        totalFormatted: calculationService.formatCurrency(invoice.total || 0)
      },
      items: invoice.items.map((item: any) => ({
        ...item,
        unitPriceFormatted: calculationService.formatCurrency(item.unitPrice),
        subtotalFormatted: calculationService.formatCurrency(item.subtotal || 0),
        taxAmountFormatted: calculationService.formatCurrency(item.taxAmount || 0),
        totalFormatted: calculationService.formatCurrency(item.total || 0)
      })),
      taxBreakdown: Object.entries(taxBreakdown).map(([type, data]) => ({
        type: this.formatTaxType(type),
        rate: `${data.rate}%`,
        base: calculationService.formatCurrency(data.base),
        amount: calculationService.formatCurrency(data.amount)
      })),
      generatedAt: this.formatDate(new Date())
    };
  }

  /**
   * Generate PDF from HTML content
   */
  private async generatePdfFromHtml(html: string, options: PdfOptions = {}): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set content
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdf = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
          ...options.margin
        }
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Default invoice template
   */
  private getDefaultInvoiceTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura {{invoice.number}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        
        .company-info h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-info h2 {
            color: #e74c3c;
            font-size: 36px;
            margin-bottom: 10px;
        }
        
        .billing-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .billing-section {
            flex: 1;
            margin-right: 20px;
        }
        
        .billing-section h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 16px;
            text-transform: uppercase;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .totals-table {
            width: 300px;
        }
        
        .totals-table tr td {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
        }
        
        .totals-table .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #f8f9fa;
            border-top: 2px solid #2c3e50;
        }
        
        .tax-breakdown {
            margin-bottom: 30px;
        }
        
        .tax-breakdown h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .tax-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .tax-table th,
        .tax-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .tax-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .tax-table .text-right {
            text-align: right;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        
        @media print {
            body {
                font-size: 12px;
            }
            
            .container {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>{{invoice.issuer.name}}</h1>
                <p>{{invoice.issuer.address}}</p>
                <p>{{invoice.issuer.city}}, {{invoice.issuer.postalCode}}</p>
                <p>CIF/NIF: {{invoice.issuer.taxId}}</p>
                {{#if invoice.issuer.email}}
                <p>Email: {{invoice.issuer.email}}</p>
                {{/if}}
                {{#if invoice.issuer.phone}}
                <p>Teléfono: {{invoice.issuer.phone}}</p>
                {{/if}}
            </div>
            <div class="invoice-info">
                <h2>FACTURA</h2>
                <p><strong>Número:</strong> {{invoice.number}}</p>
                <p><strong>Fecha:</strong> {{invoice.issueDate}}</p>
                {{#if invoice.dueDate}}
                <p><strong>Vencimiento:</strong> {{invoice.dueDate}}</p>
                {{/if}}
            </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-info">
            <div class="billing-section">
                <h3>Facturar a:</h3>
                <p><strong>{{invoice.client.name}}</strong></p>
                <p>{{invoice.client.address}}</p>
                <p>{{invoice.client.city}}, {{invoice.client.postalCode}}</p>
                <p>CIF/NIF: {{invoice.client.taxId}}</p>
                {{#if invoice.client.email}}
                <p>Email: {{invoice.client.email}}</p>
                {{/if}}
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">Descuento</th>
                    <th class="text-right">IVA</th>
                    <th class="text-right">Subtotal</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {{#each items}}
                <tr>
                    <td>
                        <strong>{{this.description}}</strong>
                        {{#if this.details}}
                        <br><small>{{this.details}}</small>
                        {{/if}}
                    </td>
                    <td class="text-right">{{this.quantity}}</td>
                    <td class="text-right">{{this.unitPriceFormatted}}</td>
                    <td class="text-right">{{this.discount}}%</td>
                    <td class="text-right">{{this.taxRate}}%</td>
                    <td class="text-right">{{this.subtotalFormatted}}</td>
                    <td class="text-right">{{this.totalFormatted}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <!-- Tax Breakdown -->
        {{#if taxBreakdown}}
        <div class="tax-breakdown">
            <h3>Desglose de Impuestos</h3>
            <table class="tax-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th class="text-right">Tipo (%)</th>
                        <th class="text-right">Base Imponible</th>
                        <th class="text-right">Importe</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each taxBreakdown}}
                    <tr>
                        <td>{{this.type}}</td>
                        <td class="text-right">{{this.rate}}</td>
                        <td class="text-right">{{this.base}}</td>
                        <td class="text-right">{{this.amount}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
        </div>
        {{/if}}

        <!-- Totals -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">{{invoice.subtotalFormatted}}</td>
                </tr>
                {{#if invoice.totalTax}}
                <tr>
                    <td>Total Impuestos:</td>
                    <td class="text-right">{{invoice.totalTaxFormatted}}</td>
                </tr>
                {{/if}}
                {{#if invoice.totalRetention}}
                <tr>
                    <td>Total Retenciones:</td>
                    <td class="text-right">-{{invoice.totalRetentionFormatted}}</td>
                </tr>
                {{/if}}
                <tr class="total-row">
                    <td>TOTAL:</td>
                    <td class="text-right">{{invoice.totalFormatted}}</td>
                </tr>
            </table>
        </div>

        <!-- Notes -->
        {{#if invoice.notes}}
        <div class="notes">
            <h3>Observaciones:</h3>
            <p>{{invoice.notes}}</p>
        </div>
        {{/if}}

        <!-- Footer -->
        <div class="footer">
            <p>Factura generada el {{generatedAt}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format tax type for display
   */
  private formatTaxType(type: string): string {
    const typeMap: Record<string, string> = {
      'iva_21': 'IVA 21%',
      'iva_10': 'IVA 10%',
      'iva_4': 'IVA 4%',
      'iva_0': 'IVA 0%',
      'exento': 'Exento'
    };
    
    return typeMap[type] || type.toUpperCase();
  }

  /**
   * Save PDF to file
   */
  async savePdfToFile(invoice: Invoice, filePath: string, options: PdfOptions = {}): Promise<void> {
    const pdfBuffer = await this.generateInvoicePdf(invoice, options);
    await fs.writeFile(filePath, pdfBuffer);
  }

  /**
   * Create templates directory if it doesn't exist
   */
  async ensureTemplatesDirectory(): Promise<void> {
    const templatesDir = path.join(__dirname, '..', 'templates');
    try {
      await fs.access(templatesDir);
    } catch {
      await fs.mkdir(templatesDir, { recursive: true });
    }
  }
}

export const pdfService = new PdfService();
