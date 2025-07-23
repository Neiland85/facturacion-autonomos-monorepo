/**
 * @fileoverview Core business logic and utilities for the facturacion-autonomos project
 * @version 1.0.0
 */

// Tipos básicos
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  amount: number;
  vat: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTaxId = (taxId: string): boolean => {
  // Validación básica de NIF/CIF español
  const taxIdRegex = /^\d{8}[A-Z]$|^[A-Z]\d{7}[A-Z]$/;
  return taxIdRegex.test(taxId);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES').format(date);
};

// Constantes de negocio
export const VAT_RATES = {
  GENERAL: 0.21,
  REDUCED: 0.10,
  SUPER_REDUCED: 0.04
} as const;

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue'
} as const;

// Utilidades de cálculo
export const calculateVAT = (amount: number, rate: number = VAT_RATES.GENERAL): number => {
  return amount * rate;
};

export const calculateTotalAmount = (amount: number, vatRate: number = VAT_RATES.GENERAL): number => {
  return amount + calculateVAT(amount, vatRate);
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `FAC-${year}-${timestamp}`;
};

// Clase para manejo de errores de negocio
export class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// Utilidades de logging
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }
};

// Exportar calculador fiscal
export { CalculadorFiscal } from './fiscal/calculador';

export default {
  validateEmail,
  validateTaxId,
  formatCurrency,
  formatDate,
  VAT_RATES,
  INVOICE_STATUS,
  calculateVAT,
  calculateTotalAmount,
  generateInvoiceNumber,
  BusinessError,
  logger
};

// Placeholder for core functionality
export const version = "1.0.0";
