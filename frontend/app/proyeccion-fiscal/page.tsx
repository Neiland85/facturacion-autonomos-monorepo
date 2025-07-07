"use client"
import TaxProjectionModule from "@/components/fiscal/tax-projection-module"
import { CardContent } from "@/components/ui/card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProyeccionFiscalPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <TaxProjectionModule /> {/* No longer needs initialQuarter prop */}
        <Card className="mt-8 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-md text-muted-foreground">Nota Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Estas proyecciones son estimaciones basadas en datos históricos y tendencias simplificadas. No constituyen
              asesoramiento fiscal definitivo. Consulta siempre con un profesional para decisiones financieras
              importantes y para la presentación de tus impuestos. Los cálculos reales pueden variar según la
              legislación vigente y tu situación particular.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
