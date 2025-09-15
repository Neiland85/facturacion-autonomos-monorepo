'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Iconos personalizados
const CalculatorIcon = ({ className }: { className?: string }) => (
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
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const PercentIcon = ({ className }: { className?: string }) => (
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
      d="M17 7l-5 5m0 0l-5-5m5 5V3m-5 9h10"
    />
  </svg>
);

interface TaxCalculation {
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  taxType: string;
}

interface TaxCalculatorProps {
  onCalculation?: (calculation: TaxCalculation) => void;
  defaultAmount?: number;
  defaultTaxRate?: number;
  className?: string;
}

const taxRates = [
  { value: 0, label: '0% - Exento' },
  { value: 4, label: '4% - IVA Reducido' },
  { value: 10, label: '10% - IVA Reducido' },
  { value: 21, label: '21% - IVA General' },
  { value: 0.5, label: '0.5% - IVA Superreducido (libros)' },
  { value: 1.4, label: '1.4% - IVA Superreducido (medicamentos)' },
];

const taxTypes = [
  { value: 'iva', label: 'IVA (Impuesto sobre el Valor Añadido)' },
  { value: 'irpf', label: 'IRPF (Retención profesionales)' },
  { value: 'igic', label: 'IGIC (Canarias)' },
  { value: 'ipsi', label: 'IPSI (Ceuta y Melilla)' },
];

export function TaxCalculator({
  onCalculation,
  defaultAmount = 0,
  defaultTaxRate = 21,
  className = '',
}: TaxCalculatorProps) {
  const [baseAmount, setBaseAmount] = useState(defaultAmount.toString());
  const [taxRate, setTaxRate] = useState(defaultTaxRate.toString());
  const [taxType, setTaxType] = useState('iva');
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);

  const calculateTax = () => {
    const base = parseFloat(baseAmount) || 0;
    const rate = parseFloat(taxRate) || 0;

    const taxAmount = base * (rate / 100);
    const totalAmount = base + taxAmount;

    const result: TaxCalculation = {
      baseAmount: base,
      taxRate: rate,
      taxAmount,
      totalAmount,
      taxType,
    };

    setCalculation(result);
    onCalculation?.(result);
  };

  useEffect(() => {
    if (baseAmount && taxRate) {
      calculateTax();
    }
  }, [baseAmount, taxRate, taxType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(rate / 100);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="w-5 h-5" />
          Calculadora de Impuestos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tipo de impuesto */}
        <div className="space-y-2">
          <Label htmlFor="tax-type">Tipo de Impuesto</Label>
          <Select value={taxType} onValueChange={setTaxType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de impuesto" />
            </SelectTrigger>
            <SelectContent>
              {taxTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Importe base */}
        <div className="space-y-2">
          <Label htmlFor="base-amount">Importe Base (€)</Label>
          <Input
            id="base-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={baseAmount}
            onChange={e => setBaseAmount(e.target.value)}
          />
        </div>

        {/* Tipo de IVA / Tasa */}
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Tasa de Impuesto</Label>
          {taxType === 'iva' ? (
            <Select value={taxRate} onValueChange={setTaxRate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la tasa" />
              </SelectTrigger>
              <SelectContent>
                {taxRates.map(rate => (
                  <SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="tax-rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="15.0"
              value={taxRate}
              onChange={e => setTaxRate(e.target.value)}
            />
          )}
        </div>

        {/* Resultados */}
        <AnimatePresence>
          {calculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 bg-muted/50 rounded-lg"
            >
              <h4 className="font-semibold text-sm">Cálculo del Impuesto</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base imponible:</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.baseAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {taxTypes.find(t => t.value === taxType)?.label} (
                    {formatPercent(calculation.taxRate)}):
                  </span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(calculation.taxAmount)}
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(calculation.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {taxTypes.find(t => t.value === taxType)?.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatPercent(calculation.taxRate)}
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de cálculo manual */}
        <Button
          onClick={calculateTax}
          className="w-full"
          disabled={!baseAmount}
        >
          <CalculatorIcon className="w-4 h-4 mr-2" />
          Calcular
        </Button>
      </CardContent>
    </Card>
  );
}

interface QuickTaxCalculatorProps {
  amount: number;
  taxRate?: number;
  taxType?: string;
  showDetails?: boolean;
  className?: string;
}

export function QuickTaxCalculator({
  amount,
  taxRate = 21,
  taxType = 'IVA',
  showDetails = false,
  className = '',
}: QuickTaxCalculatorProps) {
  const taxAmount = amount * (taxRate / 100);
  const totalAmount = amount + taxAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">
          Total con {taxType}:
        </span>
        <span className="font-semibold text-green-600">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Base:</span>
        <span>{formatCurrency(amount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>
          {taxType} ({taxRate}%):
        </span>
        <span className="text-orange-600">{formatCurrency(taxAmount)}</span>
      </div>
      <div className="border-t pt-1 flex justify-between font-semibold">
        <span>Total:</span>
        <span className="text-green-600">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
