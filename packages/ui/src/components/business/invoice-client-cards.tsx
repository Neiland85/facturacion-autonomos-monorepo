"use client"

import { motion } from "framer-motion"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

// Iconos personalizados
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const EuroIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3h3m-3 3h3m6-11a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
export type PaymentStatus = "pending" | "paid" | "partial" | "overdue"

interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  issueDate: string
  dueDate: string
  description?: string
}

interface InvoiceCardProps {
  invoice: Invoice
  onView?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  onSend?: (invoice: Invoice) => void
  className?: string
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-orange-100 text-orange-800 border-orange-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const labels = {
    draft: "Borrador",
    sent: "Enviada",
    paid: "Pagada",
    overdue: "Vencida",
    cancelled: "Cancelada",
  }

  return (
    <Badge variant="outline" className={statusColors[status]}>
      {labels[status]}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const labels = {
    pending: "Pendiente",
    paid: "Pagado",
    partial: "Parcial",
    overdue: "Vencido",
  }

  return (
    <Badge variant="outline" className={paymentStatusColors[status]}>
      {labels[status]}
    </Badge>
  )
}

export function InvoiceCard({
  invoice,
  onView,
  onEdit,
  onDelete,
  onSend,
  className = "",
}: InvoiceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`cursor-pointer transition-shadow hover:shadow-md ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{invoice.number}</CardTitle>
                <p className="text-sm text-muted-foreground">{invoice.client}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Estados */}
            <div className="flex flex-wrap gap-2">
              <InvoiceStatusBadge status={invoice.status} />
              <PaymentStatusBadge status={invoice.paymentStatus} />
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Vencida
                </Badge>
              )}
            </div>

            {/* Fechas */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Emisión: {formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Vence: {formatDate(invoice.dueDate)}</span>
              </div>
            </div>

            {/* Descripción */}
            {invoice.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {invoice.description}
              </p>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(invoice)
                  }}
                >
                  Ver
                </Button>
              )}
              {onEdit && invoice.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(invoice)
                  }}
                >
                  Editar
                </Button>
              )}
              {onSend && invoice.status === 'draft' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSend(invoice)
                  }}
                >
                  Enviar
                </Button>
              )}
              {onDelete && invoice.status === 'draft' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(invoice)
                  }}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string
  address?: string
  totalInvoices: number
  totalAmount: number
  outstandingAmount: number
}

interface ClientCardProps {
  client: Client
  onView?: (client: Client) => void
  onEdit?: (client: Client) => void
  onCreateInvoice?: (client: Client) => void
  className?: string
}

export function ClientCard({
  client,
  onView,
  onEdit,
  onCreateInvoice,
  className = "",
}: ClientCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`cursor-pointer transition-shadow hover:shadow-md ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Información de contacto */}
            {client.phone && (
              <p className="text-sm text-muted-foreground">
                📞 {client.phone}
              </p>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {client.totalInvoices}
                </p>
                <p className="text-xs text-muted-foreground">Facturas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(client.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(client.outstandingAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Pendiente</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(client)
                  }}
                >
                  Ver
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(client)
                  }}
                >
                  Editar
                </Button>
              )}
              {onCreateInvoice && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateInvoice(client)
                  }}
                >
                  Nueva Factura
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
