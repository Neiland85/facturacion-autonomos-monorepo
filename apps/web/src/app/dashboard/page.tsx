import { Suspense } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import { RevenueChart } from "@/components/revenue-chart"
import { RecentInvoicesTable } from "@/components/recent-invoices-table"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, Clock, Users, Plus, Download, Eye } from "lucide-react"
import { fetchInvoiceStats, fetchMonthlyRevenue, fetchRecentInvoices } from "@/lib/api"

// Componente para cargar datos del servidor
async function DashboardContent() {
  // Fetch de datos en paralelo
  const [stats, monthlyRevenue, recentInvoices] = await Promise.all([
    fetchInvoiceStats(),
    fetchMonthlyRevenue(),
    fetchRecentInvoices(),
  ])

  // Datos de ejemplo si la API no está disponible
  const exampleMonthlyRevenue =
    monthlyRevenue.length > 0
      ? monthlyRevenue
      : [
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
        ]

  const exampleInvoices =
    recentInvoices.length > 0
      ? recentInvoices.map(invoice => ({
          ...invoice,
          status: (invoice.status === "pending" ? "sent" : invoice.status) as "paid" | "sent" | "draft" | "overdue" | "cancelled",
        }))
      : [
          { id: "INV-001", client: "Empresa ABC S.L.", amount: 2450.0, date: "2025-01-15", status: "paid" as const },
          { id: "INV-002", client: "Comercial XYZ", amount: 1890.5, date: "2025-01-14", status: "sent" as const },
          { id: "INV-003", client: "Servicios Tech", amount: 3200.0, date: "2025-01-12", status: "paid" as const },
          { id: "INV-004", client: "Consultoría Pro", amount: 1650.75, date: "2025-01-10", status: "sent" as const },
          { id: "INV-005", client: "Digital Solutions", amount: 4100.0, date: "2025-01-08", status: "paid" as const },
        ]

  const displayStats = {
    totalInvoices: stats.totalInvoices || 156,
    monthlyRevenue: stats.monthlyRevenue || 31500,
    pendingInvoices: stats.pendingInvoices || 12,
    activeClients: stats.activeClients || 48,
    revenueChange: stats.revenueChange || "+12.5% vs mes anterior",
    invoicesChange: stats.invoicesChange || "+8 este mes",
  }

  return (
    <>
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Facturas"
          value={displayStats.totalInvoices}
          change={displayStats.invoicesChange}
          changeType="positive"
          icon={FileText}
        />
        <MetricCard
          title="Ingresos del Mes"
          value={`€${displayStats.monthlyRevenue.toLocaleString("es-ES")}`}
          change={displayStats.revenueChange}
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Facturas Pendientes"
          value={displayStats.pendingInvoices}
          change="Requieren atención"
          changeType="neutral"
          icon={Clock}
        />
        <MetricCard
          title="Clientes Activos"
          value={displayStats.activeClients}
          change="+3 este mes"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Factura
        </Button>
        <Button size="lg" variant="outline" className="gap-2 bg-transparent">
          <Eye className="h-4 w-4" />
          Ver Todas las Facturas
        </Button>
        <Button size="lg" variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Gráfico de ingresos */}
      <RevenueChart data={exampleMonthlyRevenue} />

      {/* Tabla de facturas recientes */}
      <RecentInvoicesTable invoices={exampleInvoices} />
    </>
  )
}

// Skeleton de carga
function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
      <div className="h-[400px] animate-pulse rounded-lg bg-muted" />
      <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
    </>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 pl-64">
        <DashboardHeader systemStatus="operational" />

        <main className="space-y-6 p-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground">Aquí está el resumen de tu actividad de facturación</p>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
