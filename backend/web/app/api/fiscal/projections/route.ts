import type {
  ProjectionAdvice,
  ProjectionResponse,
  QuarterlyFinancials,
  TaxProjection,
} from '@/types/tax-projection'; // Adjust path if necessary
import { NextResponse, type NextRequest } from 'next/server';
import {
  ensureServerSide,
  validateServerEnvironment,
} from '../../../../utils/server-env-validation';

// 🔐 VALIDACIÓN DE SEGURIDAD: Verificar que estamos en el servidor
ensureServerSide('Fiscal Projections API Route');

// 🔐 VALIDACIÓN DE SEGURIDAD: Verificar variables de entorno del servidor
try {
  validateServerEnvironment();
} catch (error) {
  console.error('🚨 SERVER ENVIRONMENT VALIDATION FAILED:', error);
  throw error;
}

// Helper to format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    value
  );

// Simplified projection logic (backend version)
function calculateProjection(
  historicalData: QuarterlyFinancials[]
): TaxProjection {
  if (!historicalData || historicalData.length === 0) {
    throw new Error('Historical data is required for projection.');
  }

  const lastQuarterData = historicalData[historicalData.length - 1];
  const [lastT, lastYStr] = lastQuarterData.quarter.split(' ');
  let nextQNum = Number.parseInt(lastT.substring(1), 10) + 1;
  let nextYear = Number.parseInt(lastYStr, 10);
  if (nextQNum > 4) {
    nextQNum = 1;
    nextYear++;
  }
  const nextQuarter = `T${nextQNum} ${nextYear}`;

  // Averaging past N quarters for projection (simple trend)
  const avgIncome =
    historicalData.reduce((sum, q) => sum + q.income, 0) /
    historicalData.length;
  const avgExpenses =
    historicalData.reduce((sum, q) => sum + q.expenses, 0) /
    historicalData.length;

  // More robust: consider weighted average or simple linear regression if more data points
  const projectedIncome = avgIncome * 1.02; // Slight growth trend
  const projectedExpenses = avgExpenses * 1.01; // Slight expense growth

  const projectedVat = projectedIncome * 0.21 - projectedExpenses * 0.1; // Simplified VAT
  const projectedIrpf = Math.max(
    0,
    (projectedIncome - projectedExpenses) * 0.2
  ); // Simplified IRPF

  return {
    nextQuarter,
    projectedVat,
    projectedIrpf,
  };
}

// Simplified advice generation logic (backend version)
function generateProjectionAdvice(
  historicalData: QuarterlyFinancials[],
  projection: TaxProjection
): ProjectionAdvice[] {
  const advice: ProjectionAdvice[] = [];
  const avgVatPaid =
    historicalData.reduce((sum, q) => sum + q.vatPaid, 0) /
    historicalData.length;
  const avgIrpfPaid =
    historicalData.reduce((sum, q) => sum + q.irpfPaid, 0) /
    historicalData.length;

  // VAT Advice
  if (projection.projectedVat > avgVatPaid * 1.25) {
    // 25% higher than average
    advice.push({
      id: 'vat_increase_alert',
      text: `Tu IVA proyectado de ${formatCurrency(projection.projectedVat)} es notablemente superior al promedio de trimestres anteriores (${formatCurrency(avgVatPaid)}). Revisa si ha habido un aumento significativo de ingresos o una disminución de gastos deducibles.`,
      type: 'vat',
      severity: 'warning',
    });
  } else if (
    projection.projectedVat < avgVatPaid * 0.75 &&
    projection.projectedVat > 0
  ) {
    advice.push({
      id: 'vat_decrease_info',
      text: `Se proyecta un IVA de ${formatCurrency(projection.projectedVat)}, inferior al promedio. Si esto se debe a mayores gastos deducibles, ¡excelente! Si es por menores ingresos, considera estrategias para impulsarlos.`,
      type: 'vat',
      severity: 'info',
    });
  } else {
    advice.push({
      id: 'vat_stable',
      text: `La proyección de IVA de ${formatCurrency(projection.projectedVat)} se mantiene en línea con tu historial. Continúa gestionando tus ingresos y gastos eficientemente.`,
      type: 'vat',
      severity: 'info',
    });
  }

  // IRPF Advice
  if (projection.projectedIrpf > avgIrpfPaid * 1.2) {
    // 20% higher
    advice.push({
      id: 'irpf_increase_alert',
      text: `El IRPF proyectado de ${formatCurrency(projection.projectedIrpf)} indica un aumento. Esto podría deberse a mayores beneficios. Considera si puedes realizar aportaciones a planes de pensiones o aplicar otras deducciones.`,
      type: 'irpf',
      severity: 'suggestion',
    });
  } else {
    advice.push({
      id: 'irpf_manage',
      text: `Tu IRPF estimado es de ${formatCurrency(projection.projectedIrpf)}. Planifica tus finanzas para cubrir este pago y explora posibles optimizaciones fiscales.`,
      type: 'irpf',
      severity: 'info',
    });
  }

  // General Advice
  const lastQuarter = historicalData[historicalData.length - 1];
  if (lastQuarter.expenses / (lastQuarter.income || 1) > 0.65) {
    // Expenses over 65% of income
    advice.push({
      id: 'expense_control_reminder',
      text: `En el último trimestre, tus gastos representaron más del 65% de tus ingresos. Mantener un control estricto de los gastos es crucial para la rentabilidad.`,
      type: 'general',
      severity: 'suggestion',
    });
  } else {
    advice.push({
      id: 'general_planning',
      text: `Revisa periódicamente tu estructura de ingresos y gastos para identificar oportunidades de mejora y asegurar una planificación fiscal óptima.`,
      type: 'general',
      severity: 'info',
    });
  }

  return advice.slice(0, 3); // Keep advice concise for UI
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const historicalData: QuarterlyFinancials[] | undefined =
      body.historicalData;

    if (
      !historicalData ||
      !Array.isArray(historicalData) ||
      historicalData.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Valid 'historicalData' array is required in the request body.",
        },
        { status: 400 }
      );
    }

    // Validate structure of historicalData items (basic check)
    for (const item of historicalData) {
      if (
        typeof item.quarter !== 'string' ||
        typeof item.income !== 'number' ||
        typeof item.expenses !== 'number' ||
        typeof item.vatPaid !== 'number' ||
        typeof item.irpfPaid !== 'number'
      ) {
        return NextResponse.json(
          { message: "Invalid item structure in 'historicalData'." },
          { status: 400 }
        );
      }
    }

    // In a real app, these calculations would be much more sophisticated
    const projection = calculateProjection(historicalData);
    const advice = generateProjectionAdvice(historicalData, projection);

    const response: ProjectionResponse = { projection, advice };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating fiscal projections:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
