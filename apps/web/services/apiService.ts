import { DashboardData, Invoice, InvoiceStatus, Client, FiscalData } from '../types';
import { httpClient, withIdempotency } from './httpClient';
import { v4 as uuidv4 } from 'uuid';

// Authentication functions
export const login = async (email: string, password: string) => {
  const response = await httpClient.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data: { email: string; password: string; firstName: string; lastName: string; companyName?: string }) => {
  const response = await httpClient.post('/auth/register', data);
  return response.data;
};

// Dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await httpClient.get('/invoices/stats/summary');
  return response.data;
};

// Invoices with pagination
export const getInvoices = async (params?: { page?: number; limit?: number; status?: InvoiceStatus; search?: string }): Promise<{
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await httpClient.get('/invoices', { params });
  return response.data;
};

// Create invoice with idempotency
export const createInvoice = async (invoiceData: {
  clientName: string;
  amount: number;
  description?: string;
  dueDate: string;
  category?: string;
  invoiceType?: 'proforma' | 'official';
}): Promise<Invoice> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.post('/invoices', invoiceData, withIdempotency({}, idempotencyKey));
  return response.data;
};

// Clients
export const getClients = async (): Promise<Client[]> => {
  const response = await httpClient.get('/clients');
  return response.data;
};

// Fiscal data
export const getFiscalData = async (year: number, quarter: number): Promise<FiscalData> => {
  const response = await httpClient.get(`/fiscal/${year}/quarter/${quarter}`);
  return response.data;
};

// Subscription management
export const createSubscription = async (subscriptionData: {
  planId: string;
  paymentMethodId?: string;
}): Promise<any> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.post('/subscriptions', subscriptionData, withIdempotency({}, idempotencyKey));
  return response.data;
};

// Legacy mock functions - only used when VITE_ENABLE_MOCK_DATA=true
const getMockDashboardData = async (): Promise<DashboardData> => {
  console.log("Fetching dashboard data...");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  const recentInvoices: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-005', clientName: 'Innovate Solutions', issueDate: '20/06/2024', dueDate: '20/07/2024', amount: 1200, status: InvoiceStatus.Pending, category: 'Ingreso por Ventas' },
    { id: '2', invoiceNumber: 'INV-004', clientName: 'García & Asociados', issueDate: '15/06/2024', dueDate: '15/07/2024', amount: 850, status: InvoiceStatus.Paid, category: 'Servicios Profesionales' },
    { id: '3', invoiceNumber: 'INV-003', clientName: 'Creative Web Design', issueDate: '01/05/2024', dueDate: '01/06/2024', amount: 2500, status: InvoiceStatus.Overdue, category: 'Diseño y Creatividad' },
  ];

  return {
    monthlyInvoices: {
      count: 12,
      change: 15,
      new: 3,
    },
    totalRevenue: {
      amount: 4580.50,
      change: 8.2,
    },
    pendingAmount: {
      amount: 3700,
      invoiceCount: 2,
    },
    recentInvoices,
  };
};

// Mock function to simulate fetching clients
const getMockClients = async (): Promise<Client[]> => {
    console.log("Fetching clients...");
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
        { id: '1', name: 'Innovate Solutions S.L.' },
        { id: '2', name: 'García & Asociados Gestoría' },
        { id: '3', name: 'Creative Web Design' },
        { id: '4', name: 'Supermercados El Ahorro' },
    ];
};

// Mock function to simulate fetching fiscal data
const getMockFiscalData = async (year: number, quarter: number): Promise<FiscalData> => {
    console.log(`Fetching fiscal data for Q${quarter} ${year}...`);
    await new Promise(resolve => setTimeout(resolve, 700));

    const baseRevenue = {
        1: [{ month: 'Ene', revenue: 3800 }, { month: 'Feb', revenue: 4500 }, { month: 'Mar', revenue: 4100 }],
        2: [{ month: 'Abr', revenue: 4200 }, { month: 'May', revenue: 5100 }, { month: 'Jun', revenue: 4850 }],
        3: [{ month: 'Jul', revenue: 5500 }, { month: 'Ago', revenue: 5300 }, { month: 'Sep', revenue: 6100 }],
        4: [{ month: 'Oct', revenue: 6500 }, { month: 'Nov', revenue: 7200 }, { month: 'Dic', revenue: 8000 }],
    }[quarter] || [];

    // Simulate some variation based on quarter
    const randomFactor = (quarter / 4) + 0.5;

    return {
        quarterlyExpense: 3250.75 * randomFactor,
        pendingVAT: 2345.10 * randomFactor,
        sentInvoices: Math.round(35 * randomFactor),
        revenueChartData: baseRevenue.map(d => ({ ...d, revenue: d.revenue * randomFactor })),
    };
};

// Fallback to mocks if enabled
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

export const getDashboardDataWithFallback = ENABLE_MOCK_DATA ? getMockDashboardData : getDashboardData;
export const getClientsWithFallback = ENABLE_MOCK_DATA ? getMockClients : getClients;
export const getFiscalDataWithFallback = ENABLE_MOCK_DATA ? getMockFiscalData : getFiscalData;