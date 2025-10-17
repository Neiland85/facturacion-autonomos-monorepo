// Global types for the application
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

// Shared DTOs (aligned with packages/types for compatibility)
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface Company {
  /** ID opcional del cliente/empresa (usado en frontend para navegación) */
  id?: string;
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

// Labels and colors for UI
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
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

// Re-export with local names for backward compatibility
export type Invoice = InvoiceDTO;
export type InvoiceItem = InvoiceItemDTO;
export type InvoiceStats = InvoiceStatsDTO;

export interface InvoiceFilters {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  series?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  requiresTwoFactor?: boolean;
}

export interface AuthError {
  success: false;
  error: string;
  code?: string;
}

// Error handling types
export interface ErrorContext {
  operation?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  redirect?: boolean;
  context?: ErrorContext;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: ErrorContext;
  stack?: string;
}

// Subscription types
export * from './subscription.types';
