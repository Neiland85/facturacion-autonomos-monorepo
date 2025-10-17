/**
 * @fileoverview Local DTO types for invoice service
 * These are copied from the shared types package to avoid import issues
 */

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface Company {
  name: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface InvoiceItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: 'iva_21' | 'iva_10' | 'iva_4' | 'iva_0' | 'exento' | undefined;
  taxRate: number;
  retentionRate: number;
  subtotal: number;
  totalTax: number;
  totalRetention: number;
  total: number;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  series: string;
  issueDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  subtotal: number;
  totalTax: number;
  totalRetention: number;
  total: number;
  client: {
    id: string;
    name: string;
    taxId: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  issuer: Company;
  items: InvoiceItemDTO[];
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStatsDTO {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  statusBreakdown: Record<InvoiceStatus, number>;
  monthlyRevenue: Array<{
    month: number;
    year: number;
    revenue: number;
    count: number;
  }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
  recentInvoices: number;
}
