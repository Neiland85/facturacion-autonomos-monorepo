'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice, InvoiceItem, Company } from '@/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [issuer, setIssuer] = useState<Company>({
    name: '',
    taxId: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    email: '',
    phone: '',
  });

  const [client, setClient] = useState<Company>({
    name: '',
    taxId: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    email: '',
    phone: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxType: 'iva_21',
      taxRate: 21,
      retentionRate: 0,
    },
  ]);

  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [dueDate, setDueDate] = useState(() => {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    return due.toISOString().split('T')[0];
  });

  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');

  // Calculations
  const calculateItemSubtotal = (item: InvoiceItem): number => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = baseAmount * (item.discount / 100);
    return baseAmount - discountAmount;
  };

  const calculateItemTax = (item: InvoiceItem): number => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.taxRate / 100);
  };

  const calculateItemRetention = (item: InvoiceItem): number => {
    const subtotal = calculateItemSubtotal(item);
    return subtotal * (item.retentionRate / 100);
  };

  const calculateItemTotal = (item: InvoiceItem): number => {
    const subtotal = calculateItemSubtotal(item);
    const tax = calculateItemTax(item);
    const retention = calculateItemRetention(item);
    return subtotal + tax - retention;
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  };

  const calculateTotalTax = (): number => {
    return items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  };

  const calculateTotalRetention = (): number => {
    return items.reduce((sum, item) => sum + calculateItemRetention(item), 0);
  };

  const calculateTotal = (): number => {
    return (
      calculateSubtotal() + calculateTotalTax() - calculateTotalRetention()
    );
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!issuer.name.trim() || !issuer.taxId.trim()) {
      setError('Los datos del emisor son obligatorios');
      return false;
    }

    if (!client.name.trim() || !client.taxId.trim()) {
      setError('Los datos del cliente son obligatorios');
      return false;
    }

    if (
      items.length === 0 ||
      items.some(
        item =>
          !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      setError('Debe incluir al menos un artículo válido');
      return false;
    }

    if (new Date(dueDate) < new Date(issueDate)) {
      setError(
        'La fecha de vencimiento no puede ser anterior a la fecha de emisión'
      );
      return false;
    }

    return true;
  };

  // Handle item changes
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate tax rate based on tax type
    if (field === 'taxType') {
      const taxRates = {
        iva_21: 21,
        iva_10: 10,
        iva_4: 4,
        iva_0: 0,
        exento: 0,
      };
      newItems[index].taxRate = taxRates[value as keyof typeof taxRates] || 21;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxType: 'iva_21',
        taxRate: 21,
        retentionRate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Submit handler
  const handleSubmit = async (
    e: FormEvent,
    submitStatus: 'draft' | 'sent' = 'draft'
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const invoiceData: Omit<
        Invoice,
        'id' | 'number' | 'createdAt' | 'updatedAt'
      > = {
        issuer,
        client,
        items,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        paymentTerms,
        status: submitStatus,
        subtotal: calculateSubtotal(),
        totalTax: calculateTotalTax(),
        totalRetention: calculateTotalRetention(),
        total: calculateTotal(),
      };

      const response = await invoiceService.createInvoice(invoiceData);

      if (response.success) {
        setSuccess(true);
        router.push(`/invoices/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ¡Factura creada exitosamente!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Redirigiendo al detalle de la factura...
            </p>
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
                <span className="text-gray-500">Nueva Factura</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
            <button
              onClick={() => router.push('/invoices')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Volver
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={e => handleSubmit(e, status)} className="space-y-8">
          {/* Issuer Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Datos del Emisor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre/Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={issuer.name}
                  onChange={e => setIssuer({ ...issuer, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIF/NIF *
                </label>
                <input
                  type="text"
                  required
                  value={issuer.taxId}
                  onChange={e =>
                    setIssuer({ ...issuer, taxId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={issuer.address}
                  onChange={e =>
                    setIssuer({ ...issuer, address: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={issuer.city}
                  onChange={e => setIssuer({ ...issuer, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={issuer.postalCode}
                  onChange={e =>
                    setIssuer({ ...issuer, postalCode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={issuer.country}
                  onChange={e =>
                    setIssuer({ ...issuer, country: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={issuer.email}
                  onChange={e =>
                    setIssuer({ ...issuer, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={issuer.phone}
                  onChange={e =>
                    setIssuer({ ...issuer, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Client Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Datos del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre/Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={client.name}
                  onChange={e => setClient({ ...client, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIF/NIF *
                </label>
                <input
                  type="text"
                  required
                  value={client.taxId}
                  onChange={e =>
                    setClient({ ...client, taxId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={client.address}
                  onChange={e =>
                    setClient({ ...client, address: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={client.city}
                  onChange={e => setClient({ ...client, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={client.postalCode}
                  onChange={e =>
                    setClient({ ...client, postalCode: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={client.country}
                  onChange={e =>
                    setClient({ ...client, country: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={client.email}
                  onChange={e =>
                    setClient({ ...client, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={client.phone}
                  onChange={e =>
                    setClient({ ...client, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Líneas de Factura
            </h2>

            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 mb-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      required
                      value={item.description}
                      onChange={e =>
                        updateItem(index, 'description', e.target.value)
                      }
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={item.quantity}
                      onChange={e =>
                        updateItem(
                          index,
                          'quantity',
                          parseFloat(e.target.value) || 1
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={e =>
                        updateItem(
                          index,
                          'unitPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={e =>
                        updateItem(
                          index,
                          'discount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IVA
                    </label>
                    <select
                      value={item.taxType}
                      onChange={e =>
                        updateItem(index, 'taxType', e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="iva_21">IVA 21%</option>
                      <option value="iva_10">IVA 10%</option>
                      <option value="iva_4">IVA 4%</option>
                      <option value="iva_0">IVA 0%</option>
                      <option value="exento">Exento</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                {/* Item totals */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(calculateItemSubtotal(item))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">IVA:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(calculateItemTax(item))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Retención:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(calculateItemRetention(item))}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-bold">
                      {formatCurrency(calculateItemTotal(item))}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium"
            >
              + Agregar Línea
            </button>
          </div>

          {/* Additional Info Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información Adicional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones de Pago
                </label>
                <textarea
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  rows={2}
                  placeholder="Ej: Pago a 30 días"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen de Totales
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculateSubtotal())}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-600">IVA</div>
                <div className="text-lg font-semibold text-blue-900">
                  {formatCurrency(calculateTotalTax())}
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-md">
                <div className="text-sm text-red-600">Retención</div>
                <div className="text-lg font-semibold text-red-900">
                  {formatCurrency(calculateTotalRetention())}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-md">
                <div className="text-sm text-green-600">Total</div>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/invoices')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e, 'draft')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md font-medium"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar como Borrador'}
            </button>
            <button
              type="submit"
              onClick={() => setStatus('sent')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear y Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
