"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FiscalOptimizationPlan;
const card_1 = require("@/components/ui/card");
const separator_1 = require("@/components/ui/separator");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const risk_traffic_light_1 = require("./risk-traffic-light");
const circular_progress_chart_1 = require("@/components/charts/circular-progress-chart");
const recharts_1 = require("recharts");
const chart_1 = require("@/components/ui/chart");
const react_1 = require("react"); // Import useState
const utils_1 = require("@/lib/utils");
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
function formatCurrency(value) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}
const AdviceIcon = ({ category, severity }) => {
    if (severity === "high")
        return <lucide_react_1.AlertCircle className="w-5 h-5 text-red-500"/>;
    if (severity === "medium")
        return <lucide_react_1.TrendingDown className="w-5 h-5 text-yellow-500"/>;
    if (category === "income" && severity === "info")
        return <lucide_react_1.TrendingUp className="w-5 h-5 text-green-500"/>;
    if (severity === "low" || category === "compliance")
        return <lucide_react_1.CheckCircle className="w-5 h-5 text-green-500"/>;
    if (category === "general" || category === "timing")
        return <lucide_react_1.Lightbulb className="w-5 h-5 text-blue-500"/>;
    return <lucide_react_1.Info className="w-5 h-5 text-muted-foreground"/>;
};
function FiscalOptimizationPlan({ plan }) {
    const [selectedExpenseCategory, setSelectedExpenseCategory] = (0, react_1.useState)(null);
    const [showVatDetails, setShowVatDetails] = (0, react_1.useState)(false);
    const [showIrpfDetails, setShowIrpfDetails] = (0, react_1.useState)(false);
    const handleBarClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const category = data.activePayload[0].payload.category;
            setSelectedExpenseCategory((prev) => (prev === category ? null : category)); // Toggle selection
        }
        else {
            setSelectedExpenseCategory(null);
        }
    };
    const chartConfig = {
        vat: { label: "IVA a Pagar", color: "hsl(var(--chart-1))" },
        irpf: { label: "Tipo Efectivo IRPF", color: "hsl(var(--chart-2))" },
        expenses: { label: "Gastos", color: "hsl(var(--chart-3))" },
    };
    return (<framer_motion_1.motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6 md:space-y-8">
      <card_1.Card className="overflow-hidden shadow-lg">
        <card_1.CardHeader className="bg-muted/30 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <card_1.CardTitle className="text-xl sm:text-2xl text-primary">{plan.planTitle}</card_1.CardTitle>
              <card_1.CardDescription className="text-sm sm:text-base">
                Trimestre: {plan.currentQuarter} (Generado: {new Date(plan.generatedDate).toLocaleDateString("es-ES")})
              </card_1.CardDescription>
            </div>
            <risk_traffic_light_1.RiskTrafficLight level={plan.fiscalRisk.overall} size="md" showLabel className="mt-2 sm:mt-0"/>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="p-4 sm:p-6 space-y-6">
          {/* Forecasts Section */}
          <framer_motion_1.motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Previsiones Fiscales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* VAT Forecast */}
              <card_1.Card className="shadow-md">
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-base sm:text-lg">IVA (Trimestral)</card_1.CardTitle>
                  <card_1.CardDescription>{plan.vatForecast.period}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-around items-center cursor-pointer" onClick={() => setShowVatDetails(!showVatDetails)} title="Haz clic para ver detalles">
                    <circular_progress_chart_1.CircularProgressChart value={Math.max(0, Math.min(100, (plan.vatForecast.payable / (plan.vatForecast.collected || 1)) * 100))} // Ensure value is between 0-100
     primaryColor={chartConfig.vat.color} label="IVA a Pagar" size={100} strokeWidth={10} description={`Total Recaudado: ${formatCurrency(plan.vatForecast.collected)}, Total Deducible: ${formatCurrency(plan.vatForecast.deductible)}`}/>
                    <div className="text-sm space-y-1 mt-2 sm:mt-0 text-center sm:text-left">
                      <p className="text-lg font-semibold text-[var(--color-vat)]">
                        {formatCurrency(plan.vatForecast.payable)}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimación a Pagar</p>
                    </div>
                  </div>
                  <framer_motion_1.AnimatePresence>
                    {showVatDetails && (<framer_motion_1.motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs p-2 border rounded-md bg-muted/50 mt-2 space-y-1">
                        <p>
                          <strong>IVA Recaudado (Ingresos):</strong> {formatCurrency(plan.vatForecast.collected)}
                        </p>
                        <p>
                          <strong>IVA Deducible (Gastos):</strong> {formatCurrency(plan.vatForecast.deductible)}
                        </p>
                        <p>
                          <strong>Diferencia (A Pagar/Devolver):</strong> {formatCurrency(plan.vatForecast.payable)}
                        </p>
                      </framer_motion_1.motion.div>)}
                  </framer_motion_1.AnimatePresence>
                </card_1.CardContent>
              </card_1.Card>

              {/* IRPF Forecast */}
              <card_1.Card className="shadow-md">
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-base sm:text-lg">IRPF (Estimado)</card_1.CardTitle>
                  <card_1.CardDescription>{plan.irpfForecast.period}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-around items-center cursor-pointer" onClick={() => setShowIrpfDetails(!showIrpfDetails)} title="Haz clic para ver detalles">
                    <circular_progress_chart_1.CircularProgressChart value={plan.irpfForecast.effectiveRate} primaryColor={chartConfig.irpf.color} label="Tipo Efectivo" size={100} strokeWidth={10} description={`Base Imponible: ${formatCurrency(plan.irpfForecast.taxableBase)}`}/>
                    <div className="text-sm space-y-1 mt-2 sm:mt-0 text-center sm:text-left">
                      <p className="text-lg font-semibold text-[var(--color-irpf)]">
                        {formatCurrency(plan.irpfForecast.estimatedTax)}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimación a Pagar</p>
                    </div>
                  </div>
                  <framer_motion_1.AnimatePresence>
                    {showIrpfDetails && (<framer_motion_1.motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs p-2 border rounded-md bg-muted/50 mt-2 space-y-1">
                        <p>
                          <strong>Ingresos Brutos Totales:</strong> {formatCurrency(plan.irpfForecast.totalIncome)}
                        </p>
                        <p>
                          <strong>Gastos Deducibles:</strong> {formatCurrency(plan.irpfForecast.deductibleExpenses)}
                        </p>
                        <p>
                          <strong>Base Imponible Estimada:</strong> {formatCurrency(plan.irpfForecast.taxableBase)}
                        </p>
                        <p>
                          <strong>Tipo Efectivo Estimado:</strong> {plan.irpfForecast.effectiveRate.toFixed(1)}%
                        </p>
                      </framer_motion_1.motion.div>)}
                  </framer_motion_1.AnimatePresence>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </framer_motion_1.motion.section>

          <separator_1.Separator />

          {/* Advice Section */}
          <framer_motion_1.motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Recomendaciones</h2>
            {selectedExpenseCategory && (<p className="text-sm text-muted-foreground mb-3">
                Mostrando consejos relacionados con: <strong className="text-primary">{selectedExpenseCategory}</strong>
                .
                <button_1.Button variant="link" size="sm" className="pl-1 text-primary" onClick={() => setSelectedExpenseCategory(null)}>
                  (Mostrar todos)
                </button_1.Button>
              </p>)}
            <div className="space-y-3">
              {plan.advice
            .filter((adv) => !selectedExpenseCategory ||
            adv.relatedExpenseCategory === selectedExpenseCategory ||
            !adv.relatedExpenseCategory) // Show all if no category selected or if advice is general
            .map((adv) => (<framer_motion_1.motion.div key={adv.id} layout // Animate layout changes when filtering
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={(0, utils_1.cn)("shadow-sm hover:shadow-md transition-all duration-300 rounded-lg", selectedExpenseCategory && adv.relatedExpenseCategory === selectedExpenseCategory
                ? "ring-2 ring-primary shadow-lg"
                : "ring-0", selectedExpenseCategory &&
                adv.relatedExpenseCategory !== selectedExpenseCategory &&
                adv.relatedExpenseCategory
                ? "opacity-50 scale-95"
                : "")}>
                    <card_1.Card>
                      <card_1.CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <AdviceIcon category={adv.category} severity={adv.severity}/>
                        <p className="text-sm flex-1 text-foreground">{adv.text}</p>
                      </card_1.CardContent>
                    </card_1.Card>
                  </framer_motion_1.motion.div>))}
              {plan.advice.filter((adv) => selectedExpenseCategory && adv.relatedExpenseCategory === selectedExpenseCategory).length === 0 &&
            selectedExpenseCategory && (<p className="text-sm text-muted-foreground text-center py-3">
                    No hay consejos específicos para {selectedExpenseCategory}.
                  </p>)}
            </div>
          </framer_motion_1.motion.section>

          {plan.expenseBreakdown && plan.expenseBreakdown.length > 0 && (<>
              <separator_1.Separator />
              <framer_motion_1.motion.section variants={cardVariants}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Análisis de Gastos</h2>
                <card_1.Card className="shadow-md">
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-base sm:text-lg">Distribución de Gastos del Trimestre</card_1.CardTitle>
                    <card_1.CardDescription className="text-xs">
                      Haz clic en una barra para ver consejos relacionados.
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent className="h-[250px] sm:h-[350px]">
                    <chart_1.ChartContainer config={chartConfig} className="w-full h-full">
                      <recharts_1.ResponsiveContainer width="100%" height="100%">
                        <recharts_1.BarChart data={plan.expenseBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }} onClick={handleBarClick} // Add click handler
        >
                          <recharts_1.CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                          <recharts_1.XAxis type="number" tickFormatter={formatCurrency} fontSize={10}/>
                          <recharts_1.YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 10 }} interval={0}/>
                          <chart_1.ChartTooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} content={<chart_1.ChartTooltipContent formatter={(value, name, entry) => (<div className="text-sm">
                                    <p className="font-bold">{entry.payload.category}</p>
                                    <p>Importe: {formatCurrency(entry.payload.amount)}</p>
                                    <p>Porcentaje: {entry.payload.percentage.toFixed(1)}% del total</p>
                                  </div>)} labelFormatter={() => ""} // Hide default label
            />}/>
                          <recharts_1.Bar dataKey="percentage" name="Gastos" radius={[0, 4, 4, 0]} barSize={20}>
                            {plan.expenseBreakdown.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={selectedExpenseCategory === entry.category
                    ? "var(--color-primary)"
                    : "var(--color-expenses)"} className="cursor-pointer transition-fill duration-300"/>))}
                          </recharts_1.Bar>
                        </recharts_1.BarChart>
                      </recharts_1.ResponsiveContainer>
                    </chart_1.ChartContainer>
                  </card_1.CardContent>
                </card_1.Card>
              </framer_motion_1.motion.section>
            </>)}

          <separator_1.Separator />

          {/* Fiscal Risk Details */}
          <framer_motion_1.motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
              Detalles del Riesgo Fiscal
            </h2>
            <div className="space-y-3">
              {plan.fiscalRisk.details.map((detail) => (<card_1.Card key={detail.area} className="shadow-sm">
                  <card_1.CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-foreground">{detail.area}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{detail.message}</p>
                    </div>
                    <risk_traffic_light_1.RiskTrafficLight level={detail.level} size="sm"/>
                  </card_1.CardContent>
                </card_1.Card>))}
            </div>
          </framer_motion_1.motion.section>

          <framer_motion_1.motion.div variants={cardVariants} className="pt-4 text-center">
            <button_1.Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <lucide_react_1.ExternalLink className="w-4 h-4 mr-2"/>
              Descargar Plan en PDF
            </button_1.Button>
          </framer_motion_1.motion.div>
        </card_1.CardContent>
      </card_1.Card>
    </framer_motion_1.motion.div>);
}
