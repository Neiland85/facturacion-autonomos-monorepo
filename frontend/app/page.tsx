"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Users, Euro, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const stats = [
    {
      title: "Facturas Mes",
      value: "12",
      description: "+2 últ. mes",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-gradient-to-br from-primary/10 to-primary/5",
    },
    {
      title: "Ingresos Totales",
      value: "€4,250",
      description: "+15% últ. mes",
      icon: Euro,
      color: "text-secondary",
      bgColor: "bg-gradient-to-br from-secondary/10 to-secondary/5",
    },
    {
      title: "Clientes Activos",
      value: "8",
      description: "2 nuevos",
      icon: Users,
      color: "text-accent-foreground",
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/5",
    },
    {
      title: "Pendiente Cobro",
      value: "€1,200",
      description: "3 facturas",
      icon: TrendingUp,
      color: "text-muted-foreground",
      bgColor: "bg-gradient-to-br from-muted/10 to-muted/5",
    },
  ]

  const recentInvoices = [
    {
      id: "INV-001",
      client: "Empresa ABC S.L.",
      amount: "€850",
      status: "Pagada",
      date: "15 Ene",
    },
    {
      id: "INV-002",
      client: "Consultora XYZ",
      amount: "€1,200",
      status: "Pendiente",
      date: "10 Ene",
    },
    {
      id: "INV-003",
      client: "Startup Tech",
      amount: "€650",
      status: "Vencida",
      date: "28 Dic",
    },
  ]

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Pagada":
        return "default" // Using default for green-like appearance with primary color
      case "Pendiente":
        return "secondary"
      case "Vencida":
        return "destructive"
      default:
        return "outline"
    }
  }
  // For default badge to be green-ish, you might need to adjust your theme or use custom classes.
  // For simplicity, I'll use shadcn's variants. If you want specific colors:
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "Pagada":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600"
      case "Vencida":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bienvenido a TributariApp</h1>
          <p className="text-muted-foreground">Tu gestión fiscal, simplificada.</p>
        </div>
        <Link href="/nueva-factura" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Mobile: 2 columns, Tablet+: 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={`shadow-soft backdrop-blur-sm border-0 ${stat.bgColor} bg-subtle-grid`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className={`text-xs sm:text-sm font-medium ${stat.color}`}>{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Invoices */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Facturas Recientes</CardTitle>
            <CardDescription>Un vistazo a tu actividad reciente.</CardDescription>
          </div>
          <Link href="/facturas">
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary hover:bg-primary/10 hover:text-primary"
            >
              Ver Todas <ArrowRight className="w-3 h-3 ml-1.5 hidden sm:inline" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{invoice.client}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.id} - {invoice.date}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-semibold text-sm text-foreground">{invoice.amount}</p>
                    <Badge variant="outline" className={`mt-1 text-xs ${getStatusColorClass(invoice.status)}`}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay facturas recientes.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - simplified for mobile */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/nuevo-cliente">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2 text-primary" />
              Añadir Cliente
            </Button>
          </Link>
          <Link href="/reportes">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Ver Reportes
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
