"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Iconos personalizados
const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceStatus: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSend?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

export function InvoiceActions({
  invoiceId,
  invoiceStatus,
  onView,
  onEdit,
  onDelete,
  onSend,
  onDownload,
  onDuplicate,
  className = "",
}: InvoiceActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      setIsDeleting(true);
      try {
        await onDelete?.(invoiceId);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const canEdit = invoiceStatus === "draft";
  const canSend = invoiceStatus === "draft";
  const canDelete = invoiceStatus === "draft";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Acciones principales */}
      {onView && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(invoiceId)}
          title="Ver factura"
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      )}

      {onEdit && canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(invoiceId)}
          title="Editar factura"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
      )}

      {onSend && canSend && (
        <Button
          variant="default"
          size="sm"
          onClick={() => onSend(invoiceId)}
          title="Enviar factura"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      )}

      {onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(invoiceId)}
          title="Descargar PDF"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      )}

      {/* Menú de acciones adicionales simple */}
      {(onDuplicate || onDelete) && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMoreActions(!showMoreActions)}
            title="Más acciones"
          >
            <MoreIcon className="h-4 w-4" />
          </Button>

          <AnimatePresence>
            {showMoreActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <div className="py-1">
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate(invoiceId);
                        setShowMoreActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Duplicar factura
                    </button>
                  )}

                  {onDownload && (
                    <button
                      onClick={() => {
                        onDownload(invoiceId);
                        setShowMoreActions(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </button>
                  )}

                  {onDelete && canDelete && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMoreActions(false);
                      }}
                      disabled={isDeleting}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface QuickActionsProps {
  onNewInvoice?: () => void;
  onNewClient?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  className?: string;
}

export function QuickActions({
  onNewInvoice,
  onNewClient,
  onImport,
  onExport,
  className = "",
}: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {onNewInvoice && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onNewInvoice}
                className="h-20 w-full flex-col gap-2"
                variant="default"
              >
                <PlusIcon className="h-6 w-6" />
                Nueva Factura
              </Button>
            </motion.div>
          )}

          {onNewClient && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onNewClient}
                className="h-20 w-full flex-col gap-2"
                variant="outline"
              >
                <PlusIcon className="h-6 w-6" />
                Nuevo Cliente
              </Button>
            </motion.div>
          )}

          {onImport && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onImport}
                className="h-20 w-full flex-col gap-2"
                variant="outline"
              >
                <DownloadIcon className="h-6 w-6" />
                Importar
              </Button>
            </motion.div>
          )}

          {onExport && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onExport}
                className="h-20 w-full flex-col gap-2"
                variant="outline"
              >
                <SendIcon className="h-6 w-6" />
                Exportar
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface InvoiceStatsProps {
  totalInvoices: number;
  totalAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  className?: string;
}

export function InvoiceStats({
  totalInvoices,
  totalAmount,
  pendingAmount,
  overdueAmount,
  className = "",
}: InvoiceStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const stats = [
    {
      label: "Total Facturas",
      value: totalInvoices.toString(),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Ingresos Totales",
      value: formatCurrency(totalAmount),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pendiente Cobro",
      value: formatCurrency(pendingAmount),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Facturas Vencidas",
      value: formatCurrency(overdueAmount),
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${stat.bgColor} border-0`}>
            <CardContent className="p-4">
              <div className="mb-1 text-2xl font-bold">
                <span className={stat.color}>{stat.value}</span>
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
