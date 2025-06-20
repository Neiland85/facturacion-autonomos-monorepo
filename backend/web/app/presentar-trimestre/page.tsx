"use client"
import TaxFilingWorkflow from "@/components/fiscal/tax-filing-workflow"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export default function PresentarTrimestrePage() {
  const [showWorkflow, setShowWorkflow] = useState(false)
  // Determine current quarter dynamically (simplified example)
  const getCurrentQuarter = () => {
    const date = new Date()
    const month = date.getMonth() + 1 // 1-12
    const year = date.getFullYear()
    if (month <= 3) return `T1 ${year}`
    if (month <= 6) return `T2 ${year}`
    if (month <= 9) return `T3 ${year}`
    return `T4 ${year}`
  }
  const [currentQuarter, setCurrentQuarter] = useState(getCurrentQuarter())

  const handleStartWorkflow = () => {
    setCurrentQuarter(getCurrentQuarter()) // Ensure it's up-to-date
    setShowWorkflow(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      {!showWorkflow ? (
        <Card className="w-full max-w-lg text-center shadow-lg dark:bg-slate-800">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-petrol/10 mb-4">
              <CalendarDays className="h-6 w-6 text-petrol dark:text-petrol-light" />
            </div>
            <CardTitle className="text-2xl font-bold text-petrol dark:text-petrol-light">
              Preparar Declaraciones Trimestrales
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Inicia el proceso automatizado para calcular y revisar tus modelos fiscales para el trimestre actual:{" "}
              <strong>{currentQuarter}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={handleStartWorkflow}
              className="bg-petrol hover:bg-petrol-dark text-white w-full sm:w-auto"
            >
              ¿Qué necesito presentar este trimestre?
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Te guiaremos paso a paso para asegurar que todo esté en orden.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TaxFilingWorkflow triggerQuarter={currentQuarter} />
      )}
    </div>
  )
}
