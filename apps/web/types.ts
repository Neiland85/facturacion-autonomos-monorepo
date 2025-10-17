// types.ts

export type View =
    | "dashboard"
    | "invoices"
    | "new-invoice"
    | "fiscal"
    | "grants"
    | "ai-assistant"
    | "settings"
    | "login"
    | "register"
    | "pricing"
    | "multi-account";

export type Theme = "light" | "dark" | "system";

export type SubscriptionTier = "free" | "premium" | "enterprise";

export interface UserProfile {
    companyName: string;
    email: string;
}

export enum InvoiceStatus {
    Draft = "DRAFT",
    Sent = "SENT",
    Paid = "PAID",
    Overdue = "OVERDUE",
    Cancelled = "CANCELLED",
}

export const InvoiceStatusLabels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Draft]: "Borrador",
    [InvoiceStatus.Sent]: "Enviada",
    [InvoiceStatus.Paid]: "Pagada",
    [InvoiceStatus.Overdue]: "Vencida",
    [InvoiceStatus.Cancelled]: "Cancelada",
};

export interface Client {
    id: string;
    name: string;
    nifCif: string;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    province?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Company {
    id: string;
    name: string;
    cif: string;
    address: string;
    city: string;
    postalCode: string;
    province: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    taxRegime?: string | null;
    vatNumber?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface InvoiceLine {
    id: string;
    description: string;
    quantity: number;
    price: number;
    vatRate: number;
    amount: number;
}

export interface Invoice {
    id: string;
    number: string;
    series: string;
    issueDate: string;
    dueDate: string | null;
    subtotal: number;
    vatAmount: number;
    total: number;
    status: InvoiceStatus;
    notes?: string | null;
    signedXml?: string | null;
    pdfUrl?: string | null;
    client: Client;
    company: Company;
    lines: InvoiceLine[];
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface InvoiceStatsSummary {
    totals: {
        totalInvoices: number;
        subtotal: number;
        vatAmount: number;
        totalRevenue: number;
    };
    byStatus: Array<{
        status: InvoiceStatus;
        count: number;
        totalAmount: number;
    }>;
    recentInvoices: Invoice[];
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

export type DashboardData = InvoiceStatsSummary;

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