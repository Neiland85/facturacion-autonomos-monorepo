// Componentes de gráficos y visualización de datos para TributariApp
// Gráficos personalizados sin dependencias externas, usando SVG puro

export { BarChart, LineChart, PieChart } from './basic-charts';
export {
  CashFlowChart,
  InvoiceStatusChart,
  MonthlyComparison,
  RevenueChart,
} from './business-charts';

// Tipos comunes para gráficos
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint extends ChartDataPoint {
  date?: string;
  month?: string;
}

// Utilidades para formateo de datos en gráficos
export const formatChartValue = (
  value: number,
  type: 'currency' | 'percentage' | 'number' = 'number'
): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return value.toLocaleString('es-ES');
  }
};

export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#06B6D4',
    '#F97316',
    '#84CC16',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
    '#F59E0B',
  ] as const;

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]!);
  }
  return colors;
};

// Función para calcular porcentajes automáticamente
export const calculatePercentages = (
  data: ChartDataPoint[]
): ChartDataPoint[] => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map(item => ({
    ...item,
    value: total > 0 ? (item.value / total) * 100 : 0,
  }));
};

// Función para truncar etiquetas largas
export const truncateLabel = (
  label: string,
  maxLength: number = 15
): string => {
  return label.length > maxLength
    ? `${label.substring(0, maxLength)}...`
    : label;
};

// Configuraciones predeterminadas para diferentes tipos de gráficos
export const CHART_DEFAULTS = {
  barChart: {
    height: 300,
    showValues: true,
    barSpacing: 0.8,
  },
  lineChart: {
    height: 300,
    showPoints: true,
    showArea: false,
    strokeWidth: 3,
  },
  pieChart: {
    size: 200,
    showLabels: true,
    showLegend: true,
    minPercentageForLabel: 5,
  },
  businessCharts: {
    height: 300,
    animationDuration: 800,
    delayBetweenItems: 100,
  },
} as const;

// Función para animar valores progresivamente
export const animateValue = (
  startValue: number,
  endValue: number,
  duration: number = 1000,
  callback: (value: number) => void
): (() => void) => {
  const startTime = Date.now();
  const difference = endValue - startValue;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Función de easing (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    const currentValue = startValue + difference * easedProgress;
    callback(currentValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();

  // Función de cleanup
  return () => {
    callback(endValue);
  };
};
