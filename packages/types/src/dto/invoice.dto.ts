/**
 * @fileoverview Data Transfer Objects for Invoice operations
 * Shared between frontend and backend
 */

import { Company } from './company.types';

// Enums normalizados para status de facturas
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// DTOs para respuestas de API
export interface InvoiceDTO {
  id: string;
  number: string;
  series?: string;
  status: InvoiceStatus;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string

  // Datos del emisor (empresa del usuario)
  issuer: Company;

  // Datos del cliente
  client: Company;

  // Líneas de factura
  items: InvoiceItemDTO[];

  // Totales calculados
  subtotal: number;
  totalTax: number;
  totalRetention: number;
  total: number;

  // Campos opcionales
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;

  // Metadata
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface InvoiceItemDTO {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxType?: 'iva_21' | 'iva_10' | 'iva_4' | 'iva_0' | 'exento';
  taxRate: number;
  retentionRate?: number;

  // Campos calculados
  subtotal: number;
  taxAmount: number;
  retentionAmount: number;
  total: number;
}

// DTOs para requests de creación/actualización
export interface CreateInvoiceDTO {
  series?: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string

  // Datos del cliente (el emisor se obtiene del usuario autenticado)
  client: Company;

  // Líneas de factura
  items: CreateInvoiceItemDTO[];

  // Campos opcionales
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  status?: InvoiceStatus;
}

export interface CreateInvoiceItemDTO {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxType?: 'iva_21' | 'iva_10' | 'iva_4' | 'iva_0' | 'exento';
  taxRate: number;
  retentionRate?: number;
}

export interface UpdateInvoiceDTO {
  series?: string;
  status?: InvoiceStatus;
  issueDate?: string; // ISO date string
  dueDate?: string; // ISO date string

  // Datos del cliente
  client?: Partial<Company>;

  // Líneas de factura
  items?: CreateInvoiceItemDTO[];

  // Campos opcionales
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
}

// DTOs para filtros y paginación
export interface InvoiceFiltersDTO {
  status?: InvoiceStatus;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  series?: string;
  search?: string;
  page?: number;
  limit?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginatedInvoicesDTO {
  invoices: InvoiceDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// DTOs para estadísticas
export interface InvoiceStatsDTO {
  /** Número total de facturas */
  totalInvoices: number;
  /** Monto total de todas las facturas */
  totalAmount: number;
  /** Monto total de facturas pagadas */
  paidAmount: number;
  /** Monto total de facturas pendientes */
  pendingAmount: number;
  /** Monto total de facturas vencidas */
  overdueAmount: number;
  /** Desglose por estado de factura */
  statusBreakdown: Record<InvoiceStatus, number>;
  /** Ingresos mensuales de los últimos 6-12 meses */
  monthlyRevenue: Array<{
    month: number;
    year: number;
    revenue: number;
    count: number;
  }>;
  /** Top 5-10 clientes por facturación */
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
  /** Contador de facturas recientes (últimos 30 días) */
  recentInvoices: number;
}

// DTOs para respuestas de API
export interface InvoiceApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de utilidad para mapeo
export type InvoiceStatusLabel =
  | 'Borrador'
  | 'Enviada'
  | 'Pagada'
  | 'Vencida'
  | 'Cancelada';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, InvoiceStatusLabel> =
  {
    [InvoiceStatus.DRAFT]: 'Borrador',
    [InvoiceStatus.SENT]: 'Enviada',
    [InvoiceStatus.PAID]: 'Pagada',
    [InvoiceStatus.OVERDUE]: 'Vencida',
    [InvoiceStatus.CANCELLED]: 'Cancelada',
  };

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [InvoiceStatus.SENT]: 'bg-blue-100 text-blue-800',
  [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
  [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
  [InvoiceStatus.CANCELLED]: 'bg-gray-200 text-gray-900',
};
