"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaxFilingWorkflow;
const separator_1 = require("@/components/ui/separator");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const progress_1 = require("@/components/ui/progress");
// Helper to format currency
const formatCurrency = (value) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
// --- Mock Data & API Simulation ---
const simulateApiCall = (data, delay = 1000) => new Promise((resolve) => setTimeout(() => resolve(data), delay));
// Simplified AI engine simulation
const runAiAnalysis = (activity, m303, m130) => {
    const warnings = [];
    if (activity.totalExpenses / (activity.totalIncome || 1) > 0.75) {
        warnings.push({
            id: "exp_ratio",
            message: "Ratio de gastos elevado (superior al 75% de los ingresos). Esto podría llamar la atención de la Agencia Tributaria.",
            severity: "warning",
            suggestion: "Revisa tus gastos para asegurar que todos son deducibles y están debidamente justificados.",
        });
    }
    if (activity.netProfit < 0 && activity.totalIncome > 0) {
        // Only warn if there was income
        warnings.push({
            id: "neg_profit",
            message: "Resultado neto negativo este trimestre. Asegúrate de que esta situación es esperada y documentada.",
            severity: "info",
        });
    }
    if (m303 &&
        m303.resultadoFinal.calculatedValue &&
        m303.resultadoFinal.calculatedValue < 0 &&
        Math.abs(m303.resultadoFinal.calculatedValue) > 500) {
        warnings.push({
            id: "m303_devolver_alto",
            message: "El Modelo 303 resulta en una cantidad a devolver significativa. Verifica que todas las cuotas soportadas son correctas.",
            severity: "warning",
            relatedFieldIds: [m303.resultadoFinal.id],
        });
    }
    if (m130 &&
        m130.liquidación.resultadoPagoFraccionado.calculatedValue &&
        m130.liquidación.resultadoPagoFraccionado.calculatedValue < 10 &&
        activity.netProfit > 0 // Only if profit was positive but payment is low
    ) {
        warnings.push({
            id: "m130_bajo",
            message: "El pago fraccionado del Modelo 130 es muy bajo o cero. Confirma que los ingresos y gastos están correctamente reportados.",
            severity: "info",
            relatedFieldIds: [m130.liquidación.resultadoPagoFraccionado.id],
        });
    }
    if (activity.transactionsCount < 5) {
        warnings.push({
            id: "low_transactions",
            message: "Número de transacciones muy bajo este trimestre. Confirma que todos los movimientos están registrados.",
            severity: "info",
        });
    }
    return warnings;
};
// Simplified tax calculation logic
const calculateModelo303 = (activity) => {
    const ivaRepercutido = activity.totalIncome * 0.21;
    const ivaSoportado = activity.totalExpenses * 0.1; // Simplified average
    const resultado = ivaRepercutido - ivaSoportado;
    return {
        period: activity.period,
        regimenGeneral: {
            baseImponibleRepercutido: [
                {
                    id: "m303_c01",
                    label: "Base Imponible (21%)",
                    value: activity.totalIncome,
                    calculatedValue: activity.totalIncome,
                    validationStatus: "ok",
                },
            ],
            cuotaRepercutida: [
                {
                    id: "m303_c03",
                    label: "Cuota Repercutida (21%)",
                    value: ivaRepercutido,
                    calculatedValue: ivaRepercutido,
                    validationStatus: "ok",
                },
            ],
            baseImponibleSoportado: [
                {
                    id: "m303_c28",
                    label: "Base Imponible (Compras y Servicios)",
                    value: activity.totalExpenses,
                    calculatedValue: activity.totalExpenses,
                    validationStatus: "ok",
                },
            ],
            cuotaSoportada: [
                {
                    id: "m303_c29",
                    label: "Cuota Soportada",
                    value: ivaSoportado,
                    calculatedValue: ivaSoportado,
                    validationStatus: "ok",
                },
            ],
        },
        totalCuotaDevengada: {
            id: "m303_c27",
            label: "Total Cuota Devengada",
            value: ivaRepercutido,
            calculatedValue: ivaRepercutido,
            validationStatus: "ok",
        },
        totalCuotasDeducibles: {
            id: "m303_c39",
            label: "Total Cuotas Deducibles",
            value: ivaSoportado,
            calculatedValue: ivaSoportado,
            validationStatus: "ok",
        },
        resultadoRegimenGeneral: {
            id: "m303_c46",
            label: "Resultado Régimen General",
            value: resultado,
            calculatedValue: resultado,
            validationStatus: "ok",
        },
        resultadoFinal: {
            id: "m303_c71",
            label: "Resultado (A Ingresar/Devolver)",
            value: resultado,
            calculatedValue: resultado,
            validationStatus: "ok",
        },
    };
};
const calculateModelo130 = (activity) => {
    const rendimientoNetoPrevio = activity.netProfit;
    const reduccionGeneral = activity.netProfit > 0 ? Math.min(2000, activity.netProfit * 0.07) : 0;
    const rendimientoNetoActividad = rendimientoNetoPrevio - reduccionGeneral;
    const baseCalculo = Math.max(0, rendimientoNetoActividad);
    const pagoFraccionado = baseCalculo * 0.2;
    return {
        period: activity.period,
        rendimientosActividad: {
            ingresosComputables: {
                id: "m130_c01",
                label: "Ingresos Computables",
                value: activity.totalIncome,
                calculatedValue: activity.totalIncome,
                validationStatus: "ok",
            },
            gastosDeducibles: {
                id: "m130_c02",
                label: "Gastos Deducibles",
                value: activity.totalExpenses,
                calculatedValue: activity.totalExpenses,
                validationStatus: "ok",
            },
            rendimientoNetoPrevio: {
                id: "m130_c03",
                label: "Rendimiento Neto Previo",
                value: rendimientoNetoPrevio,
                calculatedValue: rendimientoNetoPrevio,
                validationStatus: "ok",
            },
            reducciones: {
                id: "m130_c04",
                label: "Reducción (Art. 32 LIRPF)",
                value: reduccionGeneral,
                calculatedValue: reduccionGeneral,
                validationStatus: "info",
                tooltip: "Reducción general del 7% sobre rendimiento neto positivo (simplificado).",
            },
            rendimientoNetoActividad: {
                id: "m130_c07",
                label: "Rendimiento Neto Actividad",
                value: rendimientoNetoActividad,
                calculatedValue: rendimientoNetoActividad,
                validationStatus: "ok",
            },
        },
        liquidación: {
            baseCalculoPagoFraccionado: {
                id: "m130_c11",
                label: "Base Cálculo Pago Fraccionado",
                value: baseCalculo,
                calculatedValue: baseCalculo,
                validationStatus: "ok",
            },
            porcentajeAplicable: { id: "m130_c12", label: "Porcentaje Aplicable", value: "20%", validationStatus: "info" },
            pagoFraccionadoPrevio: {
                id: "m130_c13",
                label: "Pago Fraccionado Previo",
                value: pagoFraccionado,
                calculatedValue: pagoFraccionado,
                validationStatus: "ok",
            },
            resultadoPagoFraccionado: {
                id: "m130_c19",
                label: "Resultado Pago Fraccionado",
                value: pagoFraccionado,
                calculatedValue: pagoFraccionado,
                validationStatus: "ok",
            },
        },
    };
};
const mockFilingAdvice = [
    {
        id: "adv_deadline",
        title: "Plazo de Presentación",
        description: "El plazo para presentar los modelos trimestrales finaliza el día 20 del mes siguiente al trimestre (Abril, Julio, Octubre, Enero). ¡No lo dejes para el último día!",
        category: "deadline",
    },
    {
        id: "adv_docs",
        title: "Documentación Clave",
        description: "Ten a mano todas tus facturas emitidas y recibidas, extractos bancarios y justificantes de gastos. Una buena organización es clave.",
        category: "documentation",
    },
    {
        id: "adv_deductions_irpf",
        title: "Optimiza tu IRPF (Modelo 130)",
        description: "Revisa si puedes aplicar la reducción por inicio de actividad (si aplica) o si tienes retenciones soportadas que puedas deducir.",
        category: "deduction",
    },
    {
        id: "adv_vat_check",
        title: "Verifica tu IVA (Modelo 303)",
        description: "Asegúrate de que el IVA soportado en tus gastos es deducible y corresponde a actividades afectas. Comprueba los tipos de IVA aplicados.",
        category: "deduction",
    },
    {
        id: "adv_digital_certificate",
        title: "Certificado Digital",
        description: "Necesitarás tu certificado digital o Cl@ve PIN para la presentación telemática en la sede electrónica de la AEAT.",
        category: "general",
    },
];
// --- End Mock Data & API ---
const steps = [
    { id: 1, name: "Resumen Actividad" },
    { id: 2, name: "Cálculo Modelos" },
    { id: 3, name: "Consejos y Descarga" },
];
const TaxFormFieldDisplay = ({ field, highlight }) => (<div className={`p-2 border-b dark:border-slate-700 ${highlight ? "bg-primary/10 dark:bg-primary/20" : ""}`}>
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground flex items-center">
        {field.label}
        {field.tooltip && <lucide_react_1.Info size={12} className="ml-1 text-gray-400 cursor-help" title={field.tooltip}/>}
      </span>
      <span className={`font-semibold ${field.validationStatus === "ok"
        ? "text-green-600 dark:text-green-400"
        : field.validationStatus === "warning"
            ? "text-yellow-600 dark:text-yellow-400"
            : field.validationStatus === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"}`}>
        {typeof field.calculatedValue === "number" ? formatCurrency(field.calculatedValue) : field.value}
      </span>
    </div>
    {field.validationMessage && (<p className={`text-xs mt-0.5 ${field.validationStatus === "warning"
            ? "text-yellow-700 dark:text-yellow-500"
            : field.validationStatus === "error"
                ? "text-red-700 dark:text-red-500"
                : "text-muted-foreground"}`}>
        {field.validationMessage}
      </p>)}
  </div>);
const AIWarningCard = ({ warning, onFieldHighlight, }) => (<card_1.Card className={`mb-3 shadow-sm ${warning.severity === "critical"
        ? "border-red-500 bg-red-500/10 dark:bg-red-900/20"
        : warning.severity === "warning"
            ? "border-yellow-500 bg-yellow-500/10 dark:bg-yellow-900/20"
            : "border-blue-500 bg-blue-500/10 dark:bg-blue-900/20"}`} onMouseEnter={() => onFieldHighlight(warning.relatedFieldIds)} onMouseLeave={() => onFieldHighlight(undefined)}>
    <card_1.CardContent className="p-3">
      <div className="flex items-start gap-3">
        {warning.severity === "critical" && <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0"/>}
        {warning.severity === "warning" && <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0"/>}
        {warning.severity === "info" && <lucide_react_1.Info className="h-5 w-5 text-blue-500 flex-shrink-0"/>}
        <div>
          <p className={`text-sm font-medium ${warning.severity === "critical"
        ? "text-red-700 dark:text-red-300"
        : warning.severity === "warning"
            ? "text-yellow-700 dark:text-yellow-300"
            : "text-blue-700 dark:text-blue-300"}`}>
            {warning.message}
          </p>
          {warning.suggestion && <p className="text-xs text-muted-foreground mt-1">{warning.suggestion}</p>}
        </div>
      </div>
    </card_1.CardContent>
  </card_1.Card>);
function TaxFilingWorkflow({ triggerQuarter }) {
    const [currentStep, setCurrentStep] = (0, react_1.useState)(1);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [workflowData, setWorkflowData] = (0, react_1.useState)(null);
    const [highlightedFieldIds, setHighlightedFieldIds] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        const fetchDataAndProcess = async () => {
            setIsLoading(true);
            const activitySummary = await simulateApiCall({
                period: triggerQuarter,
                totalIncome: Math.random() * 18000 + 3000,
                totalExpenses: Math.random() * 12000 + 1000,
                netProfit: 0,
                transactionsCount: Math.floor(Math.random() * 80) + 10,
            }, 800);
            activitySummary.netProfit = activitySummary.totalIncome - activitySummary.totalExpenses;
            const initialAiWarnings = runAiAnalysis(activitySummary);
            setWorkflowData({
                activitySummary,
                aiWarnings: initialAiWarnings,
                filingAdvice: mockFilingAdvice,
            });
            setIsLoading(false);
        };
        fetchDataAndProcess();
    }, [triggerQuarter]);
    const handleCalculateForms = async () => {
        if (!workflowData || !workflowData.activitySummary)
            return;
        setIsLoading(true);
        const m303 = await simulateApiCall(calculateModelo303(workflowData.activitySummary), 600);
        const m130 = await simulateApiCall(calculateModelo130(workflowData.activitySummary), 600);
        const updatedAiWarnings = runAiAnalysis(workflowData.activitySummary, m303, m130);
        setWorkflowData((prev) => prev ? { ...prev, modelo303: m303, modelo130: m130, aiWarnings: updatedAiWarnings } : null);
        setIsLoading(false);
    };
    const nextStep = () => {
        if (currentStep === 1 && workflowData && !workflowData.modelo303) {
            handleCalculateForms().then(() => {
                setCurrentStep((s) => Math.min(s + 1, steps.length));
            });
        }
        else {
            setCurrentStep((s) => Math.min(s + 1, steps.length));
        }
    };
    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));
    const renderStepContent = () => {
        if (isLoading && !workflowData)
            return (<div className="flex flex-col justify-center items-center p-10 min-h-[300px]">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/> <span className="ml-2 mt-2">Cargando datos...</span>
        </div>);
        if (!workflowData)
            return <p className="text-center text-red-500 p-10">Error al cargar los datos.</p>;
        switch (currentStep) {
            case 1: // Activity Summary
                return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <card_1.CardHeader>
              <card_1.CardTitle>Resumen de Actividad Fiscal - {workflowData.activitySummary.period}</card_1.CardTitle>
              <card_1.CardDescription>Verifica tu actividad del trimestre antes de proceder.</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <card_1.Card className="p-4 shadow-sm dark:bg-slate-800">
                  <h3 className="text-sm font-medium text-muted-foreground">Ingresos Totales</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(workflowData.activitySummary.totalIncome)}
                  </p>
                </card_1.Card>
                <card_1.Card className="p-4 shadow-sm dark:bg-slate-800">
                  <h3 className="text-sm font-medium text-muted-foreground">Gastos Totales</h3>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(workflowData.activitySummary.totalExpenses)}
                  </p>
                </card_1.Card>
                <card_1.Card className="p-4 shadow-sm dark:bg-slate-800">
                  <h3 className="text-sm font-medium text-muted-foreground">Beneficio Neto</h3>
                  <p className={`text-2xl font-bold ${workflowData.activitySummary.netProfit >= 0 ? "text-primary" : "text-orange-500 dark:text-orange-400"}`}>
                    {formatCurrency(workflowData.activitySummary.netProfit)}
                  </p>
                </card_1.Card>
              </div>
              <p className="text-sm text-muted-foreground">
                Total de transacciones registradas: {workflowData.activitySummary.transactionsCount}
              </p>

              {workflowData.aiWarnings.filter((w) => !w.relatedFieldIds || w.relatedFieldIds.length === 0).length >
                        0 && <separator_1.Separator className="my-4 dark:bg-slate-700"/>}
              {workflowData.aiWarnings
                        .filter((w) => !w.relatedFieldIds || w.relatedFieldIds.length === 0)
                        .map((warning) => (<AIWarningCard key={warning.id} warning={warning} onFieldHighlight={setHighlightedFieldIds}/>))}
            </card_1.CardContent>
          </framer_motion_1.motion.div>);
            case 2: // Tax Form Calculation
                if (isLoading)
                    return (<div className="flex flex-col justify-center items-center p-10 min-h-[300px]">
              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>{" "}
              <span className="ml-2 mt-2">Calculando modelos...</span>
            </div>);
                if (!workflowData.modelo303 || !workflowData.modelo130)
                    return <p className="text-center text-muted-foreground p-10">Calculando modelos fiscales...</p>;
                return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <card_1.CardHeader>
              <card_1.CardTitle>Modelos Fiscales Calculados - {workflowData.activitySummary.period}</card_1.CardTitle>
              <card_1.CardDescription>Revisa los borradores de los modelos 303 (IVA) y 130 (IRPF).</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Modelo 303 */}
                <card_1.Card className="shadow-md dark:bg-slate-800">
                  <card_1.CardHeader className="bg-muted/30 dark:bg-slate-700/50">
                    <card_1.CardTitle className="text-lg flex items-center">
                      <lucide_react_1.FileText size={18} className="mr-2 text-primary"/>
                      Modelo 303 - IVA
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                      <h4 className="text-sm font-semibold p-3 bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                        Régimen General
                      </h4>
                      {workflowData.modelo303.regimenGeneral.baseImponibleRepercutido.map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                      {workflowData.modelo303.regimenGeneral.cuotaRepercutida.map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                      {workflowData.modelo303.regimenGeneral.baseImponibleSoportado.map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                      {workflowData.modelo303.regimenGeneral.cuotaSoportada.map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                      <h4 className="text-sm font-semibold p-3 bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                        Resultados
                      </h4>
                      <TaxFormFieldDisplay field={workflowData.modelo303.totalCuotaDevengada} highlight={highlightedFieldIds?.includes(workflowData.modelo303.totalCuotaDevengada.id)}/>
                      <TaxFormFieldDisplay field={workflowData.modelo303.totalCuotasDeducibles} highlight={highlightedFieldIds?.includes(workflowData.modelo303.totalCuotasDeducibles.id)}/>
                      <TaxFormFieldDisplay field={workflowData.modelo303.resultadoRegimenGeneral} highlight={highlightedFieldIds?.includes(workflowData.modelo303.resultadoRegimenGeneral.id)}/>
                    </div>
                    <card_1.CardFooter className="p-3 bg-primary text-primary-foreground mt-0">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">Resultado Final M303:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(workflowData.modelo303.resultadoFinal.calculatedValue)}
                        </span>
                      </div>
                    </card_1.CardFooter>
                  </card_1.CardContent>
                </card_1.Card>
                {/* Modelo 130 */}
                <card_1.Card className="shadow-md dark:bg-slate-800">
                  <card_1.CardHeader className="bg-muted/30 dark:bg-slate-700/50">
                    <card_1.CardTitle className="text-lg flex items-center">
                      <lucide_react_1.FileText size={18} className="mr-2 text-primary"/>
                      Modelo 130 - IRPF
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto">
                      <h4 className="text-sm font-semibold p-3 bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                        Rendimientos Actividad Económica
                      </h4>
                      {Object.values(workflowData.modelo130.rendimientosActividad).map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                      <h4 className="text-sm font-semibold p-3 bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                        Liquidación
                      </h4>
                      {Object.values(workflowData.modelo130.liquidación).map((f) => (<TaxFormFieldDisplay key={f.id} field={f} highlight={highlightedFieldIds?.includes(f.id)}/>))}
                    </div>
                    <card_1.CardFooter className="p-3 bg-primary text-primary-foreground mt-0">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">Resultado Final M130:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(workflowData.modelo130.liquidación.resultadoPagoFraccionado.calculatedValue)}
                        </span>
                      </div>
                    </card_1.CardFooter>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
              {/* AI Warnings for Forms */}
              {workflowData.aiWarnings.filter((w) => w.relatedFieldIds && w.relatedFieldIds.length > 0).length > 0 && (<separator_1.Separator className="my-4 dark:bg-slate-700"/>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {workflowData.aiWarnings
                        .filter((w) => w.relatedFieldIds && w.relatedFieldIds.length > 0)
                        .map((warning) => (<AIWarningCard key={warning.id} warning={warning} onFieldHighlight={setHighlightedFieldIds}/>))}
              </div>
            </card_1.CardContent>
          </framer_motion_1.motion.div>);
            case 3: // Filing Advice & PDF Generation
                return (<framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <card_1.CardHeader>
              <card_1.CardTitle>Consejos y Descarga de Modelos</card_1.CardTitle>
              <card_1.CardDescription>Recomendaciones finales y acceso a tus modelos listos para presentar.</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div>
                <h3 className="text-md font-semibold mb-2 text-primary">Consejos para la Presentación:</h3>
                <ul className="space-y-3">
                  {workflowData.filingAdvice.map((advice) => (<li key={advice.id} className="p-3 border rounded-lg shadow-sm bg-muted/30 dark:bg-slate-800 dark:border-slate-700">
                      <h4 className="font-medium text-foreground">{advice.title}</h4>
                      <p className="text-sm text-muted-foreground">{advice.description}</p>
                      {advice.link && (<a href={advice.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          Más información
                        </a>)}
                    </li>))}
                </ul>
              </div>
              <separator_1.Separator className="dark:bg-slate-700"/>
              <div>
                <h3 className="text-md font-semibold mb-3 text-primary">Generar PDFs Oficiales:</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button_1.Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => alert("Simulación: Descargando PDF Modelo 303...")}>
                    <lucide_react_1.Download size={16} className="mr-2"/> Generar PDF Modelo 303
                  </button_1.Button>
                  <button_1.Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => alert("Simulación: Descargando PDF Modelo 130...")}>
                    <lucide_react_1.Download size={16} className="mr-2"/> Generar PDF Modelo 130
                  </button_1.Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  <lucide_react_1.CheckCircle size={14} className="inline mr-1 text-green-500 dark:text-green-400"/>
                  Los modelos generados contendrán los datos calculados. Asegúrate de que toda la información es
                  correcta antes de presentarlos a la Agencia Tributaria.
                </p>
              </div>
            </card_1.CardContent>
          </framer_motion_1.motion.div>);
            default:
                return <p>Paso desconocido.</p>;
        }
    };
    const progressValue = (0, react_1.useMemo)(() => (currentStep / steps.length) * 100, [currentStep]);
    return (<card_1.Card className="w-full max-w-3xl mx-auto shadow-xl dark:bg-slate-800/50 dark:border-slate-700">
      <div className="p-4 border-b dark:border-slate-700">
        <h2 className="text-lg font-semibold text-center text-primary">Presentación Trimestral: {triggerQuarter}</h2>
        <progress_1.Progress value={progressValue} className="w-full h-2 mt-2"/>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {steps.map((step) => (<span key={step.id} className={currentStep >= step.id ? "font-semibold text-primary" : ""}>
              {step.name}
            </span>))}
        </div>
      </div>

      <framer_motion_1.AnimatePresence mode="wait">
        <framer_motion_1.motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="min-h-[350px]" // Ensure consistent height during transitions
    >
          {renderStepContent()}
        </framer_motion_1.motion.div>
      </framer_motion_1.AnimatePresence>

      <card_1.CardFooter className="flex justify-between p-4 border-t dark:border-slate-700">
        <button_1.Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
          <lucide_react_1.ArrowLeft size={16} className="mr-1"/> Anterior
        </button_1.Button>
        {currentStep < steps.length ? (<button_1.Button onClick={nextStep} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading && currentStep === 1 ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
            Siguiente <lucide_react_1.ArrowRight size={16} className="ml-1"/>
          </button_1.Button>) : (<button_1.Button onClick={() => alert("Proceso completado. ¡Recuerda presentar tus impuestos!")} className="bg-green-600 hover:bg-green-700 text-white">
            <lucide_react_1.CheckCircle size={16} className="mr-1"/> Finalizar
          </button_1.Button>)}
      </card_1.CardFooter>
    </card_1.Card>);
}
