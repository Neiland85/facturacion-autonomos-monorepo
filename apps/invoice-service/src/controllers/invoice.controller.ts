import { Request, Response } from 'express';
import {
  NotFoundError,
  ValidationError
} from '../middleware/errorHandler';
import {
  InvoiceSchema,
  InvoiceSearch,
  InvoiceSearchSchema,
  InvoiceUpdateSchema
} from '../models/invoice.model';
import { invoiceService } from '../services/invoice.service';
import {
  logInvoiceCreated,
  logInvoiceUpdated,
  logPDFGenerated,
  logger
} from '../utils/logger';

class InvoiceController {
  /**
   * Create new invoice
   */
  async create(req: Request, res: Response) {
    // Validate request body
    const validationResult = InvoiceSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }

    const invoiceData = validationResult.data;
    
    // Create invoice through service
    const invoice = await invoiceService.create(invoiceData);
    
    // Log creation
    logInvoiceCreated(invoice.id!, req.user?.id);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  }

  /**
   * Get all invoices with pagination and filters
   */
  async getAll(req: Request, res: Response) {
    // Validate query parameters
    const searchParams: InvoiceSearch = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      status: req.query.status as any,
      clientId: req.query.clientId as string,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      series: req.query.series as string
    };

    const validationResult = InvoiceSearchSchema.safeParse(searchParams);
    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }

    const result = await invoiceService.getAll(validationResult.data);

    res.status(200).json({
      success: true,
      data: result
    });
  }

  /**
   * Get invoice by ID
   */
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Invoice ID is required');
    }

    const invoice = await invoiceService.getById(id);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  }

  /**
   * Update invoice
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Invoice ID is required');
    }

    // Validate request body
    const validationResult = InvoiceUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }

    const updateData = validationResult.data;
    const invoice = await invoiceService.update(id, updateData);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Log update
    logInvoiceUpdated(id, req.user?.id);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  }

  /**
   * Delete invoice
   */
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Invoice ID is required');
    }

    const deleted = await invoiceService.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('Invoice not found');
    }

    logger.info('Invoice deleted', { invoiceId: id, userId: req.user?.id });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  }

  /**
   * Generate PDF for invoice
   */
  async generatePDF(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Invoice ID is required');
    }

    const invoice = await invoiceService.getById(id);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const pdfBuffer = await invoiceService.generatePDF(invoice);
    
    // Log PDF generation
    logPDFGenerated(id, req.user?.id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${invoice.number}.pdf"`);
    res.send(pdfBuffer);
  }

  /**
   * Duplicate invoice
   */
  async duplicate(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Invoice ID is required');
    }

    const originalInvoice = await invoiceService.getById(id);
    
    if (!originalInvoice) {
      throw new NotFoundError('Invoice not found');
    }

    const duplicatedInvoice = await invoiceService.duplicate(originalInvoice);
    
    // Log creation of duplicate
    logInvoiceCreated(duplicatedInvoice.id!, req.user?.id);

    res.status(201).json({
      success: true,
      message: 'Invoice duplicated successfully',
      data: duplicatedInvoice
    });
  }

  /**
   * Get invoice statistics
   */
  async getStats(req: Request, res: Response) {
    const stats = await invoiceService.getStats(req.user?.id);

    res.status(200).json({
      success: true,
      data: stats
    });
  }
}

export const invoiceController = new InvoiceController();
