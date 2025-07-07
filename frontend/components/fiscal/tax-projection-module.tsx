"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendProjectionChart } from "@/components/charts/trend-projection-chart"
import type {
  TaxProjectionModuleData, // This will now be the combined response type
  QuarterlyFinancials,
  TaxProjection,
  ProjectionAdvice,
} from "@/types/tax-projection"
import { AlertTriangle, TrendingUp, Lightbulb, Info, ServerCrash } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Helper to format currency (assuming it's in a utils file or defined here)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)

// --- API Interaction ---
// Simulating API responses for demonstration
const mockApiHistoricalData: QuarterlyFinancials[] = [
  { quarter: "T1 2024", income: 12000, expenses: 4000, vatPaid: 1500, irpfPaid: 1600 },
  { quarter: "T2 2024", income: 15000, expenses: 5500, vatPaid: 1800, irpfPaid: 1900 },
  { quarter: "T3 2024", income: 13500, expenses: 4800, vatPaid: 1650, irpfPaid: 1740 },
]

const mockApiProjectionAndAdvice = (
  historicalData: QuarterlyFinancials[],
): { projection: TaxProjection; advice: ProjectionAdvice[] } => {
  const nextQuarterStr = () => {
    const lastQ = historicalData[historicalData.length - 1].quarter
    const [lastT, lastYStr] = lastQ.split(" ")
    let nextQNum = Number.parseInt(lastT.substring(1)) + 1
    let nextYear = Number.parseInt(lastYStr)
    if (nextQNum > 4) {
      nextQNum = 1
      nextYear += 1
    }
    return `T${nextQNum} ${nextYear}`
  }
  const projection = {
    nextQuarter: nextQuarterStr(),
    projectedVat: 1750, // Example fixed values, backend would calculate
    projectedIrpf: 1850,
  }
  const advice = [
    {
      id: "backend_vat_advice",
      text: `Basado en tus tendencias, tu próximo pago de IVA podría rondar los ${formatCurrency(projection.projectedVat)}. Considera optimizar gastos deducibles.`,
      type: "vat",
      severity: "suggestion",
    },
    {
      id: "backend_irpf_advice",
      text: `Tu IRPF proyectado es de ${formatCurrency(projection.projectedIrpf)}. Si tus ingresos aumentan un 10%, este pago podría subir a ${formatCurrency(projection.projectedIrpf * 1.15)}.`,
      type: "irpf",
      severity: "info",
    },
    {
      id: "backend_general_advice",
      text: "Es un buen momento para revisar tu planificación fiscal anual y asegurarte de que estás aprovechando todas las deducciones aplicables.",
      type: "general",
      severity: "suggestion",
    },
  ]
  return { projection, advice }
}
// --- End API Simulation ---

const AdviceCard: React.FC<{ adviceItem: ProjectionAdvice }> = ({ adviceItem }) => {
  const Icon =
    adviceItem.severity === "warning" ? AlertTriangle : adviceItem.severity === "suggestion" ? Lightbulb : Info

  const iconColor =
    adviceItem.severity === "warning"
      ? "text-yellow-500 dark:text-yellow-400"
      : adviceItem.severity === "suggestion"
        ? "text-blue-500 dark:text-blue-400"
        : "text-gray-500 dark:text-gray-400"

  return (
    <motion.div
      className="flex items-start gap-3 p-3 bg-muted/50 dark:bg-slate-800/70 rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <p className="text-sm text-foreground">{adviceItem.text}</p>
    </motion.div>
  )
}

export default function TaxProjectionModule() {
  const [data, setData] = useState<TaxProjectionModuleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Step 1: Fetch historical data
      // In a real app: const historicalResponse = await fetch('/api/user/fiscal-summary/historical?quarters=3');
      // if (!historicalResponse.ok) throw new Error('Failed to fetch historical data');
      // const historicalResult: { data: QuarterlyFinancials[] } = await historicalResponse.json();
      // For demo, using mock:
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay
      const historicalResult = { data: mockApiHistoricalData }
      const historicalData = historicalResult.data

      if (!historicalData || historicalData.length === 0) {
        throw new Error("No hay suficientes datos históricos para generar una proyección.")
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
      await new Promise((resolve) => setTimeout(resolve, 1200)) // Simulate network delay
      const projectionResult = mockApiProjectionAndAdvice(historicalData)

      setData({
        historicalData,
        projection: projectionResult.projection,
        advice: projectionResult.advice,
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido al cargar los datos.")
      }
      setData(null) // Clear any partial data
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // Fetch data on component mount

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-primary">Previsión Fiscal Próximo Trimestre</CardTitle>
          <CardDescription>Analizando tus datos para proyectar tus impuestos...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full shadow-lg border-red-500/50 dark:border-red-700/50">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-red-600 dark:text-red-400 flex items-center">
            <ServerCrash className="h-6 w-6 mr-2" /> Error al Cargar Proyección
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Reintentar Carga
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    // Should be covered by error state, but as a fallback
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>Proyección Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No hay datos disponibles para mostrar la proyección.</p>
        </CardContent>
      </Card>
    )
  }

  const { historicalData, projection, advice } = data

  const vatChartData = [
    ...historicalData.map((q) => ({ name: q.quarter, historical: q.vatPaid })),
    { name: projection.nextQuarter, projected: projection.projectedVat },
  ]

  const irpfChartData = [
    ...historicalData.map((q) => ({ name: q.quarter, historical: q.irpfPaid })),
    { name: projection.nextQuarter, projected: projection.projectedIrpf },
  ]

  const colors = {
    historical: "hsl(210, 15%, 65%)",
    projectedVat: "hsl(var(--chart-1))",
    projectedIrpf: "hsl(var(--chart-2))",
  }

  return (
    <Card className="w-full shadow-xl overflow-hidden dark:bg-slate-800/30 dark:border-slate-700">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
        <CardTitle className="text-xl sm:text-2xl text-primary">Previsión Fiscal: {projection.nextQuarter}</CardTitle>
        <CardDescription>Estimaciones basadas en los últimos {historicalData.length} trimestres.</CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* VAT Projection Section */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-semibold mb-1 text-foreground">Modelo 303 (IVA)</h3>
          <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.projectedVat }}>
            {formatCurrency(projection.projectedVat)}
            <span className="text-sm font-normal text-muted-foreground ml-2">(Estimado {projection.nextQuarter})</span>
          </p>
          <TrendProjectionChart
            data={vatChartData}
            historicalKey="IVA Pagado Histórico"
            projectedKey="IVA Proyectado"
            yAxisLabel="Importe IVA (€)"
            strokeColorHistorical={colors.historical}
            strokeColorProjected={colors.projectedVat}
          />
        </motion.section>

        <Separator className="dark:bg-slate-700" />

        {/* IRPF Projection Section */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-semibold mb-1 text-foreground">Modelo 130 (IRPF)</h3>
          <p className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.projectedIrpf }}>
            {formatCurrency(projection.projectedIrpf)}
            <span className="text-sm font-normal text-muted-foreground ml-2">(Estimado {projection.nextQuarter})</span>
          </p>
          <TrendProjectionChart
            data={irpfChartData}
            historicalKey="IRPF Pagado Histórico"
            projectedKey="IRPF Proyectado"
            yAxisLabel="Importe IRPF (€)"
            strokeColorHistorical={colors.historical}
            strokeColorProjected={colors.projectedIrpf}
          />
        </motion.section>

        {advice.length > 0 && (
          <>
            <Separator className="dark:bg-slate-700" />
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                <TrendingUp className="inline h-5 w-5 mr-2 text-primary" />
                Consejos y Observaciones
              </h3>
              <div className="space-y-3">
                {advice.map((adv) => (
                  <AdviceCard key={adv.id} adviceItem={adv} />
                ))}
              </div>
            </motion.section>
          </>
        )}
      </CardContent>
    </Card>
  )
}
