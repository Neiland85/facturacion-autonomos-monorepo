// Componentes de negocio específicos para TributariApp
// Estos componentes están diseñados para funcionalidades de facturación y gestión empresarial

export { BusinessDashboard, QuickStats } from './dashboard';
export { InvoiceActions, InvoiceStats, QuickActions } from './invoice-actions';
export {
  ClientCard,
  InvoiceCard,
  InvoiceStatusBadge,
  PaymentStatusBadge,
} from './invoice-client-cards';
export { QuickTaxCalculator, TaxCalculator } from './tax-calculator';

// Tipos comunes para la gestión de facturas
export type InvoiceStatus =
  | 'all'
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';
export type PaymentStatus = 'all' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  issueDate: string;
  dueDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  address?: string;
  totalInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  createdAt: string;
}

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Constantes para estados y configuraciones
export const INVOICE_STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Pagada', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
} as const;

export const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
} as const;

// Funciones de utilidad para cálculos fiscales
export const calculateTax = (baseAmount: number, taxRate: number): number => {
  return Math.round(((baseAmount * taxRate) / 100) * 100) / 100;
};

export const calculateTotalWithTax = (
  baseAmount: number,
  taxRate: number
): number => {
  return baseAmount + calculateTax(baseAmount, taxRate);
};

export const calculateTaxRate = (
  totalAmount: number,
  taxAmount: number
): number => {
  if (totalAmount === 0) return 0;
  return Math.round((taxAmount / (totalAmount - taxAmount)) * 100 * 100) / 100;
};
