import {
  ApiResponse,
  Client,
  Company,
  DashboardData,
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  InvoiceStatusLabels,
  PaginatedResult,
} from "../types";
import { httpClient, withIdempotency } from "./httpClient";
import { v4 as uuidv4 } from "uuid";

// Import new consolidated services
import {
  authService,
  invoiceService,
  clientService,
  companyService,
  dashboardService,
  subscriptionService,
} from "../src/services";

export type InvoiceListParams = {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  search?: string;
  series?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ClientListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CreateInvoicePayload = {
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
};

export type UpdateInvoicePayload = Partial<CreateInvoicePayload> & {
  status?: InvoiceStatus;
};

export type CreateClientPayload = {
  name: string;
  nifCif: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;

export type UpsertCompanyPayload = {
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
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === "object" && value !== null && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const mapClient = (client: any): Client => ({
  id: client.id,
  name: client.name,
  nifCif: client.nifCif,
  address: client.address ?? null,
  city: client.city ?? null,
  postalCode: client.postalCode ?? null,
  province: client.province ?? null,
  phone: client.phone ?? null,
  email: client.email ?? null,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

const mapCompany = (company: any): Company => ({
  id: company.id,
  name: company.name,
  cif: company.cif,
  address: company.address,
  city: company.city,
  postalCode: company.postalCode,
  province: company.province,
  phone: company.phone ?? null,
  email: company.email ?? null,
  website: company.website ?? null,
  taxRegime: company.taxRegime ?? null,
  vatNumber: company.vatNumber ?? null,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt,
});

const mapInvoiceLine = (line: any): InvoiceLine => ({
  id: line.id,
  description: line.description,
  quantity: toNumber(line.quantity),
  price: toNumber(line.price),
  vatRate: toNumber(line.vatRate),
  amount: toNumber(line.amount),
});

const mapInvoice = (invoice: any): Invoice => ({
  id: invoice.id,
  number: invoice.number,
  series: invoice.series,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate ?? null,
  subtotal: toNumber(invoice.subtotal),
  vatAmount: toNumber(invoice.vatAmount),
  total: toNumber(invoice.total),
  status: (invoice.status as InvoiceStatus) ?? InvoiceStatus.Draft,
  notes: invoice.notes ?? null,
  signedXml: invoice.signedXml ?? null,
  pdfUrl: invoice.pdfUrl ?? null,
  client: mapClient(invoice.client),
  company: mapCompany(invoice.company),
  lines: Array.isArray(invoice.lines) ? invoice.lines.map(mapInvoiceLine) : [],
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});

const mapPaginated = <T>(payload: any, mapper: (item: any) => T): PaginatedResult<T> => ({
  items: Array.isArray(payload.items) ? payload.items.map(mapper) : [],
  page: payload.page,
  limit: payload.limit,
  total: payload.total,
  totalPages: payload.totalPages,
});

// Authentication
export const login = async (email: string, password: string) => {
  const response = await httpClient.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}) => {
  const response = await httpClient.post("/auth/register", data);
  return response.data;
};

// Dashboard / stats
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await httpClient.get<ApiResponse<any>>("/invoices/stats/summary");
  const payload = response.data.data;

  return {
    totals: {
      totalInvoices: payload.totals.totalInvoices ?? 0,
      subtotal: toNumber(payload.totals.subtotal),
      vatAmount: toNumber(payload.totals.vatAmount),
      totalRevenue: toNumber(payload.totals.totalRevenue),
    },
    byStatus: Array.isArray(payload.byStatus)
      ? payload.byStatus.map((item: any) => ({
          status: (item.status as InvoiceStatus) ?? InvoiceStatus.Draft,
          count: item.count ?? item._count ?? 0,
          totalAmount: toNumber(item.totalAmount ?? item._sum?.total),
        }))
      : [],
    recentInvoices: Array.isArray(payload.recentInvoices)
      ? payload.recentInvoices.map(mapInvoice)
      : [],
  };
};

// Invoices
export const getInvoices = async (
  params: InvoiceListParams = {}
): Promise<PaginatedResult<Invoice>> => {
  const response = await httpClient.get<ApiResponse<any>>("/invoices", {
    params,
  });

  return mapPaginated(response.data.data, mapInvoice);
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await httpClient.get<ApiResponse<any>>(`/invoices/${id}`);
  return mapInvoice(response.data.data);
};

export const createInvoice = async (
  payload: CreateInvoicePayload
): Promise<Invoice> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.post<ApiResponse<any>>(
    "/invoices",
    payload,
    withIdempotency({}, idempotencyKey)
  );

  return mapInvoice(response.data.data);
};

export const updateInvoice = async (
  id: string,
  payload: UpdateInvoicePayload
): Promise<Invoice> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.put<ApiResponse<any>>(
    `/invoices/${id}`,
    payload,
    withIdempotency({}, idempotencyKey)
  );

  return mapInvoice(response.data.data);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`/invoices/${id}`);
};

export const downloadSignedXml = async (id: string): Promise<Blob> => {
  const response = await httpClient.get(`/invoices/${id}/xml/signed`, {
    responseType: "blob",
  });

  return response.data as Blob;
};

// Clients
export const getClients = async (
  params: ClientListParams = {}
): Promise<PaginatedResult<Client>> => {
  const response = await httpClient.get<ApiResponse<any>>("/clients", {
    params,
  });

  return mapPaginated(response.data.data, mapClient);
};

export const createClient = async (
  payload: CreateClientPayload
): Promise<Client> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.post<ApiResponse<any>>(
    "/clients",
    payload,
    withIdempotency({}, idempotencyKey)
  );

  return mapClient(response.data.data);
};

export const updateClient = async (
  id: string,
  payload: UpdateClientPayload
): Promise<Client> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.put<ApiResponse<any>>(
    `/clients/${id}`,
    payload,
    withIdempotency({}, idempotencyKey)
  );

  return mapClient(response.data.data);
};

export const deleteClient = async (id: string): Promise<void> => {
  await httpClient.delete<ApiResponse<void>>(`/clients/${id}`);
};

// Company
export const getMyCompany = async (): Promise<Company> => {
  const response = await httpClient.get<ApiResponse<any>>("/companies/me");
  return mapCompany(response.data.data);
};

export const createCompany = async (
  payload: UpsertCompanyPayload
): Promise<Company> => {
  const response = await httpClient.post<ApiResponse<any>>("/companies", payload);
  return mapCompany(response.data.data);
};

export const updateCompany = async (
  payload: UpsertCompanyPayload
): Promise<Company> => {
  const response = await httpClient.put<ApiResponse<any>>("/companies", payload);
  return mapCompany(response.data.data);
};

// Subscription management (unchanged)
export const createSubscription = async (subscriptionData: {
  planId: string;
  paymentMethodId?: string;
}): Promise<any> => {
  const idempotencyKey = uuidv4();
  const response = await httpClient.post(
    "/subscriptions",
    subscriptionData,
    withIdempotency({}, idempotencyKey)
  );
  return response.data;
};

// Mock helpers for demo environments
const runtimeEnv = (import.meta as Record<string, any> | undefined)?.env ?? {};
const ENABLE_MOCK_DATA = runtimeEnv.VITE_ENABLE_MOCK_DATA === "true";

const mockCompany: Company = {
  id: "company-1",
  name: "Mi Empresa Creativa S.L.",
  cif: "B12345678",
  address: "Calle Ejemplo 123",
  city: "Madrid",
  postalCode: "28001",
  province: "Madrid",
  phone: "+34911222333",
  email: "hola@miempresa.es",
  website: "https://miempresa.es",
  taxRegime: "GENERAL",
  vatNumber: "ESB12345678",
};

const mockClient = (id: string, name: string): Client => ({
  id,
  name,
  nifCif: `X${id.toUpperCase()}`,
  address: "Calle Ficticia 45",
  city: "Madrid",
  postalCode: "28002",
  province: "Madrid",
  phone: "+34910000000",
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
});

const mockInvoice = (id: string, overrides: Partial<Invoice> = {}): Invoice => ({
  id,
  number: `INV-${id}`,
  series: "A",
  issueDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  subtotal: 1200,
  vatAmount: 252,
  total: 1452,
  status: InvoiceStatus.Sent,
  notes: "",
  signedXml: null,
  pdfUrl: null,
  client: mockClient("client-1", "Innovate Solutions"),
  company: mockCompany,
  lines: [
    {
      id: `line-${id}`,
      description: "Servicio de consultoría",
      quantity: 1,
      price: 1200,
      vatRate: 21,
      amount: 1200,
    },
  ],
  ...overrides,
});

const getMockDashboardData = async (): Promise<DashboardData> => ({
  totals: {
    totalInvoices: 5,
    subtotal: 5600,
    vatAmount: 1176,
    totalRevenue: 6776,
  },
  byStatus: [
    { status: InvoiceStatus.Sent, count: 2, totalAmount: 2900 },
    { status: InvoiceStatus.Paid, count: 2, totalAmount: 2876 },
    { status: InvoiceStatus.Draft, count: 1, totalAmount: 1000 },
  ],
  recentInvoices: [
    mockInvoice("005", { total: 1800, client: mockClient("client-2", "García & Asociados") }),
    mockInvoice("004", { total: 850, status: InvoiceStatus.Paid }),
    mockInvoice("003", { total: 2500, status: InvoiceStatus.Overdue }),
  ],
});

const getMockClients = async (): Promise<PaginatedResult<Client>> => ({
  items: [
    mockClient("client-1", "Innovate Solutions S.L."),
    mockClient("client-2", "García & Asociados Gestoría"),
    mockClient("client-3", "Creative Web Design"),
    mockClient("client-4", "Supermercados El Ahorro"),
  ],
  page: 1,
  limit: 10,
  total: 4,
  totalPages: 1,
});

export const getDashboardDataWithFallback = ENABLE_MOCK_DATA
  ? getMockDashboardData
  : getDashboardData;

export const getClientsWithFallback = ENABLE_MOCK_DATA
  ? (async () => (await getMockClients()).items)
  : async (params?: ClientListParams) => (await getClients(params)).items;

export const InvoiceStatusDisplay = InvoiceStatusLabels;