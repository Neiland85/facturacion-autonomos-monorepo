"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculator = TaxCalculator;
exports.QuickTaxCalculator = QuickTaxCalculator;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
// Iconos personalizados
var CalculatorIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>);
};
var PercentIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5m0 0l-5-5m5 5V3m-5 9h10"/>
  </svg>);
};
var taxRates = [
    { value: 0, label: "0% - Exento" },
    { value: 4, label: "4% - IVA Reducido" },
    { value: 10, label: "10% - IVA Reducido" },
    { value: 21, label: "21% - IVA General" },
    { value: 0.5, label: "0.5% - IVA Superreducido (libros)" },
    { value: 1.4, label: "1.4% - IVA Superreducido (medicamentos)" },
];
var taxTypes = [
    { value: "iva", label: "IVA (Impuesto sobre el Valor Añadido)" },
    { value: "irpf", label: "IRPF (Retención profesionales)" },
    { value: "igic", label: "IGIC (Canarias)" },
    { value: "ipsi", label: "IPSI (Ceuta y Melilla)" },
];
function TaxCalculator(_a) {
    var _b, _c;
    var onCalculation = _a.onCalculation, _d = _a.defaultAmount, defaultAmount = _d === void 0 ? 0 : _d, _e = _a.defaultTaxRate, defaultTaxRate = _e === void 0 ? 21 : _e, _f = _a.className, className = _f === void 0 ? "" : _f;
    var _g = (0, react_1.useState)(defaultAmount.toString()), baseAmount = _g[0], setBaseAmount = _g[1];
    var _h = (0, react_1.useState)(defaultTaxRate.toString()), taxRate = _h[0], setTaxRate = _h[1];
    var _j = (0, react_1.useState)("iva"), taxType = _j[0], setTaxType = _j[1];
    var _k = (0, react_1.useState)(null), calculation = _k[0], setCalculation = _k[1];
    var calculateTax = function () {
        var base = parseFloat(baseAmount) || 0;
        var rate = parseFloat(taxRate) || 0;
        var taxAmount = base * (rate / 100);
        var totalAmount = base + taxAmount;
        var result = {
            baseAmount: base,
            taxRate: rate,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            taxType: taxType,
        };
        setCalculation(result);
        onCalculation === null || onCalculation === void 0 ? void 0 : onCalculation(result);
    };
    (0, react_1.useEffect)(function () {
        if (baseAmount && taxRate) {
            calculateTax();
        }
    }, [baseAmount, taxRate, taxType]);
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };
    var formatPercent = function (rate) {
        return new Intl.NumberFormat('es-ES', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        }).format(rate / 100);
    };
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <CalculatorIcon className="w-5 h-5"/>
          Calculadora de Impuestos
        </card_1.CardTitle>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        {/* Tipo de impuesto */}
        <div className="space-y-2">
          <label_1.Label htmlFor="tax-type">Tipo de Impuesto</label_1.Label>
          <select_1.Select value={taxType} onValueChange={setTaxType}>
            <select_1.SelectTrigger>
              <select_1.SelectValue placeholder="Selecciona el tipo de impuesto"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {taxTypes.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                  {type.label}
                </select_1.SelectItem>); })}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Importe base */}
        <div className="space-y-2">
          <label_1.Label htmlFor="base-amount">Importe Base (€)</label_1.Label>
          <input_1.Input id="base-amount" type="number" step="0.01" min="0" placeholder="0.00" value={baseAmount} onChange={function (e) { return setBaseAmount(e.target.value); }}/>
        </div>

        {/* Tipo de IVA / Tasa */}
        <div className="space-y-2">
          <label_1.Label htmlFor="tax-rate">Tasa de Impuesto</label_1.Label>
          {taxType === "iva" ? (<select_1.Select value={taxRate} onValueChange={setTaxRate}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecciona la tasa"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {taxRates.map(function (rate) { return (<select_1.SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </select_1.SelectItem>); })}
              </select_1.SelectContent>
            </select_1.Select>) : (<input_1.Input id="tax-rate" type="number" step="0.1" min="0" max="100" placeholder="15.0" value={taxRate} onChange={function (e) { return setTaxRate(e.target.value); }}/>)}
        </div>

        {/* Resultados */}
        <framer_motion_1.AnimatePresence>
          {calculation && (<framer_motion_1.motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm">Cálculo del Impuesto</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base imponible:</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.baseAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    {(_b = taxTypes.find(function (t) { return t.value === taxType; })) === null || _b === void 0 ? void 0 : _b.label} ({formatPercent(calculation.taxRate)}):
                  </span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(calculation.taxAmount)}
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(calculation.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <badge_1.Badge variant="outline" className="text-xs">
                  {(_c = taxTypes.find(function (t) { return t.value === taxType; })) === null || _c === void 0 ? void 0 : _c.label}
                </badge_1.Badge>
                <badge_1.Badge variant="outline" className="text-xs">
                  {formatPercent(calculation.taxRate)}
                </badge_1.Badge>
              </div>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>

        {/* Botón de cálculo manual */}
        <button_1.Button onClick={calculateTax} className="w-full" disabled={!baseAmount}>
          <CalculatorIcon className="w-4 h-4 mr-2"/>
          Calcular
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
function QuickTaxCalculator(_a) {
    var amount = _a.amount, _b = _a.taxRate, taxRate = _b === void 0 ? 21 : _b, _c = _a.taxType, taxType = _c === void 0 ? "IVA" : _c, _d = _a.showDetails, showDetails = _d === void 0 ? false : _d, _e = _a.className, className = _e === void 0 ? "" : _e;
    var taxAmount = amount * (taxRate / 100);
    var totalAmount = amount + taxAmount;
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };
    if (!showDetails) {
        return (<div className={"flex items-center gap-2 ".concat(className)}>
        <span className="text-sm text-muted-foreground">Total con {taxType}:</span>
        <span className="font-semibold text-green-600">
          {formatCurrency(totalAmount)}
        </span>
      </div>);
    }
    return (<div className={"space-y-2 ".concat(className)}>
      <div className="flex justify-between text-sm">
        <span>Base:</span>
        <span>{formatCurrency(amount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>{taxType} ({taxRate}%):</span>
        <span className="text-orange-600">{formatCurrency(taxAmount)}</span>
      </div>
      <div className="border-t pt-1 flex justify-between font-semibold">
        <span>Total:</span>
        <span className="text-green-600">{formatCurrency(totalAmount)}</span>
      </div>
    </div>);
}
