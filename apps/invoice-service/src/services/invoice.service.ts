import {
  Invoice,
  InvoiceSearch,
  InvoiceStatusType,
  InvoiceUpdate,
} from '../models/invoice.model';
import { logger } from '../utils/logger';
import { calculationService } from './calculation.service';
// import { pdfService } from './pdf.service'; // Temporarily disabled until dependencies are resolved
import { pdfService } from './pdf.service.stub'; // Using stub for now

// Mock data storage - Replace with actual database implementation
class InvoiceRepository {
  private invoices: Map<string, Invoice> = new Map();
  private nextId = 1;

  generateId(): string {
    return `inv_${Date.now()}_${this.nextId++}`;
  }

  generateNumber(series: string = 'A'): string {
    const year = new Date().getFullYear();
    const invoicesInSeries = Array.from(this.invoices.values()).filter(
      inv => inv.series === series && inv.number?.includes(year.toString())
    );

    const nextNumber = invoicesInSeries.length + 1;
    return `${series}${year}${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const id = this.generateId();
    const number = this.generateNumber(invoice.series);

    const newInvoice: Invoice = {
      ...invoice,
      id,
      number,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoices.get(id) || null;
  }

  async findAll(
    params: InvoiceSearch
  ): Promise<{ invoices: Invoice[]; total: number }> {
    let filtered = Array.from(this.invoices.values());

    // Apply filters
    if (params.status) {
      filtered = filtered.filter(inv => inv.status === params.status);
    }

    if (params.clientId) {
      filtered = filtered.filter(inv => inv.clientId === params.clientId);
    }

    if (params.series) {
      filtered = filtered.filter(inv => inv.series === params.series);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.number?.toLowerCase().includes(searchLower) ||
          inv.client?.name.toLowerCase().includes(searchLower) ||
          inv.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (params.dateFrom) {
      filtered = filtered.filter(inv => inv.date >= params.dateFrom!);
    }

    if (params.dateTo) {
      filtered = filtered.filter(inv => inv.date <= params.dateTo!);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Pagination
    const total = filtered.length;
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const invoices = filtered.slice(startIndex, endIndex);

    return { invoices, total };
  }

  async update(id: string, updates: InvoiceUpdate): Promise<Invoice | null> {
    const invoice = this.invoices.get(id);
    if (!invoice) {
      return null;
    }

    const updatedInvoice = {
      ...invoice,
      ...updates,
      updatedAt: new Date(),
    };

    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async delete(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

class InvoiceService {
  private repository = new InvoiceRepository();

  async create(invoiceData: Invoice): Promise<Invoice> {
    // Calculate totals
    const calculatedData =
      calculationService.calculateInvoiceTotals(invoiceData);

    // Create invoice
    const invoice = await this.repository.create(calculatedData);

    logger.info('Invoice created', { invoiceId: invoice.id });
    return invoice;
  }

  async getAll(params: InvoiceSearch): Promise<{
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { invoices, total } = await this.repository.findAll(params);

    return {
      invoices,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: string): Promise<Invoice | null> {
    return await this.repository.findById(id);
  }

  async update(id: string, updates: InvoiceUpdate): Promise<Invoice | null> {
    // Recalculate totals if items changed
    let calculatedUpdates = updates;
    if (updates.items) {
      calculatedUpdates = calculationService.calculateInvoiceTotals({
        ...updates,
        items: updates.items,
      } as Invoice);
    }

    const invoice = await this.repository.update(id, calculatedUpdates);

    if (invoice) {
      logger.info('Invoice updated', { invoiceId: id });
    }

    return invoice;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);

    if (deleted) {
      logger.info('Invoice deleted', { invoiceId: id });
    }

    return deleted;
  }

  async generatePDF(invoice: Invoice): Promise<Buffer> {
    return await pdfService.generateInvoicePdf(invoice);
  }

  async duplicate(originalInvoice: Invoice): Promise<Invoice> {
    const duplicateData: Invoice = {
      ...originalInvoice,
      id: undefined,
      number: undefined,
      status: 'draft' as InvoiceStatusType,
      date: new Date(),
      dueDate: originalInvoice.dueDate
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined, // 30 days from now
      createdAt: undefined,
      updatedAt: undefined,
    };

    return await this.create(duplicateData);
  }

  async getStats(userId?: string): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    statusBreakdown: Record<InvoiceStatusType, number>;
  }> {
    const { invoices } = await this.repository.findAll({
      page: 1,
      limit: 1000,
    });

    const stats = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      statusBreakdown: {
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
      } as Record<InvoiceStatusType, number>,
    };

    invoices.forEach(invoice => {
      const amount = invoice.total || 0;

      stats.totalAmount += amount;

      // Status breakdown
      if (!stats.statusBreakdown[invoice.status]) {
        stats.statusBreakdown[invoice.status] = 0;
      }
      stats.statusBreakdown[invoice.status] =
        (stats.statusBreakdown[invoice.status] ?? 0) + 1;

      switch (invoice.status) {
        case 'paid':
          stats.paidAmount += amount;
          break;
        case 'overdue':
          stats.overdueAmount += amount;
          break;
        case 'sent':
          stats.pendingAmount += amount;
          break;
      }
    });

    return stats;
  }
}

export const invoiceService = new InvoiceService();
