"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProyeccionFiscalPage;
const tax_projection_module_1 = require("@/components/fiscal/tax-projection-module");
const card_1 = require("@/components/ui/card");
const card_2 = require("@/components/ui/card");
function ProyeccionFiscalPage() {
    return (<div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <tax_projection_module_1.default /> {/* No longer needs initialQuarter prop */}
        <card_2.Card className="mt-8 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700">
          <card_2.CardHeader>
            <card_2.CardTitle className="text-md text-muted-foreground">Nota Importante</card_2.CardTitle>
          </card_2.CardHeader>
          <card_1.CardContent>
            <card_2.CardDescription className="text-xs">
              Estas proyecciones son estimaciones basadas en datos históricos y tendencias simplificadas. No constituyen
              asesoramiento fiscal definitivo. Consulta siempre con un profesional para decisiones financieras
              importantes y para la presentación de tus impuestos. Los cálculos reales pueden variar según la
              legislación vigente y tu situación particular.
            </card_2.CardDescription>
          </card_1.CardContent>
        </card_2.Card>
      </div>
    </div>);
}
