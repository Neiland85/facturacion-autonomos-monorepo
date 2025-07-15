"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewInvoice;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
const link_1 = require("next/link");
function NewInvoice() {
    const [items, setItems] = (0, react_1.useState)([{ id: "1", description: "", quantity: 1, price: 0, total: 0 }]);
    const addItem = () => {
        const newItem = {
            id: Date.now().toString(),
            description: "",
            quantity: 1,
            price: 0,
            total: 0,
        };
        setItems([...items, newItem]);
    };
    const removeItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };
    const updateItem = (id, field, value) => {
        setItems(items.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === "quantity" || field === "price") {
                    updatedItem.total = updatedItem.quantity * updatedItem.price;
                }
                return updatedItem;
            }
            return item;
        }));
    };
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const iva = subtotal * 0.21; // 21% IVA
    const total = subtotal + iva;
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <link_1.default href="/">
                <button_1.Button variant="ghost" size="sm">
                  <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
                  Volver
                </button_1.Button>
              </link_1.default>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
                <p className="text-gray-600">Crea una nueva factura para tus clientes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button_1.Button variant="outline">
                <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                Guardar Borrador
              </button_1.Button>
              <button_1.Button>
                <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                Enviar Factura
              </button_1.Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Información Básica</card_1.CardTitle>
                <card_1.CardDescription>Datos generales de la factura</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="invoice-number">Número de Factura</label_1.Label>
                    <input_1.Input id="invoice-number" placeholder="INV-001"/>
                  </div>
                  <div>
                    <label_1.Label htmlFor="invoice-date">Fecha de Emisión</label_1.Label>
                    <input_1.Input id="invoice-date" type="date"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="due-date">Fecha de Vencimiento</label_1.Label>
                    <input_1.Input id="due-date" type="date"/>
                  </div>
                  <div>
                    <label_1.Label htmlFor="client">Cliente</label_1.Label>
                    <select_1.Select>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Seleccionar cliente"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="empresa-abc">Empresa ABC S.L.</select_1.SelectItem>
                        <select_1.SelectItem value="consultora-xyz">Consultora XYZ</select_1.SelectItem>
                        <select_1.SelectItem value="startup-tech">Startup Tech</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Invoice Items */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Conceptos</card_1.CardTitle>
                <card_1.CardDescription>Añade los servicios o productos facturados</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (<div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <label_1.Label htmlFor={`description-${item.id}`}>{index === 0 ? "Descripción" : ""}</label_1.Label>
                        <textarea_1.Textarea id={`description-${item.id}`} placeholder="Descripción del servicio..." value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} rows={2}/>
                      </div>
                      <div className="col-span-2">
                        <label_1.Label htmlFor={`quantity-${item.id}`}>{index === 0 ? "Cantidad" : ""}</label_1.Label>
                        <input_1.Input id={`quantity-${item.id}`} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}/>
                      </div>
                      <div className="col-span-2">
                        <label_1.Label htmlFor={`price-${item.id}`}>{index === 0 ? "Precio €" : ""}</label_1.Label>
                        <input_1.Input id={`price-${item.id}`} type="number" step="0.01" min="0" value={item.price} onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}/>
                      </div>
                      <div className="col-span-2">
                        <label_1.Label>{index === 0 ? "Total €" : ""}</label_1.Label>
                        <div className="h-10 flex items-center font-medium">€{item.total.toFixed(2)}</div>
                      </div>
                      <div className="col-span-1">
                        {index === 0 ? <label_1.Label>&nbsp;</label_1.Label> : null}
                        <button_1.Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                          <lucide_react_1.Trash2 className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>))}
                </div>
                <button_1.Button variant="outline" onClick={addItem} className="mt-4">
                  <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                  Añadir Concepto
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Additional Notes */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Notas Adicionales</card_1.CardTitle>
                <card_1.CardDescription>Información adicional para el cliente</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <textarea_1.Textarea placeholder="Condiciones de pago, notas especiales..." rows={4}/>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Invoice Summary */}
          <div className="lg:col-span-1">
            <card_1.Card className="sticky top-8">
              <card_1.CardHeader>
                <card_1.CardTitle>Resumen</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>€{iva.toFixed(2)}</span>
                  </div>
                  <separator_1.Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button_1.Button className="w-full">
                    <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                    Enviar Factura
                  </button_1.Button>
                  <button_1.Button variant="outline" className="w-full">
                    <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                    Guardar Borrador
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </main>
    </div>);
}
