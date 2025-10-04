// Funciones para integración con el backend
import type { InvoiceStats } from "../types";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RecentInvoice {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

export async function fetchInvoiceStats(): Promise<InvoiceStats> {
  try {
    // Only fetch on client side
    if (typeof window === "undefined") {
      return {
        totalInvoices: 156,
        monthlyRevenue: 31500,
        pendingInvoices: 12,
        activeClients: 48,
        revenueChange: "+12.5% vs mes anterior",
        invoicesChange: "+8 este mes",
      };
    }

    const response = await fetch("/api/dashboard/stats");
    if (!response.ok) {
      throw new Error("Failed to fetch invoice stats");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    // Return default values if API fails
    return {
      totalInvoices: 156,
      monthlyRevenue: 31500,
      pendingInvoices: 12,
      activeClients: 48,
      revenueChange: "+12.5% vs mes anterior",
      invoicesChange: "+8 este mes",
    };
  }
}

export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  try {
    // Only fetch on client side
    if (typeof window === "undefined") {
      return [
        { month: "Ene", revenue: 12500 },
        { month: "Feb", revenue: 15800 },
        { month: "Mar", revenue: 14200 },
        { month: "Abr", revenue: 18900 },
        { month: "May", revenue: 21300 },
        { month: "Jun", revenue: 19800 },
        { month: "Jul", revenue: 23400 },
        { month: "Ago", revenue: 20100 },
        { month: "Sep", revenue: 25600 },
        { month: "Oct", revenue: 27800 },
        { month: "Nov", revenue: 29200 },
        { month: "Dic", revenue: 31500 },
      ];
    }

    const response = await fetch("/api/dashboard/revenue");
    if (!response.ok) {
      throw new Error("Failed to fetch monthly revenue");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    // Return default values if API fails
    return [
      { month: "Ene", revenue: 12500 },
      { month: "Feb", revenue: 15800 },
      { month: "Mar", revenue: 14200 },
      { month: "Abr", revenue: 18900 },
      { month: "May", revenue: 21300 },
      { month: "Jun", revenue: 19800 },
      { month: "Jul", revenue: 23400 },
      { month: "Ago", revenue: 20100 },
      { month: "Sep", revenue: 25600 },
      { month: "Oct", revenue: 27800 },
      { month: "Nov", revenue: 29200 },
      { month: "Dic", revenue: 31500 },
    ];
  }
}

export async function fetchRecentInvoices(): Promise<RecentInvoice[]> {
  try {
    // Only fetch on client side
    if (typeof window === "undefined") {
      return [
        {
          id: "INV-001",
          client: "Empresa ABC S.L.",
          amount: 2450.0,
          date: "2025-01-15",
          status: "paid",
        },
        {
          id: "INV-002",
          client: "Comercial XYZ",
          amount: 1890.5,
          date: "2025-01-14",
          status: "sent",
        },
        {
          id: "INV-003",
          client: "Servicios Tech",
          amount: 3200.0,
          date: "2025-01-12",
          status: "paid",
        },
        {
          id: "INV-004",
          client: "Consultoría Pro",
          amount: 1650.75,
          date: "2025-01-10",
          status: "sent",
        },
        {
          id: "INV-005",
          client: "Digital Solutions",
          amount: 4100.0,
          date: "2025-01-08",
          status: "paid",
        },
      ];
    }

    const response = await fetch("/api/dashboard/recent-invoices");
    if (!response.ok) {
      throw new Error("Failed to fetch recent invoices");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent invoices:", error);
    // Return default values if API fails
    return [
      {
        id: "INV-001",
        client: "Empresa ABC S.L.",
        amount: 2450.0,
        date: "2025-01-15",
        status: "paid",
      },
      {
        id: "INV-002",
        client: "Comercial XYZ",
        amount: 1890.5,
        date: "2025-01-14",
        status: "sent",
      },
      {
        id: "INV-003",
        client: "Servicios Tech",
        amount: 3200.0,
        date: "2025-01-12",
        status: "paid",
      },
      {
        id: "INV-004",
        client: "Consultoría Pro",
        amount: 1650.75,
        date: "2025-01-10",
        status: "sent",
      },
      {
        id: "INV-005",
        client: "Digital Solutions",
        amount: 4100.0,
        date: "2025-01-08",
        status: "paid",
      },
    ];
  }
}
