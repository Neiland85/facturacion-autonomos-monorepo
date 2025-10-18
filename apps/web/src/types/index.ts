/**
 * Central types file for the frontend application
 * Re-exports all type definitions from root types.ts and local type files
 * This file serves as the single source of truth for type imports: import { Type } from '@/types'
 */

// Re-export all types from root types.ts
export type {
  View,
  Theme,
  SubscriptionTier,
  UserProfile,
  Client,
  Company,
  InvoiceLine,
  Invoice,
  PaginatedResult,
  ApiResponse,
  InvoiceStatsSummary,
  DashboardData,
  InvoiceSuggestion,
  VoiceInvoiceData,
  Grant,
  GrantSearchParams,
  IdVerificationData,
  FiscalData,
  ManagedAccount,
  TeamMemberRole,
  TeamMember,
  QuarterlySummaryPayload,
  ExplainerPayload,
  Message,
  CreditCard,
} from '../../types';

export { InvoiceStatus, InvoiceStatusLabels } from '../../types';

// Re-export subscription types
export type {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  CancelSubscriptionRequest,
  ReactivateSubscriptionRequest,
} from './subscription.types';

/**
 * Service-specific types
 */

// Invoice service types
export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  series?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

// Client service types
export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateClientRequest {
  name: string;
  nifCif: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
}

export type UpdateClientRequest = Partial<CreateClientRequest>;

// Company service types
export interface UpsertCompanyRequest {
  name: string;
  cif: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone?: string;
  email?: string;
  website?: string;
  taxRegime?: string;
}

// Invoice creation types
export interface CreateInvoiceRequest {
  clientId: string;
  companyId: string;
  issueDate: string;
  dueDate?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    price: number;
    vatRate: number;
  }>;
}

export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest> & {
  status?: string;
};

// Paginated response type (used by multiple services)
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
