import { DashboardData, Invoice, InvoiceStatus, Client, FiscalData } from '../types';

// Mock function to simulate fetching dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
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
export const getClients = async (): Promise<Client[]> => {
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
export const getFiscalData = async (year: number, quarter: number): Promise<FiscalData> => {
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