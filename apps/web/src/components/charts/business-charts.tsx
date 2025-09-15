'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Iconos personalizados
const TrendingUpIcon = ({ className }: { className?: string }) => (
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
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const TrendingDownIcon = ({ className }: { className?: string }) => (
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
      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    />
  </svg>
);

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  title?: string;
  height?: number;
  className?: string;
}

export function RevenueChart({
  data,
  title = 'Evolución de Ingresos',
  height = 300,
  className = '',
}: RevenueChartProps) {
  const [animatedData, setAnimatedData] = useState(
    data.map(() => ({ revenue: 0, expenses: 0, profit: 0 }))
  );

  const maxValue = Math.max(
    ...data.flatMap(d => [d.revenue, d.expenses, d.profit])
  );
  const padding = 80;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const getPoint = (index: number, value: number) => {
    const x = padding + (320 / (data.length - 1)) * index;
    const y = height - padding - (value / maxValue) * (height - 2 * padding);
    return { x, y };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">
          <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
            {/* Ejes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={380}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />

            {/* Área de beneficio */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const prev = animatedData[index - 1] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const currentPoint = getPoint(index, current.profit);
              const prevPoint = getPoint(index - 1, prev.profit);

              return (
                <motion.line
                  key={`profit-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#10B981"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Área de ingresos */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const prev = animatedData[index - 1] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const currentPoint = getPoint(index, current.revenue);
              const prevPoint = getPoint(index - 1, prev.revenue);

              return (
                <motion.line
                  key={`revenue-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Área de gastos */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const prev = animatedData[index - 1] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              const currentPoint = getPoint(index, current.expenses);
              const prevPoint = getPoint(index - 1, prev.expenses);

              return (
                <motion.line
                  key={`expenses-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#EF4444"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Puntos */}
            {data.map((item, index) => {
              const currentData = animatedData[index] ?? {
                revenue: 0,
                expenses: 0,
                profit: 0,
              };
              if (!currentData) return null;
              const revenuePoint = getPoint(index, currentData.revenue);
              const expensesPoint = getPoint(index, currentData.expenses);
              const profitPoint = getPoint(index, currentData.profit);

              return (
                <g key={`points-${index}`}>
                  <motion.circle
                    cx={revenuePoint.x}
                    cy={revenuePoint.y}
                    r="4"
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  />
                  <motion.circle
                    cx={expensesPoint.x}
                    cy={expensesPoint.y}
                    r="4"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  />
                  <motion.circle
                    cx={profitPoint.x}
                    cy={profitPoint.y}
                    r="4"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  />
                </g>
              );
            })}

            {/* Etiquetas del eje X */}
            {data.map((item, index) => {
              const x = padding + (320 / (data.length - 1)) * index;
              const y = height - padding + 20;

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {item.month}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Ingresos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Gastos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Beneficio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InvoiceStatusChartProps {
  data: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  title?: string;
  className?: string;
}

export function InvoiceStatusChart({
  data,
  title = 'Estado de Facturas',
  className = '',
}: InvoiceStatusChartProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const [animatedValues, setAnimatedValues] = useState({
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const statusConfig = {
    draft: { label: 'Borrador', color: '#F59E0B', bgColor: 'bg-yellow-100' },
    sent: { label: 'Enviada', color: '#3B82F6', bgColor: 'bg-blue-100' },
    paid: { label: 'Pagada', color: '#10B981', bgColor: 'bg-green-100' },
    overdue: { label: 'Vencida', color: '#EF4444', bgColor: 'bg-red-100' },
    cancelled: { label: 'Cancelada', color: '#6B7280', bgColor: 'bg-gray-100' },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(statusConfig).map(([key, config], index) => {
            const value = animatedValues[key as keyof typeof animatedValues];
            const percentage = total > 0 ? (value / total) * 100 : 0;

            return (
              <motion.div
                key={key}
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-sm text-gray-600">
                      {value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
                <Badge
                  className={`${config.bgColor} text-gray-800 border-0`}
                  variant="secondary"
                >
                  {value}
                </Badge>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Total de Facturas</span>
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MonthlyComparisonProps {
  currentMonth: {
    revenue: number;
    invoices: number;
    clients: number;
  };
  previousMonth: {
    revenue: number;
    invoices: number;
    clients: number;
  };
  title?: string;
  className?: string;
}

export function MonthlyComparison({
  currentMonth,
  previousMonth,
  title = 'Comparación Mensual',
  className = '',
}: MonthlyComparisonProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: 0, isPositive: true };
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return {
      value: change,
      percentage: Math.abs(percentage),
      isPositive: change >= 0,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const metrics = [
    {
      label: 'Ingresos',
      current: currentMonth.revenue,
      previous: previousMonth.revenue,
      format: formatCurrency,
    },
    {
      label: 'Facturas',
      current: currentMonth.invoices,
      previous: previousMonth.invoices,
      format: (value: number) => value.toString(),
    },
    {
      label: 'Clientes',
      current: currentMonth.clients,
      previous: previousMonth.clients,
      format: (value: number) => value.toString(),
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous);

            return (
              <motion.div
                key={metric.label}
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {metric.format(metric.current)}
                  </p>
                  <div className="flex items-center mt-1">
                    {change.isPositive ? (
                      <TrendingUpIcon className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDownIcon className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        change.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {change.isPositive ? '+' : '-'}
                      {change.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      vs mes anterior
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Mes anterior</p>
                  <p className="text-lg text-gray-600">
                    {metric.format(metric.previous)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface CashFlowChartProps {
  data: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
  title?: string;
  height?: number;
  className?: string;
}

export function CashFlowChart({
  data,
  title = 'Flujo de Caja',
  height = 300,
  className = '',
}: CashFlowChartProps) {
  const [animatedData, setAnimatedData] = useState(
    data.map(() => ({ inflow: 0, outflow: 0, balance: 0 }))
  );

  const values = data.flatMap(d => [d.inflow, d.outflow, d.balance]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const padding = 80;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  const getPoint = (index: number, value: number) => {
    const x = padding + (320 / (data.length - 1)) * index;
    const y =
      height - padding - ((value - minValue) / range) * (height - 2 * padding);
    return { x, y };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">
          <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
            {/* Ejes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={380}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#E5E7EB"
              strokeWidth="1"
            />

            {/* Línea de cero */}
            <line
              x1={padding}
              y1={
                height -
                padding -
                ((0 - minValue) / range) * (height - 2 * padding)
              }
              x2={380}
              y2={
                height -
                padding -
                ((0 - minValue) / range) * (height - 2 * padding)
              }
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Área de entradas */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const prev = animatedData[index - 1] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const currentPoint = getPoint(index, current.inflow);
              const prevPoint = getPoint(index - 1, prev.inflow);

              return (
                <motion.line
                  key={`inflow-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#10B981"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Área de salidas */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const prev = animatedData[index - 1] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const currentPoint = getPoint(index, current.outflow);
              const prevPoint = getPoint(index - 1, prev.outflow);

              return (
                <motion.line
                  key={`outflow-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#EF4444"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Área de balance */}
            {data.map((_, index) => {
              if (index === 0) return null;
              const current = animatedData[index] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const prev = animatedData[index - 1] ?? {
                inflow: 0,
                outflow: 0,
                balance: 0,
              };
              const currentPoint = getPoint(index, current.balance);
              const prevPoint = getPoint(index - 1, prev.balance);

              return (
                <motion.line
                  key={`balance-${index}`}
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={currentPoint.x}
                  y2={currentPoint.y}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              );
            })}

            {/* Etiquetas del eje X */}
            {data.map((item, index) => {
              const x = padding + (320 / (data.length - 1)) * index;
              const y = height - padding + 20;

              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {item.date}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Entradas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Salidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500 rounded" />
            <span className="text-sm text-gray-600">Balance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
