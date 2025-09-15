import { useState } from 'react'
import {
  // Componentes Charts
  BarChart,
  // Componentes UI base
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // Componentes Business
  InvoiceCard,
  // Componentes Overlays
  Modal,
  PieChart,
  TaxCalculator,
  toastSystem
} from '../src/index'

// Tipos necesarios
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

// Ejemplo simple de uso de la librería UI
export function SimpleDashboard() {
  const [showModal, setShowModal] = useState(false)

  // Datos de ejemplo
  const invoiceData: Invoice = {
    id: 'INV-001',
    number: '001/2025',
    client: 'Empresa ABC S.L.',
    amount: 1210,
    status: 'sent',
    paymentStatus: 'pending',
    issueDate: '2025-01-15',
    dueDate: '2025-02-15',
    description: 'Servicios de consultoría'
  }

  const chartData = [
    { label: 'Enero', value: 4500, color: '#10b981' },
    { label: 'Febrero', value: 5200, color: '#3b82f6' },
    { label: 'Marzo', value: 4800, color: '#f59e0b' },
    { label: 'Abril', value: 6100, color: '#ef4444' },
  ]

  const handleCreateInvoice = () => {
    toastSystem.success('Factura creada', 'La factura se ha creado correctamente')
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard TributariApp</h1>
        <Button onClick={() => setShowModal(true)}>
          Nueva Factura
        </Button>
      </div>

      {/* Grid de componentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Tarjeta de Factura */}
        <Card>
          <CardHeader>
            <CardTitle>Factura Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceCard
              invoice={invoiceData}
              onView={() => console.log('Ver factura')}
              onEdit={() => console.log('Editar factura')}
              onDelete={() => console.log('Eliminar factura')}
            />
          </CardContent>
        </Card>

        {/* Calculadora de Impuestos */}
        <Card>
          <CardHeader>
            <CardTitle>Calculadora IVA</CardTitle>
          </CardHeader>
          <CardContent>
            <TaxCalculator
              onCalculation={(result) => {
                toastSystem.info('Cálculo realizado', `Total: ${result.totalAmount}€`)
              }}
            />
          </CardContent>
        </Card>

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={chartData}
              title="Ingresos por Mes"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Gráfico Circular */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={[
                { label: 'Servicios', value: 60, color: '#3b82f6' },
                { label: 'Productos', value: 30, color: '#10b981' },
                { label: 'Otros', value: 10, color: '#f59e0b' },
              ]}
              title="Distribución por Categoría"
            />
          </CardContent>
        </Card>

      </div>

      {/* Modal de Nueva Factura */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Nueva Factura"
      >
        <div className="space-y-4">
          <p>Formulario para crear nueva factura...</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInvoice}>
              Crear Factura
            </Button>
          </div>
        </div>
      </Modal>

      {/* Botón de ayuda sin tooltip por ahora */}
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" title="Ayuda y soporte técnico">
          ?
        </Button>
      </div>
    </div>
  )
}

export default SimpleDashboard
