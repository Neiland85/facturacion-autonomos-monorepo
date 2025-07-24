/**
 * @fileoverview Shared TypeScript type definitions for the facturacion-autonomos project
 * @version 1.0.0
 */

// Tipos básicos de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
}

// Tipos de cliente
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

// Tipos de factura
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  amount: number;
  vat: number;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  description?: string;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  totalAmount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface CreateInvoiceRequest {
  clientId: string;
  amount: number;
  vat: number;
  issueDate: Date;
  dueDate: Date;
  description?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface UpdateInvoiceRequest {
  clientId?: string;
  amount?: number;
  vat?: number;
  status?: InvoiceStatus;
  issueDate?: Date;
  dueDate?: Date;
  description?: string;
  items?: CreateInvoiceItemRequest[];
}

// Tipos de autenticación
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Tipos de cálculos fiscales
export interface TaxCalculationRequest {
  amount: number;
  vatRate: number;
  retentionRate?: number;
  taxYear?: number;
  taxpayerType?: 'individual' | 'company';
}

export interface TaxCalculationResponse {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  retentionAmount: number;
  netAmount: number;
}

export interface TaxType {
  id: string;
  name: string;
  description: string;
  rate: number;
}

// Tipos de configuración
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface AppConfig {
  api: ApiConfig;
  taxCalculator: ApiConfig;
  features: {
    enableTaxCalculator: boolean;
    enablePdfGeneration: boolean;
    enableEmailNotifications: boolean;
  };
}

// Tipos de respuesta API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos de error
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos de filtros y consultas
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface InvoiceFilters extends QueryParams {
  status?: InvoiceStatus;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface ClientFilters extends QueryParams {
  country?: string;
  hasInvoices?: boolean;
}

// Tipos de eventos
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  timestamp: Date;
}

export interface InvoiceCreatedEvent extends DomainEvent {
  type: 'invoice.created';
  data: {
    invoice: Invoice;
  };
}

export interface InvoicePaidEvent extends DomainEvent {
  type: 'invoice.paid';
  data: {
    invoice: Invoice;
    paymentDate: Date;
  };
}

export interface ClientCreatedEvent extends DomainEvent {
  type: 'client.created';
  data: {
    client: Client;
  };
}

// Tipos de notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Tipos de reportes
export interface ReportData {
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  taxAmount: number;
}

// Tipos de estadísticas de facturas
export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  statusBreakdown: Record<string, number>;
}

// Constantes de tipos
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const TAXPAYER_TYPES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company',
} as const;

export const VAT_RATES = {
  GENERAL: 0.21,
  REDUCED: 0.1,
  SUPER_REDUCED: 0.04,
} as const;

// Tipos de utilidades
export type Primitive = string | number | boolean | null | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Exportar todo como default también
export default {
  INVOICE_STATUS,
  USER_ROLES,
  TAXPAYER_TYPES,
  VAT_RATES,
};
