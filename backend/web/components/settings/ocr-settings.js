"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OCRSettings;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const checkbox_1 = require("@/components/ui/checkbox");
const separator_1 = require("@/components/ui/separator");
function OCRSettings() {
    const [settings, setSettings] = (0, react_1.useState)({
        language: "es",
        extractLineItems: true,
        extractSupplierAddress: true,
        autoCategorize: true,
    });
    (0, react_1.useEffect)(() => {
        // Load settings from localStorage on mount
        const storedSettings = localStorage.getItem("ocr-settings");
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);
    (0, react_1.useEffect)(() => {
        // Save settings to localStorage whenever they change
        localStorage.setItem("ocr-settings", JSON.stringify(settings));
    }, [settings]);
    const handleSettingChange = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };
    return (<card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
      <card_1.CardHeader>
        <card_1.CardTitle>Configuración OCR</card_1.CardTitle>
        <card_1.CardDescription>Ajusta las preferencias para el reconocimiento óptico de caracteres.</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* OCR Language */}
        <div>
          <label_1.Label htmlFor="ocr-language">Idioma Preferido para OCR</label_1.Label>
          <select_1.Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
            <select_1.SelectTrigger id="ocr-language">
              <select_1.SelectValue placeholder="Seleccionar idioma"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="es">Español</select_1.SelectItem>
              <select_1.SelectItem value="en">Inglés</select_1.SelectItem>
              <select_1.SelectItem value="fr">Francés</select_1.SelectItem>
              <select_1.SelectItem value="de">Alemán</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <p className="text-xs text-muted-foreground mt-1">Mejora la precisión para facturas en este idioma.</p>
        </div>

        <separator_1.Separator />

        {/* Data Extraction Preferences */}
        <div className="space-y-4">
          <label_1.Label className="block text-sm font-medium">Preferencias de Extracción de Datos</label_1.Label>
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox id="extract-line-items" checked={settings.extractLineItems} onCheckedChange={(checked) => handleSettingChange("extractLineItems", checked)}/>
            <label htmlFor="extract-line-items" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Extraer detalles de conceptos (líneas de factura)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox id="extract-supplier-address" checked={settings.extractSupplierAddress} onCheckedChange={(checked) => handleSettingChange("extractSupplierAddress", checked)}/>
            <label htmlFor="extract-supplier-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Extraer dirección completa del proveedor
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox id="auto-categorize" checked={settings.autoCategorize} onCheckedChange={(checked) => handleSettingChange("autoCategorize", checked)}/>
            <label htmlFor="auto-categorize" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Categorizar automáticamente gastos/ingresos
            </label>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
