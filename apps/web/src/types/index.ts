// Re-export shared types from the types package
export * from '@facturacion/types';
export type { Invoice, InvoiceStats } from '@facturacion/types';

// Additional frontend-specific types can be defined here if needed
export interface UIState {
  loading: boolean;
  error: string | null;
}

export interface DashboardState extends UIState {
  stats: InvoiceStats | null;
  recentInvoices: Invoice[];
}

// Legacy type definitions - these should be migrated to @facturacion/types
// Keeping temporarily for backward compatibility
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
