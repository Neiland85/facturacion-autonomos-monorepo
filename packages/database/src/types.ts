import type { $Enums, Prisma } from "./generated";

// Re-export basic Prisma types
export type Client = Prisma.ClientGetPayload<{}>;
export type InvoiceLine = Prisma.InvoiceLineGetPayload<{}>;

// Tipos extendidos para la aplicación
export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    client: true;
    company: true;
    lines: true;
  };
}>;

export type ClientWithInvoices = Prisma.ClientGetPayload<{
  include: {
    invoices: {
      include: {
        lines: true;
      };
    };
  };
}>;

export type CompanyWithUser = Prisma.CompanyGetPayload<{
  include: {
    user: true;
  };
}>;

// Tipos para forms
export type CreateInvoiceData = Prisma.InvoiceCreateInput;
export type UpdateInvoiceData = Prisma.InvoiceUpdateInput;
export type CreateClientData = Prisma.ClientCreateInput;
export type UpdateClientData = Prisma.ClientUpdateInput;
export type CreateCompanyData = Prisma.CompanyCreateInput;
export type UpdateCompanyData = Prisma.CompanyUpdateInput;

// Tipos para filtros
export type InvoiceFilters = {
  status?: $Enums.InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  clientId?: string;
  search?: string;
  userId?: string;
};

export type ClientFilters = {
  search?: string;
  city?: string;
  province?: string;
  userId?: string;
};

// Tipos para estadísticas
export type InvoiceStats = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
};

export type MonthlyRevenue = {
  month: string;
  year: number;
  amount: number;
  invoiceCount: number;
};
