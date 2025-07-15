"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OCRResultsModal;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const utils_1 = require("@/lib/utils");
const formatCurrency = (amount) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9)
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (confidence >= 0.7)
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-100 dark:bg-red-900/20";
};
const expenseCategories = [
    { value: "professional_services", label: "Servicios Profesionales" },
    { value: "office_supplies", label: "Material de Oficina" },
    { value: "travel_accommodation", label: "Viajes y Alojamiento" },
    { value: "meals_entertainment", label: "Comidas y Entretenimiento" },
    { value: "equipment_software", label: "Equipos y Software" },
    { value: "utilities", label: "Suministros" },
    { value: "rent", label: "Alquiler" },
    { value: "insurance", label: "Seguros" },
    { value: "marketing_advertising", label: "Marketing y Publicidad" },
    { value: "training_education", label: "Formación y Educación" },
    { value: "telecommunications", label: "Telecomunicaciones" },
    { value: "vehicle_transport", label: "Vehículo y Transporte" },
    { value: "other_deductible", label: "Otros Gastos Deducibles" },
];
function OCRResultsModal({ open, onOpenChange, result, onSave }) {
    const [editingData, setEditingData] = (0, react_1.useState)(null);
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const handleEdit = () => {
        if (result?.data) {
            setEditingData({ ...result.data });
            setIsEditing(true);
        }
    };
    const handleSave = () => {
        if (editingData) {
            onSave(editingData);
            setIsEditing(false);
            onOpenChange(false);
        }
    };
    const handleCancel = () => {
        setEditingData(null);
        setIsEditing(false);
    };
    const updateEditingData = (field, value) => {
        if (editingData) {
            setEditingData({ ...editingData, [field]: value });
        }
    };
    if (!result)
        return null;
    const data = editingData || result.data;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-cream-50 dark:from-slate-900 dark:to-slate-800">
        <dialog_1.DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <dialog_1.DialogTitle className="flex items-center gap-3 text-2xl">
            <framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={(0, utils_1.cn)("p-2 rounded-full", result.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
              {result.success ? <lucide_react_1.Check className="w-6 h-6"/> : <lucide_react_1.AlertTriangle className="w-6 h-6"/>}
            </framer_motion_1.motion.div>
            {result.success ? "Factura Procesada" : "Error en el Procesamiento"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription className="text-base">
            {result.success
            ? `Datos extraídos en ${result.processingTime}ms con ${Math.round((data?.confidence || 0) * 100)}% de confianza`
            : result.error}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        {result.success && data && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
            {/* Confidence and Processing Status */}
            <div className="flex items-center justify-between">
              <badge_1.Badge className={(0, utils_1.cn)("px-3 py-1", getConfidenceColor(data.confidence))}>
                <lucide_react_1.TrendingUp className="w-3 h-3 mr-1"/>
                Confianza: {Math.round(data.confidence * 100)}%
              </badge_1.Badge>
              <div className="flex gap-2">
                {!isEditing ? (<>
                    <button_1.Button variant="outline" size="sm" onClick={handleEdit} className="text-sage-600 border-sage-300 hover:bg-sage-50">
                      <lucide_react_1.Edit3 className="w-4 h-4 mr-1"/>
                      Editar
                    </button_1.Button>
                    <button_1.Button size="sm" onClick={() => data && onSave(data)} className="bg-sage-600 hover:bg-sage-700 text-white">
                      <lucide_react_1.Save className="w-4 h-4 mr-1"/>
                      Guardar
                    </button_1.Button>
                  </>) : (<>
                    <button_1.Button variant="outline" size="sm" onClick={handleCancel}>
                      <lucide_react_1.X className="w-4 h-4 mr-1"/>
                      Cancelar
                    </button_1.Button>
                    <button_1.Button size="sm" onClick={handleSave} className="bg-sage-600 hover:bg-sage-700 text-white">
                      <lucide_react_1.Save className="w-4 h-4 mr-1"/>
                      Guardar Cambios
                    </button_1.Button>
                  </>)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <card_1.CardHeader className="bg-gradient-to-r from-sage-500/10 to-sage-600/10">
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.FileText className="w-5 h-5"/>
                    Información Básica
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label htmlFor="invoiceNumber">Número de Factura</label_1.Label>
                      {isEditing ? (<input_1.Input id="invoiceNumber" value={data.invoiceNumber || ""} onChange={(e) => updateEditingData("invoiceNumber", e.target.value)}/>) : (<p className="text-sm font-medium mt-1">{data.invoiceNumber || "No detectado"}</p>)}
                    </div>
                    <div>
                      <label_1.Label htmlFor="invoiceDate">Fecha</label_1.Label>
                      {isEditing ? (<input_1.Input id="invoiceDate" type="date" value={data.invoiceDate?.toISOString().split("T")[0] || ""} onChange={(e) => updateEditingData("invoiceDate", new Date(e.target.value))}/>) : (<p className="text-sm font-medium mt-1">
                          {data.invoiceDate?.toLocaleDateString("es-ES") || "No detectada"}
                        </p>)}
                    </div>
                  </div>

                  <div>
                    <label_1.Label htmlFor="supplierName">Proveedor</label_1.Label>
                    {isEditing ? (<input_1.Input id="supplierName" value={data.supplierName || ""} onChange={(e) => updateEditingData("supplierName", e.target.value)}/>) : (<p className="text-sm font-medium mt-1">{data.supplierName || "No detectado"}</p>)}
                  </div>

                  <div>
                    <label_1.Label htmlFor="supplierNIF">NIF/CIF</label_1.Label>
                    {isEditing ? (<input_1.Input id="supplierNIF" value={data.supplierNIF || ""} onChange={(e) => updateEditingData("supplierNIF", e.target.value)}/>) : (<p className="text-sm font-medium mt-1">{data.supplierNIF || "No detectado"}</p>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Financial Information */}
              <card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <card_1.CardHeader className="bg-gradient-to-r from-terracotta-500/10 to-terracotta-600/10">
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Euro className="w-5 h-5"/>
                    Información Financiera
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label htmlFor="subtotal">Subtotal</label_1.Label>
                      {isEditing ? (<input_1.Input id="subtotal" type="number" step="0.01" value={data.subtotal || ""} onChange={(e) => updateEditingData("subtotal", Number.parseFloat(e.target.value) || 0)}/>) : (<p className="text-lg font-semibold text-sage-600 mt-1">
                          {data.subtotal ? formatCurrency(data.subtotal) : "No detectado"}
                        </p>)}
                    </div>
                    <div>
                      <label_1.Label htmlFor="vatAmount">IVA</label_1.Label>
                      {isEditing ? (<input_1.Input id="vatAmount" type="number" step="0.01" value={data.vatAmount || ""} onChange={(e) => updateEditingData("vatAmount", Number.parseFloat(e.target.value) || 0)}/>) : (<p className="text-lg font-semibold text-terracotta-600 mt-1">
                          {data.vatAmount ? formatCurrency(data.vatAmount) : "No detectado"}
                        </p>)}
                    </div>
                  </div>

                  <div>
                    <label_1.Label htmlFor="totalAmount">Total</label_1.Label>
                    {isEditing ? (<input_1.Input id="totalAmount" type="number" step="0.01" value={data.totalAmount || ""} onChange={(e) => updateEditingData("totalAmount", Number.parseFloat(e.target.value) || 0)}/>) : (<p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {data.totalAmount ? formatCurrency(data.totalAmount) : "No detectado"}
                      </p>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Tax Categorization */}
            <card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
              <card_1.CardHeader className="bg-gradient-to-r from-cream-400/20 to-cream-500/20">
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Tag className="w-5 h-5"/>
                  Categorización Fiscal
                </card_1.CardTitle>
                <card_1.CardDescription>Clasificación automática para reportes trimestrales y anuales</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label_1.Label htmlFor="taxCategory">Categoría</label_1.Label>
                    {isEditing ? (<select_1.Select value={data.taxCategory?.category} onValueChange={(value) => updateEditingData("taxCategory", {
                    ...data.taxCategory,
                    category: value,
                })}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Seleccionar categoría"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {expenseCategories.map((cat) => (<select_1.SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </select_1.SelectItem>))}
                        </select_1.SelectContent>
                      </select_1.Select>) : (<badge_1.Badge variant="outline" className="mt-1">
                        {expenseCategories.find((c) => c.value === data.taxCategory?.category)?.label ||
                    "No categorizado"}
                      </badge_1.Badge>)}
                  </div>

                  <div>
                    <label_1.Label htmlFor="deductibility">% Deducible</label_1.Label>
                    {isEditing ? (<input_1.Input id="deductibility" type="number" min="0" max="100" value={data.deductibilityPercentage || 100} onChange={(e) => updateEditingData("deductibilityPercentage", Number.parseInt(e.target.value) || 100)}/>) : (<p className="text-lg font-semibold text-green-600 mt-1">{data.deductibilityPercentage}%</p>)}
                  </div>

                  <div>
                    <label_1.Label>Código Modelo 303</label_1.Label>
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded mt-1">
                      {data.taxCategory?.quarterlyReportingCode || "N/A"}
                    </p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Items */}
            {data.items && data.items.length > 0 && (<card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <card_1.CardHeader>
                  <card_1.CardTitle>Conceptos Detectados</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {data.items.map((item, index) => (<div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.quantity && item.unitPrice && (<p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>)}
                        </div>
                        <p className="font-semibold">{item.totalPrice ? formatCurrency(item.totalPrice) : "N/A"}</p>
                      </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>)}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (<card_1.Card className="shadow-soft bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur border-blue-200 dark:border-blue-800">
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <lucide_react_1.Info className="w-5 h-5"/>
                    Sugerencias de Revisión
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (<li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"/>
                        <span className="text-blue-700 dark:text-blue-300">{suggestion}</span>
                      </li>))}
                  </ul>
                </card_1.CardContent>
              </card_1.Card>)}
          </framer_motion_1.motion.div>)}
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
