"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

// Iconos personalizados
const SearchIcon = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
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
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export type InvoiceFilterStatus =
  | "all"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";
export type PaymentFilterStatus = "all" | "pending" | "paid" | "overdue";

interface InvoiceFilters {
  search: string;
  status: InvoiceFilterStatus;
  paymentStatus: PaymentFilterStatus;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  clientId: string;
}

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  onReset: () => void;
  className?: string;
}

export function InvoiceFilters({
  filters,
  onFiltersChange,
  onReset,
  className = "",
}: InvoiceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof InvoiceFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const statusOptions: {
    value: InvoiceFilterStatus;
    label: string;
    color: string;
  }[] = [
    { value: "all", label: "Todas", color: "bg-gray-100 text-gray-800" },
    {
      value: "draft",
      label: "Borrador",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "sent", label: "Enviada", color: "bg-blue-100 text-blue-800" },
    { value: "paid", label: "Pagada", color: "bg-green-100 text-green-800" },
    { value: "overdue", label: "Vencida", color: "bg-red-100 text-red-800" },
    {
      value: "cancelled",
      label: "Cancelada",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const paymentStatusOptions: {
    value: PaymentFilterStatus;
    label: string;
    color: string;
  }[] = [
    { value: "all", label: "Todos", color: "bg-gray-100 text-gray-800" },
    {
      value: "pending",
      label: "Pendiente",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "paid", label: "Pagado", color: "bg-green-100 text-green-800" },
    { value: "overdue", label: "Vencido", color: "bg-red-100 text-red-800" },
  ];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value.length > 0;
    if (key === "status" || key === "paymentStatus") return value !== "all";
    return value.length > 0;
  }).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FilterIcon className="h-5 w-5" />
            Filtros de Facturas
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-sm"
              >
                <XIcon className="mr-1 h-4 w-4" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Menos filtros" : "Más filtros"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda básica */}
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Buscar por número, cliente o descripción..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Estado de Factura
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter("status", option.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filters.status === option.value
                      ? option.color
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Estado de Pago
            </label>
            <div className="flex flex-wrap gap-2">
              {paymentStatusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter("paymentStatus", option.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filters.paymentStatus === option.value
                      ? option.color
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fecha Desde
              </label>
              <div className="relative">
                <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fecha Hasta
              </label>
              <div className="relative">
                <CalendarIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Importe Mínimo (€)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => updateFilter("minAmount", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Importe Máximo (€)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => updateFilter("maxAmount", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ID Cliente
              </label>
              <Input
                placeholder="Buscar por ID de cliente..."
                value={filters.clientId}
                onChange={(e) => updateFilter("clientId", e.target.value)}
              />
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

interface InvoiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InvoiceSearch({
  value,
  onChange,
  placeholder = "Buscar facturas...",
  className = "",
}: InvoiceSearchProps) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 pr-4 pl-10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface FilterChipsProps {
  filters: InvoiceFilters;
  onRemoveFilter: (key: keyof InvoiceFilters) => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemoveFilter,
  className = "",
}: FilterChipsProps) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value.length > 0;
    if (key === "status" || key === "paymentStatus") return value !== "all";
    return value.length > 0;
  });

  if (activeFilters.length === 0) return null;

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case "search":
        return `Búsqueda: "${value}"`;
      case "status":
        return `Estado: ${value}`;
      case "paymentStatus":
        return `Pago: ${value}`;
      case "dateFrom":
        return `Desde: ${value}`;
      case "dateTo":
        return `Hasta: ${value}`;
      case "minAmount":
        return `Mín: €${value}`;
      case "maxAmount":
        return `Máx: €${value}`;
      case "clientId":
        return `Cliente: ${value}`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeFilters.map(([key, value]) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Badge variant="secondary" className="flex items-center gap-1 pr-1">
            {getFilterLabel(key, value)}
            <button
              onClick={() => onRemoveFilter(key as keyof InvoiceFilters)}
              className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}
