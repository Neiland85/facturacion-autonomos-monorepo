"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaxProjectionModule;
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const card_1 = require("@/components/ui/card");
const trend_projection_chart_1 = require("@/components/charts/trend-projection-chart");
const lucide_react_1 = require("lucide-react");
const separator_1 = require("@/components/ui/separator");
const lucide_react_2 = require("lucide-react");
const button_1 = require("@/components/ui/button");
// Helper to format currency (assuming it's in a utils file or defined here)
const formatCurrency = (value) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
// --- API Interaction ---
// Simulating API responses for demonstration
const mockApiHistoricalData = [
    { quarter: "T1 2024", income: 12000, expenses: 4000, vatPaid: 1500, irpfPaid: 1600 },
    { quarter: "T2 2024", income: 15000, expenses: 5500, vatPaid: 1800, irpfPaid: 1900 },
    { quarter: "T3 2024", income: 13500, expenses: 4800, vatPaid: 1650, irpfPaid: 1740 }
];
const mockApiProjectionAndAdvice = (historicalData) => {
    const nextQuarterStr = () => {
        const lastQ = historicalData[historicalData.length - 1].quarter;
        const [lastT, lastYStr] = lastQ.split(" ");
        let nextQNum = Number.parseInt(lastT.substring(1)) + 1;
        let nextYear = Number.parseInt(lastYStr);
        if (nextQNum > 4) {
            nextQNum = 1;
            nextYear += 1;
        }
        const nextQuarterStr = `T${nextQNum} ${nextYear}`;
        return nextQuarterStr;
    };
    const projection = {
        nextQuarter: nextQuarterStr(),
        projectedVat: 1750, // Example fixed values, calculated dynamically
        projectedIrpf: 1850,
    };
    const advice = [
        { id: "vat_advice", text: "Revisar IVA", type: "vat", severity: "warning" },
        { id: "irpf_advice", text: "Revisar IRPF", type: "irpf", severity: "suggestion" },
        { id: "general_advice", text: "Revisar general", type: "general", severity: "info" }
    ];
    return { projection, advice };
};
// --- End API Simulation ---
const AdviceCard = ({ adviceItem }) => {
    const Icon = adviceItem.severity === "warning" ? lucide_react_1.AlertTriangle : adviceItem.severity === "suggestion" ? lucide_react_1.Lightbulb : lucide_react_1.Info;
    const iconColor = adviceItem.severity === "warning"
        ? "text-yellow-500 dark:text-yellow-400"
        : adviceItem.severity === "suggestion"
            ? "text-blue-500 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400";
    return (<framer_motion_1.motion.div className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-slate-800/70 rounded-lg shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`}/>
      <p className="text-sm text-foreground">{adviceItem.text}</p>
    </framer_motion_1.motion.div>);
};
function TaxProjectionModule() {
    const [data, setData] = (0, react_1.useState)(null);
    const [historicalData, setHistoricalData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Step 1: Fetch historical data
            // In a real app: const historicalResponse = await fetch('/api/user/fiscal-summary/historical?quarters=3');
            // if (!historicalResponse.ok) throw new Error('Failed to fetch historical data');
            // const historicalResult: { data: QuarterlyFinancials[] } = await historicalResponse.json();
            // For demo, using mock:
            await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
            const historicalResult = { data: mockApiHistoricalData };
            const historicalData = historicalResult.data;
            if (!historicalData || historicalData.length === 0) {
                throw new Error("No hay suficientes datos históricos para generar una proyección.");
            }
            // Step 2: Fetch projection and advice (sending historical data or user ID)
            // In a real app: const projectionResponse = await fetch('/api/fiscal/projections', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ historicalData }) // or { userId: 'current_user_id' }
            // });
            // if (!projectionResponse.ok) throw new Error('Failed to fetch tax projections');
            // const projectionResult: { projection: TaxProjection, advice: ProjectionAdvice[] } = await projectionResponse.json();
            // For demo, using mock:
            await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate network delay
            const projectionResult = mockApiProjectionAndAdvice(historicalData);
            setData({
                projection: projectionResult.projection,
                advice: projectionResult.advice,
            });
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError("Ocurrió un error desconocido al cargar los datos.");
            }
            setData(null); // Clear any partial data
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        // Simular la carga de datos históricos
        setHistoricalData([
            { quarter: "T1 2024", income: 12000, expenses: 4000, vatPaid: 1500, irpfPaid: 1600 },
            { quarter: "T2 2024", income: 15000, expenses: 5500, vatPaid: 1800, irpfPaid: 1900 },
            { quarter: "T3 2024", income: 13500, expenses: 4800, vatPaid: 1650, irpfPaid: 1740 }
        ]);
    }, []);
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []); // Fetch data on component mount
    if (isLoading) {
        return (<card_1.Card className="w-full shadow-lg">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-xl sm:text-2xl text-primary">Previsión Fiscal Próximo Trimestre</card_1.CardTitle>
          <card_1.CardDescription>Analizando tus datos para proyectar tus impuestos...</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="h-[400px] flex items-center justify-center">
          <lucide_react_2.Loader2 className="h-12 w-12 animate-spin text-primary"/>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className="w-full shadow-lg border-red-500/50 dark:border-red-700/50">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-xl sm:text-2xl text-red-600 dark:text-red-400 flex items-center">
            <lucide_react_1.ServerCrash className="h-6 w-6 mr-2"/> Error al Cargar Proyección
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <button_1.Button onClick={fetchData} variant="outline">
            Reintentar Carga
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!data) {
        // Should be covered by error state, but as a fallback
        return (<card_1.Card className="w-full shadow-lg">
        <card_1.CardHeader>
          <card_1.CardTitle>Proyección Fiscal</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <p>No hay datos disponibles para mostrar la proyección.</p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    const { projection, advice } = data || { projection: null, advice: [] };
    const vatChartData = [
        ...historicalData.map((q) => ({ name: q.quarter, historical: q.vatPaid })),
        { name: projection.nextQuarter, projected: projection.projectedVat },
    ];
    const irpfChartData = [
        ...historicalData.map((q) => ({ name: q.quarter, historical: q.irpfPaid })),
        { name: projection.nextQuarter, projected: projection.projectedIrpf },
    ];
    const colors = {
        historical: "hsl(210, 15%, 65%)",
        projectedVat: "hsl(var(--chart-1))",
        projectedIrpf: "hsl(var(--chart-2))",
    };
    return (<card_1.Card className="w-full shadow-xl overflow-hidden dark:bg-slate-800/30 dark:border-slate-700">
      <card_1.CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
        <card_1.CardTitle className="text-xl sm:text-2xl text-primary">Previsión Fiscal: {projection.nextQuarter}</card_1.CardTitle>
        <card_1.CardDescription>Estimaciones basadas en los últimos {historicalData.length} trimestres.</card_1.CardDescription>
      </card_1.CardHeader>

      <card_1.CardContent className="p-4 sm:p-6 space-y-8">
        {/* VAT Projection Section */}
        <framer_motion_1.motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-semibold mb-1 text-foreground">Modelo 303 (IVA)</h3>
          <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.projectedVat }}>
            {formatCurrency(projection.projectedVat)}
            <span className="text-sm font-normal text-muted-foreground ml-2">(Estimado {projection.nextQuarter})</span>
          </p>
          <trend_projection_chart_1.TrendProjectionChart data={vatChartData} historicalKey="IVA Pagado Histórico" projectedKey="IVA Proyectado" yAxisLabel="Importe IVA (€)" strokeColorHistorical={colors.historical} strokeColorProjected={colors.projectedVat}/>
        </framer_motion_1.motion.section>

        <separator_1.Separator className="dark:bg-slate-700"/>

        {/* IRPF Projection Section */}
        <framer_motion_1.motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-semibold mb-1 text-foreground">Modelo 130 (IRPF)</h3>
          <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.projectedIrpf }}>
            {formatCurrency(projection.projectedIrpf)}
            <span className="text-sm font-normal text-muted-foreground ml-2">(Estimado {projection.nextQuarter})</span>
          </p>
          <trend_projection_chart_1.TrendProjectionChart data={irpfChartData} historicalKey="IRPF Pagado Histórico" projectedKey="IRPF Proyectado" yAxisLabel="Importe IRPF (€)" strokeColorHistorical={colors.historical} strokeColorProjected={colors.projectedIrpf}/>
        </framer_motion_1.motion.section>

        {advice.length > 0 && (<>
            <separator_1.Separator className="dark:bg-slate-700"/>
            <framer_motion_1.motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                <lucide_react_1.TrendingUp className="inline h-5 w-5 mr-2 text-primary"/>
                Consejos y Observaciones
              </h3>
              <div className="space-y-3">
                {advice.map((adv) => (<AdviceCard key={adv.id} adviceItem={adv}/>))}
              </div>
            </framer_motion_1.motion.section>
          </>)}
      </card_1.CardContent>
    </card_1.Card>);
}
