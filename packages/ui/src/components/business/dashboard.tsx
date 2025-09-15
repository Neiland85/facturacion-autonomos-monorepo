"use client"

import { motion } from "framer-motion"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"

// Iconos personalizados
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const DollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    isPositive: boolean
  }
  icon: React.ReactNode
  color: string
  bgColor: string
  className?: string
}

function MetricCard({
  title,
  value,
  change,
  icon,
  color,
  bgColor,
  className = "",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`${bgColor} border-0 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <p className={`text-3xl font-bold ${color}`}>
                {value}
              </p>
              {change && (
                <div className="flex items-center mt-2">
                  {change.isPositive ? (
                    <TrendingUpIcon className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {change.value > 0 ? '+' : ''}{change.value}% {change.label}
                  </span>
                </div>
              )}
            </div>
            <div className={`${color} opacity-20`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface BusinessDashboardProps {
  metrics: {
    totalRevenue: number
    monthlyRevenue: number
    totalInvoices: number
    pendingInvoices: number
    totalClients: number
    overdueInvoices: number
    averageInvoiceValue: number
    collectionRate: number
  }
  className?: string
}

export function BusinessDashboard({
  metrics,
  className = "",
}: BusinessDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(metrics.totalRevenue)}
          change={{
            value: 12.5,
            label: "vs mes anterior",
            isPositive: true,
          }}
          icon={<DollarIcon className="w-8 h-8" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />

        <MetricCard
          title="Ingresos Mensuales"
          value={formatCurrency(metrics.monthlyRevenue)}
          change={{
            value: 8.2,
            label: "vs mes anterior",
            isPositive: true,
          }}
          icon={<TrendingUpIcon className="w-8 h-8" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />

        <MetricCard
          title="Total Clientes"
          value={metrics.totalClients}
          change={{
            value: 5.1,
            label: "vs mes anterior",
            isPositive: true,
          }}
          icon={<UsersIcon className="w-8 h-8" />}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />

        <MetricCard
          title="Facturas Totales"
          value={metrics.totalInvoices}
          change={{
            value: -2.3,
            label: "vs mes anterior",
            isPositive: false,
          }}
          icon={<FileTextIcon className="w-8 h-8" />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Métricas secundarias y gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de cobros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Estado de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Facturas Pendientes</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {metrics.pendingInvoices}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Facturas Vencidas</span>
              <Badge variant="outline" className="text-red-600 border-red-600">
                {metrics.overdueInvoices}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasa de Cobro</span>
                <span className="font-medium">{formatPercentage(metrics.collectionRate)}</span>
              </div>
              <Progress
                value={metrics.collectionRate}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen de rendimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.averageInvoiceValue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor Promedio Factura
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.totalInvoices / metrics.totalClients)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Facturas por Cliente
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Objetivo Mensual</span>
                <span className="text-sm font-medium">
                  {formatCurrency(metrics.monthlyRevenue)} / {formatCurrency(50000)}
                </span>
              </div>
              <Progress
                value={(metrics.monthlyRevenue / 50000) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-center">
                {formatPercentage((metrics.monthlyRevenue / 50000) * 100)} del objetivo alcanzado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">
                Recordatorios Importantes
              </h4>
              <ul className="mt-2 text-sm text-orange-800 space-y-1">
                <li>• {metrics.overdueInvoices} facturas pendientes de cobro</li>
                <li>• {metrics.pendingInvoices} facturas enviadas sin pagar</li>
                <li>• Próxima fecha de declaración de impuestos: 20 de este mes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuickStatsProps {
  stats: {
    todayRevenue: number
    weekRevenue: number
    monthRevenue: number
    pendingPayments: number
    overduePayments: number
  }
  className?: string
}

export function QuickStats({
  stats,
  className = "",
}: QuickStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
    }).format(amount)
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.todayRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.weekRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Esta Semana</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.monthRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Este Mes</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">
              {stats.pendingPayments}
            </p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">
              {stats.overduePayments}
            </p>
            <p className="text-xs text-muted-foreground">Vencidas</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
