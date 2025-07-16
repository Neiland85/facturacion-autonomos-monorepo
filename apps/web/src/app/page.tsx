'use client';

import { invoiceService } from '@/services/invoice.service';
import type { Invoice, InvoiceStats } from '@/types';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Load statistics
        const statsResponse = await invoiceService.getStatistics();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Load recent invoices
        const invoicesResponse = await invoiceService.getInvoices({ limit: 5 });
        setRecentInvoices(invoicesResponse.invoices || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: 'status-draft',
      sent: 'status-sent',
      paid: 'status-paid',
      overdue: 'status-overdue',
      cancelled: 'status-cancelled',
    };

    const statusLabels = {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };

    return (
      <span
        className={
          statusClasses[status as keyof typeof statusClasses] || 'status-draft'
        }
      >
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Facturación
            </h1>
            <div className="flex space-x-4">
              <button className="btn-primary">+ Nueva Factura</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Facturas
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalInvoices}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Importe Total
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Cobrado</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.paidAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pendiente
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.pendingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Invoices */}
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Facturas Recientes
              </h2>
              <button className="btn-outline">Ver Todas</button>
            </div>

            {recentInvoices.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Número</th>
                      <th className="table-header-cell">Cliente</th>
                      <th className="table-header-cell">Fecha</th>
                      <th className="table-header-cell">Estado</th>
                      <th className="table-header-cell">Total</th>
                      <th className="table-header-cell">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {recentInvoices.map(invoice => (
                      <tr key={invoice.id} className="table-row">
                        <td className="table-cell font-medium">
                          {invoice.number}
                        </td>
                        <td className="table-cell">{invoice.client.name}</td>
                        <td className="table-cell">
                          {new Date(invoice.issueDate).toLocaleDateString(
                            'es-ES'
                          )}
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="table-cell">
                          {formatCurrency(invoice.total || 0)}
                        </td>
                        <td className="table-cell">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Ver
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay facturas todavía
                </h3>
                <p className="text-gray-500 mb-6">
                  Comienza creando tu primera factura
                </p>
                <button className="btn-primary">Crear Primera Factura</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
