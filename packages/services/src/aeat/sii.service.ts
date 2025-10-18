import axios, { AxiosInstance } from 'axios';
import https from 'https';
import * as fs from 'fs';
import { CertificateManager, CertificateData } from '../utils/certificate-manager';
import { createLogger } from '@neiland85/facturacion-utils';
import { InvoiceWithDetails, InvoiceLine } from '@facturacion/database';
import { convert } from 'xml-js';

// Types and Interfaces
export interface SIIConfig {
  apiUrl: string;
  nif: string;
  testMode: boolean;
  certificatePath: string;
  certificatePassword: string;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

export interface SIITaxDetail {
  rate: number;
  baseAmount: number;
  taxAmount: number;
}

export interface SIIInvoiceData {
  invoiceNumber: string;
  invoiceDate: string; // DD-MM-YYYY
  year: number; // Ejercicio (e.g., 2024)
  period: string; // Periodo (e.g., "01" for first quarter)
  companyNIF: string;
  companyName: string;
  clientNIF: string;
  clientName: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  taxDetails: SIITaxDetail[]; // Multiple tax rates
  operationType: string; // A0 = alta (new invoice)
}

export interface SIIResponse {
  csv: string;
  estado: 'Correcto' | 'AceptadoConErrores' | 'Incorrecto';
  codigoErrorRegistro?: string;
  descripcionErrorRegistro?: string;
}

export interface SIISubmissionResult {
  success: boolean;
  csv?: string;
  errors?: string[];
  rawResponse?: string;
}

/**
 * SIIService - Real AEAT SII integration with SOAP XML transformation,
 * certificate-based authentication, and retry logic.
 */
export class SIIService {
  private axiosInstance: AxiosInstance | null = null;
  private certificate: CertificateData | null = null;
  private logger = createLogger('AEAT-SII');
  private config: SIIConfig;

  constructor(config: SIIConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize the service: load certificate and create HTTPS agent
   */
  private initialize(): void {
    try {
      // Load certificate
      this.certificate = CertificateManager.loadFromP12(
        this.config.certificatePath,
        this.config.certificatePassword
      );

      if (!this.certificate) {
        throw new Error('Failed to load certificate');
      }

      this.logger.log('✅ Certificate loaded successfully');

      // Create HTTPS agent with mutual TLS
      // In production, rejectUnauthorized should be true
      const httpsAgent = new https.Agent({
        key: this.certificate.privateKey,
        cert: this.certificate.certificate,
        rejectUnauthorized: !this.config.testMode, // true in prod, false in test
      });

      // Create axios instance with custom HTTPS agent
      this.axiosInstance = axios.create({
        httpAgent: httpsAgent,
        httpsAgent: httpsAgent,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://www.aeat.es/SII/services/SiiStd#SuministroLR',
        },
      });

      this.logger.log('✅ HTTPS agent configured with certificate');
    } catch (error) {
      this.logger.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Build SOAP envelope with AEAT format - Dynamic year/period and multiple tax rates
   */
  private buildSOAPEnvelope(invoiceData: SIIInvoiceData): string {
    // Build tax details XML for each tax rate
    const taxDetailsXml = invoiceData.taxDetails
      .map(
        (detail) => `
                  <sii:DetalleIVA>
                    <sii:TipoImpositivo>${detail.rate.toFixed(2)}</sii:TipoImpositivo>
                    <sii:BaseImponible>${detail.baseAmount.toFixed(2)}</sii:BaseImponible>
                    <sii:CuotaRepercutida>${detail.taxAmount.toFixed(2)}</sii:CuotaRepercutida>
                  </sii:DetalleIVA>`
      )
      .join('');

    const soapXml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:sii="http://www.agenciatributaria.es/wlpl/SiiStd/Aduanas/Tipos/espDatos/v1.0">
  <soapenv:Header>
    <sii:Cabecera>
      <sii:NIFEmisor>${this.escapeXml(invoiceData.companyNIF)}</sii:NIFEmisor>
      <sii:NombreEmisor>${this.escapeXml(invoiceData.companyName)}</sii:NombreEmisor>
      <sii:Periodo>
        <sii:Ejercicio>${invoiceData.year}</sii:Ejercicio>
        <sii:Periodo>${invoiceData.period}</sii:Periodo>
      </sii:Periodo>
      <sii:IntEncriptacion>utf-8</sii:IntEncriptacion>
    </sii:Cabecera>
  </soapenv:Header>
  <soapenv:Body>
    <sii:SuministroLRFacturasEmitidas>
      <sii:VersionSii>0,47</sii:VersionSii>
      <sii:DataSignature>
        <sii:Timestamp>${new Date().toISOString()}</sii:Timestamp>
      </sii:DataSignature>
      <sii:RegistroLRFacturasEmitidas>
        <sii:IDFactura>
          <sii:NumSerieFacturaEmisor>${this.escapeXml(invoiceData.invoiceNumber)}</sii:NumSerieFacturaEmisor>
          <sii:FechaExpedicionFacturaEmisor>${invoiceData.invoiceDate}</sii:FechaExpedicionFacturaEmisor>
        </sii:IDFactura>
        <sii:Contraparte>
          <sii:NIF>${this.escapeXml(invoiceData.clientNIF)}</sii:NIF>
          <sii:NombreRazon>${this.escapeXml(invoiceData.clientName)}</sii:NombreRazon>
        </sii:Contraparte>
        <sii:TipoDesglose>
          <sii:DesgloseFactura>
            <sii:Sujeta>
              <sii:NoExenta>
                <sii:TipoNoExenta>S1</sii:TipoNoExenta>
                <sii:DesgloseIVA>${taxDetailsXml}
                </sii:DesgloseIVA>
              </sii:NoExenta>
            </sii:Sujeta>
          </sii:DesgloseFactura>
        </sii:TipoDesglose>
        <sii:ImporteTotal>${invoiceData.totalAmount.toFixed(2)}</sii:ImporteTotal>
        <sii:TipoOperacion>${invoiceData.operationType}</sii:TipoOperacion>
      </sii:RegistroLRFacturasEmitidas>
    </sii:SuministroLRFacturasEmitidas>
  </soapenv:Body>
</soapenv:Envelope>`;

    return soapXml;
  }

  private transformInvoiceToSII(invoice: InvoiceWithDetails): SIIInvoiceData {
    // Calculate totals by grouping lines by VAT rate
    // This creates a map of VAT rate -> {baseAmount, taxAmount}
    const taxByRate = new Map<number, { base: number; tax: number }>();

    invoice.lines.forEach((line: InvoiceLine) => {
      const lineAmount = Number(line.amount);
      const vatRate = Number(line.vatRate);
      const netAmount = lineAmount / (1 + vatRate / 100);
      const taxAmount = lineAmount - netAmount;

      const existing = taxByRate.get(vatRate) || { base: 0, tax: 0 };
      existing.base += netAmount;
      existing.tax += taxAmount;
      taxByRate.set(vatRate, existing);
    });

    // Convert map to array and sort by rate for consistent ordering
    const taxDetails: SIITaxDetail[] = Array.from(taxByRate.entries())
      .map(([rate, { base, tax }]) => ({
        rate,
        baseAmount: base,
        taxAmount: tax,
      }))
      .sort((a, b) => a.rate - b.rate);

    const baseAmount = taxDetails.reduce((sum, t) => sum + t.baseAmount, 0);
    const taxAmount = taxDetails.reduce((sum, t) => sum + t.taxAmount, 0);
    const totalAmount = baseAmount + taxAmount;

    // Extract year and period from invoice date
    const invoiceDate = new Date(invoice.issueDate);
    const year = invoiceDate.getFullYear();
    const month = invoiceDate.getMonth() + 1;
    // Convert month to quarter (1-3 = Q1 "01", 4-6 = Q2 "02", 7-9 = Q3 "03", 10-12 = Q4 "04")
    const period = String(Math.ceil(month / 3)).padStart(2, '0');

    // Format date to DD-MM-YYYY
    const day = String(invoiceDate.getDate()).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const formattedDate = `${day}-${monthStr}-${year}`;

    return {
      invoiceNumber: invoice.number,
      invoiceDate: formattedDate,
      year,
      period,
      companyNIF: invoice.company.nif,
      companyName: invoice.company.name,
      clientNIF: invoice.client.nif,
      clientName: invoice.client.name,
      baseAmount,
      taxAmount,
      totalAmount,
      taxDetails,
      operationType: 'A0', // Alta (new invoice)
    };
  }

  /**
   * Parse AEAT SII response XML - Robust parsing with namespace handling
   */
  private parseSIIResponse(xmlResponse: string): SIIResponse {
    try {
      // Convert XML to JSON for easier parsing
      const jsonResponse = convert(xmlResponse, { compact: true }) as any;

      // Helper function to find element regardless of namespace prefix
      const findElement = (obj: any, elementName: string): any => {
        if (!obj) return undefined;
        
        // Try direct access
        if (obj[elementName]) return obj[elementName];
        
        // Try with common namespace prefixes
        for (const prefix of ['soap', 'soapenv', 'sii', '']) {
          const key = prefix ? `${prefix}:${elementName}` : elementName;
          if (obj[key]) return obj[key];
        }
        
        // Try to search in all keys
        for (const key of Object.keys(obj)) {
          if (key.endsWith(`:${elementName}`) || key === elementName) {
            return obj[key];
          }
        }
        
        return undefined;
      };

      // Navigate through SOAP structure with namespace robustness
      const envelope = findElement(jsonResponse, 'Envelope') || jsonResponse;
      const body = findElement(envelope, 'Body');
      const suministroResponse = findElement(body, 'SuministroLRFacturasEmitidas');
      const registro = findElement(suministroResponse, 'RegistroLRFacturasEmitidas');

      if (!registro) {
        this.logger.warn('⚠️ Response structure not found in expected location');
        throw new Error('Invalid response structure: Could not find RegistroLRFacturasEmitidas');
      }

      // Extract values with fallback to _text property
      const getValue = (element: any): string => {
        if (!element) return '';
        return typeof element === 'object' && element._text ? element._text : String(element);
      };

      const csv = getValue(findElement(registro, 'CSV')) || '';
      const estado = getValue(findElement(registro, 'Estado')) || 'Incorrecto';
      const codigoError = getValue(findElement(registro, 'CodigoErrorRegistro'));
      const descripcionError = getValue(findElement(registro, 'DescripcionErrorRegistro'));

      return {
        csv,
        estado: estado as 'Correcto' | 'AceptadoConErrores' | 'Incorrecto',
        codigoErrorRegistro: codigoError || undefined,
        descripcionErrorRegistro: descripcionError || undefined,
      };
    } catch (error) {
      this.logger.error('❌ Failed to parse response:', error);
      throw new Error(`Failed to parse AEAT response: ${error}`);
    }
  }

  /**
   * Check if error is retryable
   */
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.retryAttempts) {
      return false;
    }

    // Retry on network errors, timeouts, 5xx
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }

    // Check error message for network-related strings
    const errorMessage = error.message || error.toString() || '';
    if (
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('socket hang up') ||
      errorMessage.includes('connection reset')
    ) {
      return true;
    }

    if (error.response?.status >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Delay with exponential backoff
   */
  private delay(ms: number, attempt: number): Promise<void> {
    const delayMs = ms * Math.pow(2, attempt);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Transform invoice to SOAP XML
   */
  public async transformInvoice(invoice: InvoiceWithDetails): Promise<string> {
    try {
      const siiData = this.transformInvoiceToSII(invoice);
      const soapXml = this.buildSOAPEnvelope(siiData);

      this.logger.log(`✅ Invoice ${invoice.number} transformed to SOAP XML`);
      return soapXml;
    } catch (error) {
      this.logger.error('❌ Transformation failed:', error);
      throw error;
    }
  }

  /**
   * Send SOAP XML to AEAT with retry logic
   */
  public async sendToAEAT(soapXml: string): Promise<SIISubmissionResult> {
    if (!this.axiosInstance) {
      throw new Error('Service not initialized');
    }

    let lastError: any;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        this.logger.log(`📤 Sending to AEAT (attempt ${attempt + 1}/${this.config.retryAttempts})`);

        const response = await this.axiosInstance.post(this.config.apiUrl, soapXml, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
          },
        });

        this.logger.log('✅ Response received from AEAT');

        // Parse response
        const siiResponse = this.parseSIIResponse(response.data);

        // Check for business errors
        if (siiResponse.estado === 'Incorrecto') {
          return {
            success: false,
            errors: [siiResponse.descripcionErrorRegistro || 'AEAT error'],
            rawResponse: response.data,
          };
        }

        this.logger.log(`✅ Invoice submitted successfully, CSV: ${siiResponse.csv}`);

        return {
          success: true,
          csv: siiResponse.csv,
          rawResponse: response.data,
        };
      } catch (error) {
        lastError = error;

        if (this.shouldRetry(error, attempt)) {
          const waitTime = this.config.retryDelay * Math.pow(2, attempt);
          this.logger.warn(
            `⚠️ Retryable error, waiting ${waitTime}ms before retry: ${error}`
          );
          await this.delay(this.config.retryDelay, attempt);
        } else {
          break;
        }
      }
    }

    this.logger.error('❌ All retry attempts failed:', lastError);
    return {
      success: false,
      errors: [lastError?.message || 'Unknown error'],
    };
  }

  /**
   * High-level method: transform and submit invoice
   */
  public async submitInvoice(invoice: InvoiceWithDetails): Promise<SIISubmissionResult> {
    try {
      const soapXml = await this.transformInvoice(invoice);
      return await this.sendToAEAT(soapXml);
    } catch (error) {
      this.logger.error('❌ Submission failed:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

/**
 * Factory function to create SIIService instance with config from environment
 */
export function createSIIService(config?: Partial<SIIConfig>): SIIService {
  // Determine if test mode
  const testMode = config?.testMode ?? (process.env.AEAT_TEST_MODE === 'true');

  // Determine API URL with fallback based on test mode
  let apiUrl = config?.apiUrl || process.env.AEAT_API_URL;
  
  if (!apiUrl) {
    // Use env variable or fallback to test endpoint
    apiUrl = testMode
      ? 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd' // Test endpoint
      : 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd'; // Production endpoint (same for now)
  }

  const finalConfig: SIIConfig = {
    apiUrl,
    nif: config?.nif || process.env.AEAT_NIF || '',
    testMode,
    certificatePath: config?.certificatePath || process.env.AEAT_CERTIFICATE_PATH || '',
    certificatePassword: config?.certificatePassword || process.env.AEAT_CERTIFICATE_PASSWORD || '',
    retryAttempts: config?.retryAttempts || parseInt(process.env.AEAT_RETRY_ATTEMPTS || '3'),
    retryDelay: config?.retryDelay || parseInt(process.env.AEAT_RETRY_DELAY || '5000'),
    timeout: config?.timeout || parseInt(process.env.AEAT_TIMEOUT || '60000'),
  };

  // Validate required fields
  if (!finalConfig.certificatePath) {
    throw new Error('AEAT_CERTIFICATE_PATH is required');
  }

  if (!finalConfig.certificatePassword) {
    throw new Error('AEAT_CERTIFICATE_PASSWORD is required');
  }

  if (!finalConfig.nif) {
    throw new Error('AEAT_NIF is required');
  }

  return new SIIService(finalConfig);
}
