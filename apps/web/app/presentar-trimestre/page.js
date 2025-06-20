"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PresentarTrimestrePage;
const tax_filing_workflow_1 = require("@/components/fiscal/tax-filing-workflow");
const button_1 = require("@/components/ui/button");
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function PresentarTrimestrePage() {
    const [showWorkflow, setShowWorkflow] = (0, react_1.useState)(false);
    // Determine current quarter dynamically (simplified example)
    const getCurrentQuarter = () => {
        const date = new Date();
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        if (month <= 3)
            return `T1 ${year}`;
        if (month <= 6)
            return `T2 ${year}`;
        if (month <= 9)
            return `T3 ${year}`;
        return `T4 ${year}`;
    };
    const [currentQuarter, setCurrentQuarter] = (0, react_1.useState)(getCurrentQuarter());
    const handleStartWorkflow = () => {
        setCurrentQuarter(getCurrentQuarter()); // Ensure it's up-to-date
        setShowWorkflow(true);
    };
    return (<div className="container mx-auto py-8 px-4 flex flex-col items-center">
      {!showWorkflow ? (<card_1.Card className="w-full max-w-lg text-center shadow-lg dark:bg-slate-800">
          <card_1.CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-petrol/10 mb-4">
              <lucide_react_1.CalendarDays className="h-6 w-6 text-petrol dark:text-petrol-light"/>
            </div>
            <card_1.CardTitle className="text-2xl font-bold text-petrol dark:text-petrol-light">
              Preparar Declaraciones Trimestrales
            </card_1.CardTitle>
            <card_1.CardDescription className="text-muted-foreground">
              Inicia el proceso automatizado para calcular y revisar tus modelos fiscales para el trimestre actual:{" "}
              <strong>{currentQuarter}</strong>.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <button_1.Button size="lg" onClick={handleStartWorkflow} className="bg-petrol hover:bg-petrol-dark text-white w-full sm:w-auto">
              ¿Qué necesito presentar este trimestre?
            </button_1.Button>
            <p className="text-xs text-muted-foreground mt-4">
              Te guiaremos paso a paso para asegurar que todo esté en orden.
            </p>
          </card_1.CardContent>
        </card_1.Card>) : (<tax_filing_workflow_1.default triggerQuarter={currentQuarter}/>)}
    </div>);
}
