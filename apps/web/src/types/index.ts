// Global types for the application
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
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

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxType?: 'iva_21' | 'iva_10' | 'iva_4' | 'iva_0' | 'exento';
  taxRate?: number;
  retentionRate?: number;

  // Calculated fields
  subtotal?: number;
  taxAmount?: number;
  retentionAmount?: number;
  total?: number;
}

export interface Invoice {
  id?: string;
  number?: string;
  series?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date | string;
  dueDate?: Date | string;

  issuer: Company;
  client: Company;
  items: InvoiceItem[];

  // Calculated totals
  subtotal?: number;
  totalTax?: number;
  totalRetention?: number;
  total?: number;

  // Optional fields
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;

  // Metadata
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

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

export interface InvoiceStats {
  totalInvoices: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  activeClients: number;
  revenueChange: string;
  invoicesChange: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}
