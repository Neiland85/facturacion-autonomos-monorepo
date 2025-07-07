"use client"

import type { FiscalOptimizationPlanData, Advice } from "@/types/fiscal-plan"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, Info, Lightbulb, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RiskTrafficLight } from "./risk-traffic-light"
import { CircularProgressChart } from "@/components/charts/circular-progress-chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell as RechartsCell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react" // Import useState
import { cn } from "@/lib/utils"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)
}

const AdviceIcon = ({ category, severity }: { category: Advice["category"]; severity: Advice["severity"] }) => {
  if (severity === "high") return <AlertCircle className="w-5 h-5 text-red-500" />
  if (severity === "medium") return <TrendingDown className="w-5 h-5 text-yellow-500" />
  if (category === "income" && severity === "info") return <TrendingUp className="w-5 h-5 text-green-500" />
  if (severity === "low" || category === "compliance") return <CheckCircle className="w-5 h-5 text-green-500" />
  if (category === "general" || category === "timing") return <Lightbulb className="w-5 h-5 text-blue-500" />
  return <Info className="w-5 h-5 text-muted-foreground" />
}

export default function FiscalOptimizationPlan({ plan }: { plan: FiscalOptimizationPlanData }) {
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string | null>(null)
  const [showVatDetails, setShowVatDetails] = useState(false)
  const [showIrpfDetails, setShowIrpfDetails] = useState(false)

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const category = data.activePayload[0].payload.category
      setSelectedExpenseCategory((prev) => (prev === category ? null : category)) // Toggle selection
    } else {
      setSelectedExpenseCategory(null)
    }
  }

  const chartConfig = {
    vat: { label: "IVA a Pagar", color: "hsl(var(--chart-1))" },
    irpf: { label: "Tipo Efectivo IRPF", color: "hsl(var(--chart-2))" },
    expenses: { label: "Gastos", color: "hsl(var(--chart-3))" },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 md:space-y-8"
    >
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl sm:text-2xl text-primary">{plan.planTitle}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Trimestre: {plan.currentQuarter} (Generado: {new Date(plan.generatedDate).toLocaleDateString("es-ES")})
              </CardDescription>
            </div>
            <RiskTrafficLight level={plan.fiscalRisk.overall} size="md" showLabel className="mt-2 sm:mt-0" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Forecasts Section */}
          <motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Previsiones Fiscales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* VAT Forecast */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">IVA (Trimestral)</CardTitle>
                  <CardDescription>{plan.vatForecast.period}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="flex flex-col sm:flex-row justify-around items-center cursor-pointer"
                    onClick={() => setShowVatDetails(!showVatDetails)}
                    title="Haz clic para ver detalles"
                  >
                    <CircularProgressChart
                      value={Math.max(
                        0,
                        Math.min(100, (plan.vatForecast.payable / (plan.vatForecast.collected || 1)) * 100),
                      )} // Ensure value is between 0-100
                      primaryColor={chartConfig.vat.color}
                      label="IVA a Pagar"
                      size={100}
                      strokeWidth={10}
                      description={`Total Recaudado: ${formatCurrency(plan.vatForecast.collected)}, Total Deducible: ${formatCurrency(plan.vatForecast.deductible)}`}
                    />
                    <div className="text-sm space-y-1 mt-2 sm:mt-0 text-center sm:text-left">
                      <p className="text-lg font-semibold text-[var(--color-vat)]">
                        {formatCurrency(plan.vatForecast.payable)}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimación a Pagar</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showVatDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs p-2 border rounded-md bg-muted/50 mt-2 space-y-1"
                      >
                        <p>
                          <strong>IVA Recaudado (Ingresos):</strong> {formatCurrency(plan.vatForecast.collected)}
                        </p>
                        <p>
                          <strong>IVA Deducible (Gastos):</strong> {formatCurrency(plan.vatForecast.deductible)}
                        </p>
                        <p>
                          <strong>Diferencia (A Pagar/Devolver):</strong> {formatCurrency(plan.vatForecast.payable)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* IRPF Forecast */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">IRPF (Estimado)</CardTitle>
                  <CardDescription>{plan.irpfForecast.period}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="flex flex-col sm:flex-row justify-around items-center cursor-pointer"
                    onClick={() => setShowIrpfDetails(!showIrpfDetails)}
                    title="Haz clic para ver detalles"
                  >
                    <CircularProgressChart
                      value={plan.irpfForecast.effectiveRate}
                      primaryColor={chartConfig.irpf.color}
                      label="Tipo Efectivo"
                      size={100}
                      strokeWidth={10}
                      description={`Base Imponible: ${formatCurrency(plan.irpfForecast.taxableBase)}`}
                    />
                    <div className="text-sm space-y-1 mt-2 sm:mt-0 text-center sm:text-left">
                      <p className="text-lg font-semibold text-[var(--color-irpf)]">
                        {formatCurrency(plan.irpfForecast.estimatedTax)}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimación a Pagar</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showIrpfDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs p-2 border rounded-md bg-muted/50 mt-2 space-y-1"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          <Separator />

          {/* Advice Section */}
          <motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Recomendaciones</h2>
            {selectedExpenseCategory && (
              <p className="text-sm text-muted-foreground mb-3">
                Mostrando consejos relacionados con: <strong className="text-primary">{selectedExpenseCategory}</strong>
                .
                <Button
                  variant="link"
                  size="sm"
                  className="pl-1 text-primary"
                  onClick={() => setSelectedExpenseCategory(null)}
                >
                  (Mostrar todos)
                </Button>
              </p>
            )}
            <div className="space-y-3">
              {plan.advice
                .filter(
                  (adv) =>
                    !selectedExpenseCategory ||
                    adv.relatedExpenseCategory === selectedExpenseCategory ||
                    !adv.relatedExpenseCategory,
                ) // Show all if no category selected or if advice is general
                .map((adv) => (
                  <motion.div
                    key={adv.id}
                    layout // Animate layout changes when filtering
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "shadow-sm hover:shadow-md transition-all duration-300 rounded-lg",
                      selectedExpenseCategory && adv.relatedExpenseCategory === selectedExpenseCategory
                        ? "ring-2 ring-primary shadow-lg"
                        : "ring-0",
                      selectedExpenseCategory &&
                        adv.relatedExpenseCategory !== selectedExpenseCategory &&
                        adv.relatedExpenseCategory
                        ? "opacity-50 scale-95"
                        : "",
                    )}
                  >
                    <Card>
                      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <AdviceIcon category={adv.category} severity={adv.severity} />
                        <p className="text-sm flex-1 text-foreground">{adv.text}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {plan.advice.filter(
                (adv) => selectedExpenseCategory && adv.relatedExpenseCategory === selectedExpenseCategory,
              ).length === 0 &&
                selectedExpenseCategory && (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No hay consejos específicos para {selectedExpenseCategory}.
                  </p>
                )}
            </div>
          </motion.section>

          {plan.expenseBreakdown && plan.expenseBreakdown.length > 0 && (
            <>
              <Separator />
              <motion.section variants={cardVariants}>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Análisis de Gastos</h2>
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Distribución de Gastos del Trimestre</CardTitle>
                    <CardDescription className="text-xs">
                      Haz clic en una barra para ver consejos relacionados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[350px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={plan.expenseBreakdown}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          onClick={handleBarClick} // Add click handler
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={formatCurrency} fontSize={10} />
                          <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 10 }} interval={0} />
                          <ChartTooltip
                            cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                            content={
                              <ChartTooltipContent
                                formatter={(value, name, entry) => (
                                  <div className="text-sm">
                                    <p className="font-bold">{entry.payload.category}</p>
                                    <p>Importe: {formatCurrency(entry.payload.amount)}</p>
                                    <p>Porcentaje: {entry.payload.percentage.toFixed(1)}% del total</p>
                                  </div>
                                )}
                                labelFormatter={() => ""} // Hide default label
                              />
                            }
                          />
                          <Bar dataKey="percentage" name="Gastos" radius={[0, 4, 4, 0]} barSize={20}>
                            {plan.expenseBreakdown.map((entry, index) => (
                              <RechartsCell
                                key={`cell-${index}`}
                                fill={
                                  selectedExpenseCategory === entry.category
                                    ? "var(--color-primary)"
                                    : "var(--color-expenses)"
                                }
                                className="cursor-pointer transition-fill duration-300"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.section>
            </>
          )}

          <Separator />

          {/* Fiscal Risk Details */}
          <motion.section variants={cardVariants}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">
              Detalles del Riesgo Fiscal
            </h2>
            <div className="space-y-3">
              {plan.fiscalRisk.details.map((detail) => (
                <Card key={detail.area} className="shadow-sm">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-foreground">{detail.area}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{detail.message}</p>
                    </div>
                    <RiskTrafficLight level={detail.level} size="sm" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          <motion.div variants={cardVariants} className="pt-4 text-center">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Descargar Plan en PDF
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
