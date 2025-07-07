"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, AlertTriangle, FileText, Euro, Tag, Edit3, Save, X, TrendingUp, Info } from "lucide-react"
import { motion } from "framer-motion"
import type { OCRProcessingResult, OCRInvoiceData, ExpenseCategory } from "@/types/ocr"
import { cn } from "@/lib/utils"

interface OCRResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: OCRProcessingResult | null
  onSave: (data: OCRInvoiceData) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return "text-green-600 bg-green-100 dark:bg-green-900/20"
  if (confidence >= 0.7) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
  return "text-red-600 bg-red-100 dark:bg-red-900/20"
}

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
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
]

export default function OCRResultsModal({ open, onOpenChange, result, onSave }: OCRResultsModalProps) {
  const [editingData, setEditingData] = useState<OCRInvoiceData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    if (result?.data) {
      setEditingData({ ...result.data })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (editingData) {
      onSave(editingData)
      setIsEditing(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setEditingData(null)
    setIsEditing(false)
  }

  const updateEditingData = (field: keyof OCRInvoiceData, value: any) => {
    if (editingData) {
      setEditingData({ ...editingData, [field]: value })
    }
  }

  if (!result) return null

  const data = editingData || result.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-cream-50 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "p-2 rounded-full",
                result.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600",
              )}
            >
              {result.success ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </motion.div>
            {result.success ? "Factura Procesada" : "Error en el Procesamiento"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {result.success
              ? `Datos extraídos en ${result.processingTime}ms con ${Math.round((data?.confidence || 0) * 100)}% de confianza`
              : result.error}
          </DialogDescription>
        </DialogHeader>

        {result.success && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
            {/* Confidence and Processing Status */}
            <div className="flex items-center justify-between">
              <Badge className={cn("px-3 py-1", getConfidenceColor(data.confidence))}>
                <TrendingUp className="w-3 h-3 mr-1" />
                Confianza: {Math.round(data.confidence * 100)}%
              </Badge>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="text-sage-600 border-sage-300 hover:bg-sage-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => data && onSave(data)}
                      className="bg-sage-600 hover:bg-sage-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Guardar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} className="bg-sage-600 hover:bg-sage-700 text-white">
                      <Save className="w-4 h-4 mr-1" />
                      Guardar Cambios
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-sage-500/10 to-sage-600/10">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoiceNumber">Número de Factura</Label>
                      {isEditing ? (
                        <Input
                          id="invoiceNumber"
                          value={data.invoiceNumber || ""}
                          onChange={(e) => updateEditingData("invoiceNumber", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{data.invoiceNumber || "No detectado"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="invoiceDate">Fecha</Label>
                      {isEditing ? (
                        <Input
                          id="invoiceDate"
                          type="date"
                          value={data.invoiceDate?.toISOString().split("T")[0] || ""}
                          onChange={(e) => updateEditingData("invoiceDate", new Date(e.target.value))}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">
                          {data.invoiceDate?.toLocaleDateString("es-ES") || "No detectada"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="supplierName">Proveedor</Label>
                    {isEditing ? (
                      <Input
                        id="supplierName"
                        value={data.supplierName || ""}
                        onChange={(e) => updateEditingData("supplierName", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{data.supplierName || "No detectado"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supplierNIF">NIF/CIF</Label>
                    {isEditing ? (
                      <Input
                        id="supplierNIF"
                        value={data.supplierNIF || ""}
                        onChange={(e) => updateEditingData("supplierNIF", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{data.supplierNIF || "No detectado"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-terracotta-500/10 to-terracotta-600/10">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Información Financiera
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subtotal">Subtotal</Label>
                      {isEditing ? (
                        <Input
                          id="subtotal"
                          type="number"
                          step="0.01"
                          value={data.subtotal || ""}
                          onChange={(e) => updateEditingData("subtotal", Number.parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="text-lg font-semibold text-sage-600 mt-1">
                          {data.subtotal ? formatCurrency(data.subtotal) : "No detectado"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="vatAmount">IVA</Label>
                      {isEditing ? (
                        <Input
                          id="vatAmount"
                          type="number"
                          step="0.01"
                          value={data.vatAmount || ""}
                          onChange={(e) => updateEditingData("vatAmount", Number.parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="text-lg font-semibold text-terracotta-600 mt-1">
                          {data.vatAmount ? formatCurrency(data.vatAmount) : "No detectado"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="totalAmount">Total</Label>
                    {isEditing ? (
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={data.totalAmount || ""}
                        onChange={(e) => updateEditingData("totalAmount", Number.parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {data.totalAmount ? formatCurrency(data.totalAmount) : "No detectado"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tax Categorization */}
            <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-cream-400/20 to-cream-500/20">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categorización Fiscal
                </CardTitle>
                <CardDescription>Clasificación automática para reportes trimestrales y anuales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taxCategory">Categoría</Label>
                    {isEditing ? (
                      <Select
                        value={data.taxCategory?.category}
                        onValueChange={(value) =>
                          updateEditingData("taxCategory", {
                            ...data.taxCategory,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="mt-1">
                        {expenseCategories.find((c) => c.value === data.taxCategory?.category)?.label ||
                          "No categorizado"}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deductibility">% Deducible</Label>
                    {isEditing ? (
                      <Input
                        id="deductibility"
                        type="number"
                        min="0"
                        max="100"
                        value={data.deductibilityPercentage || 100}
                        onChange={(e) =>
                          updateEditingData("deductibilityPercentage", Number.parseInt(e.target.value) || 100)
                        }
                      />
                    ) : (
                      <p className="text-lg font-semibold text-green-600 mt-1">{data.deductibilityPercentage}%</p>
                    )}
                  </div>

                  <div>
                    <Label>Código Modelo 303</Label>
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-700 p-2 rounded mt-1">
                      {data.taxCategory?.quarterlyReportingCode || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            {data.items && data.items.length > 0 && (
              <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Conceptos Detectados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.quantity && item.unitPrice && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold">{item.totalPrice ? formatCurrency(item.totalPrice) : "N/A"}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card className="shadow-soft bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Info className="w-5 h-5" />
                    Sugerencias de Revisión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
