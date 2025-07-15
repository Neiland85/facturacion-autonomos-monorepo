"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react"
import Link from "next/link"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export default function NewInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, price: 0, total: 0 }])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "price") {
            updatedItem.total = updatedItem.quantity * updatedItem.price
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const iva = subtotal * 0.21 // 21% IVA
  const total = subtotal + iva

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nueva Factura</h1>
                <p className="text-gray-600">Crea una nueva factura para tus clientes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Enviar Factura
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>Datos generales de la factura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-number">Número de Factura</Label>
                    <Input id="invoice-number" placeholder="INV-001" />
                  </div>
                  <div>
                    <Label htmlFor="invoice-date">Fecha de Emisión</Label>
                    <Input id="invoice-date" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due-date">Fecha de Vencimiento</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="client">Cliente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empresa-abc">Empresa ABC S.L.</SelectItem>
                        <SelectItem value="consultora-xyz">Consultora XYZ</SelectItem>
                        <SelectItem value="startup-tech">Startup Tech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Conceptos</CardTitle>
                <CardDescription>Añade los servicios o productos facturados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label htmlFor={`description-${item.id}`}>{index === 0 ? "Descripción" : ""}</Label>
                        <Textarea
                          id={`description-${item.id}`}
                          placeholder="Descripción del servicio..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`quantity-${item.id}`}>{index === 0 ? "Cantidad" : ""}</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`price-${item.id}`}>{index === 0 ? "Precio €" : ""}</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>{index === 0 ? "Total €" : ""}</Label>
                        <div className="h-10 flex items-center font-medium">€{item.total.toFixed(2)}</div>
                      </div>
                      <div className="col-span-1">
                        {index === 0 ? <Label>&nbsp;</Label> : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addItem} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Concepto
                </Button>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
                <CardDescription>Información adicional para el cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Condiciones de pago, notas especiales..." rows={4} />
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>€{iva.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Factura
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Borrador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
