"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FiscalPlanExamplePage;
const fiscal_optimization_plan_1 = require("@/components/fiscal/fiscal-optimization-plan");
const card_1 = require("@/components/ui/card");
// Updated mock data to include fiscalRisk and match FiscalOptimizationPlanData
const mockPlanData = {
    planTitle: "Plan de Optimización Fiscal Avanzado",
    currentQuarter: "T3 2024",
    generatedDate: new Date().toISOString(),
    fiscalRisk: {
        overall: "medium",
        details: [
            {
                area: "Gastos Elevados",
                level: "high",
                message: "Tus gastos en 'Viajes y dietas' son significativamente altos este trimestre.",
            },
            {
                area: "Declaración IVA",
                level: "medium",
                message: "Posible discrepancia en el IVA soportado de facturas internacionales.",
            },
            {
                area: "Retenciones IRPF",
                level: "low",
                message: "Las retenciones de IRPF parecen correctas y consistentes.",
            },
        ],
    },
    vatForecast: {
        period: "T3 2024",
        collected: 12500,
        deductible: 7800,
        payable: 4700,
    },
    irpfForecast: {
        period: "T3 2024",
        totalIncome: 60000,
        deductibleExpenses: 25000,
        taxableBase: 35000,
        effectiveRate: 19.5,
        estimatedTax: 6825,
    },
    advice: [
        {
            id: "adv1",
            text: "Considera renegociar contratos con proveedores para reducir costes en 'Servicios Profesionales Externos'.",
            category: "expense",
            severity: "medium",
            relatedExpenseCategory: "Servicios Profesionales Externos",
        },
        {
            id: "adv2",
            text: "Revisa la deducibilidad del IVA en facturas de comidas y representación, asegúrate de cumplir los requisitos.",
            category: "compliance",
            severity: "high",
            relatedExpenseCategory: "Comidas y Representación",
        },
        {
            id: "adv3",
            text: "Explora la posibilidad de realizar aportaciones a planes de pensiones para optimizar tu IRPF antes de fin de año.",
            category: "timing",
            severity: "info",
        },
        {
            id: "adv4",
            text: "Incrementa tus esfuerzos de marketing digital para captar nuevos clientes y aumentar ingresos.",
            category: "income",
            severity: "low",
        },
    ],
    expenseBreakdown: [
        { category: "Alquiler Oficina", amount: 5000, percentage: 20 },
        { category: "Servicios Profesionales Externos", amount: 7000, percentage: 28 },
        { category: "Viajes y dietas", amount: 6000, percentage: 24 },
        { category: "Comidas y Representación", amount: 3000, percentage: 12 },
        { category: "Suministros", amount: 1500, percentage: 6 },
        { category: "Otros", amount: 2500, percentage: 10 },
    ],
};
function FiscalPlanExamplePage() {
    return (<div className="container mx-auto py-8 px-4">
      <card_1.Card className="mb-8 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-2xl text-primary">Página de Ejemplo del Plan de Optimización Fiscal</card_1.CardTitle>
          <card_1.CardDescription>
            Esta página muestra cómo se renderiza el componente <code>FiscalOptimizationPlan</code> con datos de ejemplo
            actualizados, incluyendo el semáforo de riesgo.
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p className="text-sm">
            El componente <code>RiskTrafficLight</code> debería mostrarse en la cabecera del plan general y para cada
            detalle de riesgo.
          </p>
        </card_1.CardContent>
      </card_1.Card>

      <fiscal_optimization_plan_1.default plan={mockPlanData}/>
    </div>);
}
