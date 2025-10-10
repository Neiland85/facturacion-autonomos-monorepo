"use client";

import { MetricCard } from '@/components/metric-card';
import { RevenueChart } from '@/components/revenue-chart';
import { RecentInvoicesTable } from '@/components/recent-invoices-table';

export default function DashboardPage() {
  const chartData = [
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Abr', revenue: 16000 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 25000 },
    { month: 'Jul', revenue: 28000 },
    { month: 'Ago', revenue: 24000 },
    { month: 'Sep', revenue: 30000 },
    { month: 'Oct', revenue: 32000 },
    { month: 'Nov', revenue: 29000 },
    { month: 'Dic', revenue: 35000 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Resumen de tu actividad de facturación
          </p>
        </div>

        {/* Métricas */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Ingresos Totales"
            value="125.350,50 €"
            trend="+12.5%"
            trendUp={true}
          />
          <MetricCard
            title="Facturas Emitidas"
            value="48"
            trend="+8 este mes"
            trendUp={true}
          />
          <MetricCard
            title="Pendientes de Cobro"
            value="15.420,00 €"
            trend="-5.2%"
            trendUp={false}
          />
          <MetricCard
            title="Clientes Activos"
            value="28"
            trend="+3 nuevos"
            trendUp={true}
          />
        </div>

        {/* Gráfico */}
        <RevenueChart data={chartData} />

        {/* Tabla */}
        <RecentInvoicesTable />
      </div>
    </div>
  );
}
