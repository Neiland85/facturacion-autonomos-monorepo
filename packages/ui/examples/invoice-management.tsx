import { useState } from 'react'
import {
  Badge,
  // Componentes Charts
  BarChart,
  // Componentes UI base
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  InvoiceActions,
  // Componentes Overlays
  Modal,
  PieChart,
  TaxCalculator,
  toastSystem
} from '../src/index'

// Tipos
interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'partial' | 'overdue'
  issueDate: string
  dueDate: string
  description?: string
}

// Ejemplo específico: Gestión de Facturas
export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      number: '001/2025',
      client: 'Empresa ABC S.L.',
      amount: 1210,
      status: 'sent',
      paymentStatus: 'pending',
      issueDate: '2025-01-15',
      dueDate: '2025-02-15',
      description: 'Servicios de consultoría'
    },
    {
      id: 'INV-002',
      number: '002/2025',
      client: 'Tech Solutions Ltd.',
      amount: 2500,
      status: 'paid',
      paymentStatus: 'paid',
      issueDate: '2025-01-10',
      dueDate: '2025-02-10',
      description: 'Desarrollo de software'
    }
  ])

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showTaxCalculator, setShowTaxCalculator] = useState(false)

  // Datos para gráficos
  const monthlyData = [
    { label: 'Ene', value: 4500, color: '#10b981' },
    { label: 'Feb', value: 5200, color: '#3b82f6' },
    { label: 'Mar', value: 4800, color: '#f59e0b' },
    { label: 'Abr', value: 6100, color: '#ef4444' },
  ]

  const statusData = [
    { label: 'Pagadas', value: 35, color: '#10b981' },
    { label: 'Pendientes', value: 45, color: '#f59e0b' },
    { label: 'Vencidas', value: 20, color: '#ef4444' },
  ]

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId
        ? { ...inv, status: 'paid', paymentStatus: 'paid' }
        : inv
    ))
    toastSystem.success('Factura marcada como pagada')
  }

  const handleSendReminder = (invoiceId: string) => {
    toastSystem.info('Recordatorio enviado al cliente')
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
    setShowConfirmDelete(false)
    toastSystem.warning('Factura eliminada')
  }

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length

  return (
    <div className="p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1">
            Total facturado: <span className="font-semibold">{totalRevenue}€</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowTaxCalculator(true)}>
            Calculadora IVA
          </Button>
          <Button>Nueva Factura</Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturas</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <Badge variant="outline">{invoices.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">{paidInvoices}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">{pendingInvoices}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={monthlyData}
              title="Evolución de Ingresos"
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={statusData}
              title="Distribución por Estado"
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{invoice.number}</h3>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{invoice.amount}€</p>
                    <p className="text-sm text-gray-500">{invoice.issueDate}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className={
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                    }>
                      {invoice.status === 'paid' ? 'Pagada' :
                        invoice.status === 'sent' ? 'Enviada' : 'Borrador'}
                    </Badge>
                  </div>

                  <InvoiceActions
                    invoiceId={invoice.id}
                    invoiceStatus={invoice.status}
                    onView={() => console.log('Ver factura', invoice.id)}
                    onEdit={() => console.log('Editar factura', invoice.id)}
                    onDelete={() => {
                      setSelectedInvoice(invoice)
                      setShowConfirmDelete(true)
                    }}
                    onSend={() => handleSendReminder(invoice.id)}
                    onDownload={() => toastSystem.success('Factura descargada')}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Calculadora de Impuestos */}
      <Modal
        isOpen={showTaxCalculator}
        onClose={() => setShowTaxCalculator(false)}
        title="Calculadora de IVA"
      >
        <TaxCalculator
          onCalculation={(result) => {
            toastSystem.info(
              'Cálculo realizado',
              `Base: ${result.baseAmount}€ | IVA: ${result.taxAmount}€ | Total: ${result.totalAmount}€`
            )
          }}
        />
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowTaxCalculator(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => selectedInvoice && handleDeleteInvoice(selectedInvoice.id)}
        title="Eliminar Factura"
        message={`¿Estás seguro de que quieres eliminar la factura ${selectedInvoice?.number}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default InvoiceManagement
