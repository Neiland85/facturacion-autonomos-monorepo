// types.ts

export type View = 'dashboard' | 'invoices' | 'new-invoice' | 'fiscal' | 'grants' | 'ai-assistant' | 'settings' | 'login' | 'register' | 'pricing' | 'multi-account';

export type Theme = 'light' | 'dark' | 'system';

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface UserProfile {
  companyName: string;
  email: string;
}

export enum InvoiceStatus {
    Paid = "Pagada",
    Pending = "Pendiente",
    Overdue = "Vencida",
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: InvoiceStatus;
    category?: string;
    description?: string;
    invoiceType?: 'proforma' | 'official';
}

export interface InvoiceSuggestion {
    clientName: string;
    description: string;
    amount: number;
}

export interface VoiceInvoiceData {
    clientName: string;
    description: string;
    amount: number;
    invoiceType: 'proforma' | 'official';
}

export interface DashboardData {
    monthlyInvoices: {
        count: number;
        change: number;
        new: number;
    };
    totalRevenue: {
        amount: number;
        change: number;
    };
    pendingAmount: {
        amount: number;
        invoiceCount: number;
    };
    recentInvoices: Invoice[];
}

export interface Client {
  id: string;
  name: string;
}

export interface Grant {
    entity: string;
    name: string;
    description: string;
    requirements: string[];
    applicationLink: string;
}

export interface GrantSearchParams {
    type: string;
    sector: string;
    region: string;
    grantType: string;
    scope: 'España' | 'Unión Europea' | 'Ambos';
}

export interface IdVerificationData {
    fullName: string;
    documentNumber: string;
    birthDate: string;
}

export interface FiscalData {
    quarterlyExpense: number;
    pendingVAT: number;
    sentInvoices: number;
    revenueChartData: { month: string, revenue: number }[];
}

export interface ManagedAccount {
    id: string;
    name: string;
}

export type TeamMemberRole = 'Admin' | 'Contable' | 'Asistente';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: TeamMemberRole;
    accountId: string;
}

export interface QuarterlySummaryPayload {
  summaryText: string;
  trend: string;
  nextPayments: string[];
}

export interface ExplainerPayload {
    concept: string;
    explanation: string;
    links: { title: string; url: string }[];
}

export interface Message {
  role: 'user' | 'model';
  type: 'text' | 'summary' | 'explainer';
  content: string;
  payload?: QuarterlySummaryPayload | ExplainerPayload;
}

export interface CreditCard {
    id: string;
    cardholderName: string;
    last4: string;
    expiryDate: string; // "MM/YY"
    cardType: 'visa' | 'mastercard' | 'amex' | 'unknown';
    isDefault: boolean;
}