/**
 * @fileoverview Mappers for converting Prisma models to DTOs
 */

import {
  Invoice,
  InvoiceLine,
  Company,
} from '/Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/packages/database/src/generated';
import {
  InvoiceDTO,
  InvoiceItemDTO,
  InvoiceStatsDTO,
  InvoiceStatus,
  Company as CompanyDTO,
} from '../types/dto';

/**
 * Maps a Prisma Company model to Company DTO
 */
export function mapCompanyToDTO(company: Company): CompanyDTO {
  return {
    id: company.id,
    name: company.name,
    taxId: company.cif, // Prisma usa 'cif' en lugar de 'taxId'
    address: company.address,
    city: company.city,
    postalCode: company.postalCode,
    country: 'España', // No existe en Prisma, usar valor por defecto
    email: company.email ?? undefined,
    phone: company.phone ?? undefined,
  };
}

/**
 * Maps a Prisma InvoiceLine model to InvoiceItemDTO
 */
export function mapInvoiceItemToDTO(item: InvoiceLine): InvoiceItemDTO {
  // Calcular valores basados en los campos disponibles en Prisma
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unitPrice);
  const vatRate = Number(item.vatRate);

  const subtotal = quantity * unitPrice;
  const totalTax = subtotal * (vatRate / 100);
  const total = subtotal + totalTax;

  return {
    id: item.id,
    description: item.description,
    quantity,
    unitPrice,
    discount: 0, // No existe en Prisma, usar 0 por defecto
    taxType: getTaxTypeFromRate(vatRate),
    taxRate: vatRate,
    retentionRate: 0, // No existe en Prisma, usar 0 por defecto
    subtotal,
    totalTax,
    totalRetention: 0, // No existe en Prisma, usar 0 por defecto
    total,
  };
}

/**
 * Helper function to determine tax type from rate
 */
function getTaxTypeFromRate(
  rate: number
): 'iva_21' | 'iva_10' | 'iva_4' | 'iva_0' | 'exento' | undefined {
  // Lógica simplificada - en producción debería ser más compleja
  if (rate === 21) return 'iva_21';
  if (rate === 10) return 'iva_10';
  if (rate === 4) return 'iva_4';
  if (rate === 0) return 'iva_0';
  return 'exento'; // Default
}

/**
 * Maps a Prisma Invoice model to InvoiceDTO
 */
/**
 * Maps a Prisma Invoice model to InvoiceDTO
 */
export function mapInvoiceToDTO(
  invoice: Invoice & {
    client: {
      id: string;
      name: string;
      nifCif: string;
      address: string | null;
      city: string | null;
      postalCode: string | null;
      email: string | null;
      phone: string | null;
    };
    company: Company;
    lines: InvoiceLine[];
  }
): InvoiceDTO {
  const items = invoice.lines.map(mapInvoiceItemToDTO);

  return {
    id: invoice.id,
    number: invoice.number,
    series: invoice.series,
    date: invoice.issueDate.toISOString(),
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? new Date().toISOString(),
    status: mapPrismaStatusToDTO(invoice.status),
    subtotal: Number(invoice.subtotal),
    totalTax: Number(invoice.vatAmount),
    totalRetention: 0,
    total: Number(invoice.total),
    clientId: invoice.client.id,
    client: {
      id: invoice.client.id,
      name: invoice.client.name,
      taxId: invoice.client.nifCif,
      address: invoice.client.address ?? '',
      city: invoice.client.city ?? '',
      postalCode: invoice.client.postalCode ?? '',
      country: 'España',
      email: invoice.client.email ?? undefined,
      phone: invoice.client.phone ?? undefined,
    },
    issuer: mapCompanyToDTO(invoice.company),
    items,
    notes: invoice.notes ?? undefined,
    // Campos que no existen en Prisma
    paymentTerms: undefined,
    paymentMethod: undefined,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

/**
 * Maps Prisma InvoiceStatus to DTO InvoiceStatus
 */
function mapPrismaStatusToDTO(status: string): InvoiceStatus {
  switch (status) {
    case 'DRAFT':
      return InvoiceStatus.DRAFT;
    case 'SENT':
      return InvoiceStatus.SENT;
    case 'PAID':
      return InvoiceStatus.PAID;
    case 'OVERDUE':
      return InvoiceStatus.OVERDUE;
    case 'CANCELLED':
      return InvoiceStatus.CANCELLED;
    default:
      return InvoiceStatus.DRAFT;
  }
}

/**
 * Maps invoice stats from database to DTO
 */
export function mapInvoiceStatsToDTO(
  stats: Record<string, unknown>
): InvoiceStatsDTO {
  const statusBreakdown =
    (stats.statusBreakdown as Record<string, number>) || {};

  return {
    totalInvoices: (stats.totalInvoices as number) ?? 0,
    totalRevenue: (stats.totalRevenue as number) ?? 0,
    totalAmount: (stats.totalAmount as number) ?? 0,
    paidAmount: (stats.paidAmount as number) ?? 0,
    pendingAmount: (stats.pendingAmount as number) ?? 0,
    overdueAmount: (stats.overdueAmount as number) ?? 0,
    pendingInvoices: (stats.pendingInvoices as number) ?? 0,
    overdueInvoices: (stats.overdueInvoices as number) ?? 0,
    paidInvoices: (stats.paidInvoices as number) ?? 0,
    statusBreakdown: {
      [InvoiceStatus.DRAFT]: statusBreakdown.DRAFT ?? 0,
      [InvoiceStatus.SENT]: statusBreakdown.SENT ?? 0,
      [InvoiceStatus.PAID]: statusBreakdown.PAID ?? 0,
      [InvoiceStatus.OVERDUE]: statusBreakdown.OVERDUE ?? 0,
      [InvoiceStatus.CANCELLED]: statusBreakdown.CANCELLED ?? 0,
    },
    monthlyRevenue:
      (stats.monthlyRevenue as Array<{
        month: number;
        year: number;
        revenue: number;
        count: number;
      }>) ?? [],
    topClients:
      (stats.topClients as Array<{
        clientId: string;
        clientName: string;
        totalAmount: number;
        invoiceCount: number;
      }>) ?? [],
    recentInvoices: (stats.recentInvoices as number) ?? 0,
  };
}
