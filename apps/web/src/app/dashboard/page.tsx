import { useState } from 'react';

// Importar componentes desde el paquete UI compilado
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui';

// Definiciones de tipos
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface TaxCalculationResult {
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  description: string;
  paymentStatus: 'paid' | 'pending';
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-001',
      client: 'Cliente Demo',
      amount: 1000,
      status: 'paid',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      description: 'Factura de prueba',
      paymentStatus: 'paid',
    },
  ]);

  const [showTaxCalculator, setShowTaxCalculator] = useState(false);

  // Calcular estadísticas
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = totalInvoiced - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard - Facturación Autónomos
        </h1>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Facturado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                €{totalInvoiced.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                €{totalPaid.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pendiente de Cobro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                €{totalPending.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowTaxCalculator(true)}
                className="w-full"
              >
                🧮 Calcular Impuestos
              </Button>
              <Button variant="outline" className="w-full">
                📄 Crear Nueva Factura
              </Button>
              <Button variant="outline" className="w-full">
                👥 Gestionar Clientes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>API Facturas:</span>
                  <span className="text-green-600">✅ Online</span>
                </div>
                <div className="flex justify-between">
                  <span>API Impuestos:</span>
                  <span className="text-green-600">✅ Online</span>
                </div>
                <div className="flex justify-between">
                  <span>Base de Datos:</span>
                  <span className="text-green-600">✅ Conectada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de facturas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{invoice.number}</h3>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                    <p className="text-sm text-gray-500">{invoice.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{invoice.amount.toFixed(2)}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                        }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal del calculador de impuestos */}
      {showTaxCalculator && (
        <Dialog open={showTaxCalculator} onOpenChange={setShowTaxCalculator}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calculador de Impuestos</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-center text-gray-600">
                Funcionalidad de cálculo de impuestos próximamente disponible.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
