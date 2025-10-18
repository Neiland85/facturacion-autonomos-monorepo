/**
 * @fileoverview Local DTO types for invoice service
 * These are copied from the shared types package to avoid import issues
 */

// Invoice status enum
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Invoice DTO
export interface InvoiceDTO {
  id: string;
  number: string;
  series?: string;
  date: string;
  issueDate?: string;
  dueDate: string;
  subtotal: number;
  totalTax: number;
  totalRetention: number;
  total: number;
  status: InvoiceStatus;
  clientId: string;
  client?: ClientDTO;
  issuer?: Company;
  items: InvoiceItemDTO[];
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice item DTO
export interface InvoiceItemDTO {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxType?: string;
  taxRate?: number;
  retentionRate?: number;
  subtotal: number;
  totalTax: number;
  totalRetention: number;
  total: number;
}

// Company DTO (alias for ClientDTO for backward compatibility)
export interface Company {
  id: string;
  name: string;
  email?: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Invoice stats DTO
export interface InvoiceStatsDTO {
  totalInvoices: number;
  totalRevenue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
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

// Client DTO
export interface ClientDTO {
  id: string;
  name: string;
  email?: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Create invoice DTO
export interface CreateInvoiceDTO {
  clientId: string;
  items: Omit<InvoiceItemDTO, 'id' | 'total'>[];
  dueDate?: Date;
}
