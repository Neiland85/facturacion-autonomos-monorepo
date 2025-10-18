import { createSIIService, SIIService } from '@facturacion/services/aeat';
import { InvoiceWithDetails } from '@facturacion/database';
import { prisma } from '@facturacion/database';
import { createLogger } from '@facturacion/utils/logger';

/**
 * SIIIntegrationService - Bridge between invoice-service and AEAT SII
 *
 * This service integrates SII submission into the invoice workflow.
 * It handles:
 * - SII service initialization
 * - Invoice submission to AEAT
 * - Database updates with SII references
 * - Error handling and logging
 */
export class SIIIntegrationService {
  private siiService: SIIService | null = null;
  private logger = createLogger('SII-Integration');
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.AEAT_SII_ENABLED === 'true';

    if (this.enabled) {
      try {
        this.siiService = createSIIService();
        this.logger.log('✅ SII Integration Service initialized');
      } catch (error) {
        this.logger.error('❌ Failed to initialize SII service:', error);
        this.enabled = false;
      }
    } else {
      this.logger.log('⚠️ SII Integration is disabled (AEAT_SII_ENABLED=false)');
    }
  }

  /**
   * Check if SII integration is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Submit invoice to AEAT SII
   *
   * @param invoice - Invoice with all details (client, company, lines)
   * @throws Error if submission fails
   */
  public async submitInvoiceToAEAT(invoice: InvoiceWithDetails): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('SII submission attempted but service is disabled');
      return;
    }

    if (!this.siiService) {
      throw new Error('SII service not initialized');
    }

    if (invoice.siiSent) {
      this.logger.info(`Invoice ${invoice.id} already submitted to AEAT`);
      return;
    }

    try {
      this.logger.log(
        `📤 Submitting invoice ${invoice.invoiceNumber} to AEAT SII`
      );

      const result = await this.siiService.submitInvoice(invoice);

      if (result.success && result.csv) {
        // Update invoice with SII reference
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            siiSent: true,
            siiReference: result.csv,
            siiSentAt: new Date(),
          },
        });

        this.logger.log(
          `✅ Invoice ${invoice.invoiceNumber} submitted successfully. CSV: ${result.csv}`
        );
      } else {
        const errorMessage = result.errors?.join(', ') || 'Unknown error';
        throw new Error(`AEAT submission failed: ${errorMessage}`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to submit invoice ${invoice.id} to AEAT:`,
        error
      );
      throw error;
    }
  }

  /**
   * Resubmit a previously failed invoice to AEAT
   *
   * @param invoiceId - ID of the invoice to resubmit
   * @throws Error if invoice not found or resubmission fails
   */
  public async resubmitInvoice(invoiceId: string): Promise<void> {
    if (!this.enabled) {
      throw new Error('SII service is disabled');
    }

    try {
      this.logger.log(`🔄 Resubmitting invoice ${invoiceId} to AEAT`);

      // Fetch invoice with details
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          client: true,
          company: true,
          lines: true,
        },
      });

      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      // Reset SII fields to allow retry
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          siiSent: false,
          siiReference: null,
          siiSentAt: null,
        },
      });

      this.logger.log(`📝 Reset SII fields for invoice ${invoiceId}`);

      // Resubmit
      await this.submitInvoiceToAEAT(
        invoice as InvoiceWithDetails
      );
    } catch (error) {
      this.logger.error(`❌ Failed to resubmit invoice ${invoiceId}:`, error);
      throw error;
    }
  }
}

/**
 * Singleton instance of SIIIntegrationService
 */
export const siiIntegrationService = new SIIIntegrationService();
