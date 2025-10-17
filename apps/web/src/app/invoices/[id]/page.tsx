'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice } from '@/types';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await invoiceService.getInvoice(id as string);
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        setError('Factura no encontrada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar factura');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice?.id) return;
    try {
      await invoiceService.downloadPDF(invoice.id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  const handleDelete = async () => {
    if (!invoice?.id) return;
    try {
      await invoiceService.deleteInvoice(invoice.id);
      router.push('/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Error al eliminar la factura');
    }
    setShowDeleteModal(false);
  };

  const handleDuplicate = async () => {
    if (!invoice?.id) return;
    try {
      // This would need to be implemented in the service
      // For now, redirect to new invoice page
      router.push('/invoices/new');
    } catch (err) {
      console.error('Error duplicating invoice:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelada', className: 'bg-gray-200 text-gray-900' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateItemSubtotal = (item: any): number => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * (item.discount / 100);
    return baseAmount - discountAmount;
  };

  const calculateItemTax = (item: any): number => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.taxRate / 100);
  };

  const calculateItemRetention = (item: any): number => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.retentionRate / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Factura no encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              La factura que buscas no existe o ha sido eliminada.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/invoices')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Volver a Facturas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <a href="/" className="text-gray-400 hover:text-gray-500">
                  Dashboard
                </a>
              </li>
              <li>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <a
                  href="/invoices"
                  className="text-gray-400 hover:text-gray-500"
                >
                  Facturas
                </a>
              </li>
              <li>
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <span className="text-gray-500">
                  {invoice.number || `Factura ${invoice.id}`}
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {invoice.number || `Factura ${invoice.id}`}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/invoices')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Descargar PDF
              </button>
              <button
                onClick={handleDuplicate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Duplicar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Issuer and Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Issuer */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emisor</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Nombre:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {invoice.issuer?.name}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  CIF/NIF:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {invoice.issuer?.taxId}
                </span>
              </div>
              {invoice.issuer?.address && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Dirección:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.issuer.address}
                  </span>
                </div>
              )}
              {(invoice.issuer?.city || invoice.issuer?.postalCode) && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Ciudad/CP:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.issuer.city} {invoice.issuer.postalCode}
                  </span>
                </div>
              )}
              {invoice.issuer?.country && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    País:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.issuer.country}
                  </span>
                </div>
              )}
              {invoice.issuer?.email && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.issuer.email}
                  </span>
                </div>
              )}
              {invoice.issuer?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Teléfono:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.issuer.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Client */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cliente
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Nombre:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {invoice.client?.name}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  CIF/NIF:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {invoice.client?.taxId}
                </span>
              </div>
              {invoice.client?.address && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Dirección:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.client.address}
                  </span>
                </div>
              )}
              {(invoice.client?.city || invoice.client?.postalCode) && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Ciudad/CP:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.client.city} {invoice.client.postalCode}
                  </span>
                </div>
              )}
              {invoice.client?.country && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    País:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.client.country}
                  </span>
                </div>
              )}
              {invoice.client?.email && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.client.email}
                  </span>
                </div>
              )}
              {invoice.client?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Teléfono:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {invoice.client.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Líneas de Factura
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retención
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.discount > 0 ? `${item.discount}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(calculateItemSubtotal(item))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(calculateItemTax(item))}
                      {item.taxRate > 0 && (
                        <span className="text-xs"> ({item.taxRate}%)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.retentionRate > 0
                        ? formatCurrency(calculateItemRetention(item))
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(
                        calculateItemSubtotal(item) +
                          calculateItemTax(item) -
                          calculateItemRetention(item)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-end">
            <div className="w-full max-w-md">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.totalTax || 0)}
                  </span>
                </div>
                {invoice.totalRetention && invoice.totalRetention > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retención:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(invoice.totalRetention)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información Adicional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Fecha de Emisión:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Fecha de Vencimiento:
                </span>
                <span className="ml-2 text-sm text-gray-900">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Estado:
                </span>
                <span className="ml-2">{getStatusBadge(invoice.status)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {invoice.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Notas:
                  </span>
                  <p className="mt-1 text-sm text-gray-900">{invoice.notes}</p>
                </div>
              )}
              {invoice.paymentTerms && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Condiciones de Pago:
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {invoice.paymentTerms}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>ID: {invoice.id}</div>
              {invoice.createdAt && (
                <div>
                  Creada: {new Date(invoice.createdAt).toLocaleString('es-ES')}
                </div>
              )}
              {invoice.updatedAt && (
                <div>
                  Actualizada:{' '}
                  {new Date(invoice.updatedAt).toLocaleString('es-ES')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  ¿Eliminar factura?
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Esta acción no se puede deshacer. ¿Estás seguro de que quieres
                  eliminar la factura {invoice.number || invoice.id}?
                </p>
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
