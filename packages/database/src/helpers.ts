import { prisma } from './client';
import type {
  ClientFilters,
  InvoiceFilters,
  InvoiceStats,
  MonthlyRevenue,
} from './types';

/**
 * Helper functions para queries comunes de la base de datos
 */

// Invoice helpers
export const invoiceHelpers = {
  /**
   * Obtener facturas con filtros
   */
  async getFilteredInvoices(filters: InvoiceFilters = {}) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {};
      if (filters.dateFrom) where.issueDate.gte = filters.dateFrom;
      if (filters.dateTo) where.issueDate.lte = filters.dateTo;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.invoice.findMany({
      where,
      include: {
        client: true,
        company: true,
        lines: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  },

  /**
   * Obtener estadísticas de facturas
   */
  async getInvoiceStats(userId: string): Promise<InvoiceStats> {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      select: {
        status: true,
        total: true,
      },
    });

    const stats = invoices.reduce(
      (
        acc: {
          total: number;
          paid: number;
          pending: number;
          overdue: number;
          totalAmount: number;
          paidAmount: number;
          pendingAmount: number;
        },
        invoice: { status: string; total: any }
      ) => {
        acc.total++;
        acc.totalAmount += Number(invoice.total);

        if (invoice.status === 'PAID') {
          acc.paid++;
          acc.paidAmount += Number(invoice.total);
        } else if (invoice.status === 'SENT') {
          acc.pending++;
          acc.pendingAmount += Number(invoice.total);
        } else if (invoice.status === 'OVERDUE') {
          acc.overdue++;
          acc.pendingAmount += Number(invoice.total);
        }

        return acc;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    );

    return stats;
  },

  /**
   * Generar siguiente número de factura
   */
  async getNextInvoiceNumber(
    userId: string,
    series: string = 'A'
  ): Promise<string> {
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        userId,
        series,
      },
      orderBy: { number: 'desc' },
    });

    if (!lastInvoice) {
      return `${series}001`;
    }

    // Extraer número de la factura (ej: A001 -> 001)
    const numberPart = lastInvoice.number.replace(series, '');
    const nextNumber = (parseInt(numberPart) + 1).toString().padStart(3, '0');

    return `${series}${nextNumber}`;
  },
};

// Client helpers
export const clientHelpers = {
  /**
   * Obtener clientes con filtros
   */
  async getFilteredClients(userId: string, filters: ClientFilters = {}) {
    const where: any = { userId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nifCif: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }

    return prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Obtener cliente con facturas
   */
  async getClientWithInvoices(clientId: string) {
    return prisma.client.findUnique({
      where: { id: clientId },
      include: {
        invoices: {
          include: {
            lines: true,
          },
          orderBy: { issueDate: 'desc' },
        },
      },
    });
  },
};

// Analytics helpers
export const analyticsHelpers = {
  /**
   * Obtener ingresos mensuales
   */
  async getMonthlyRevenue(
    userId: string,
    year?: number
  ): Promise<MonthlyRevenue[]> {
    const whereClause: any = {
      userId,
      status: 'PAID',
    };

    if (year) {
      whereClause.issueDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        issueDate: true,
        total: true,
      },
    });

    // Agrupar por mes
    const monthlyData = invoices.reduce(
      (
        acc: Record<string, MonthlyRevenue>,
        invoice: { issueDate: Date; total: any }
      ) => {
        const date = new Date(invoice.issueDate);
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!acc[key]) {
          acc[key] = {
            month,
            year,
            amount: 0,
            invoiceCount: 0,
          };
        }

        acc[key].amount += Number(invoice.total);
        acc[key].invoiceCount++;

        return acc;
      },
      {} as Record<string, MonthlyRevenue>
    );

    return Object.values(monthlyData).sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year;
      return (
        new Date(`${a.month} 1, ${a.year}`).getMonth() -
        new Date(`${b.month} 1, ${b.year}`).getMonth()
      );
    });
  },
};
