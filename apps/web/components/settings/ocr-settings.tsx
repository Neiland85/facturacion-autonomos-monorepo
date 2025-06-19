"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface OCRSettingsState {
  language: string
  extractLineItems: boolean
  extractSupplierAddress: boolean
  autoCategorize: boolean
}

export default function OCRSettings() {
  const [settings, setSettings] = useState<OCRSettingsState>({
    language: "es",
    extractLineItems: true,
    extractSupplierAddress: true,
    autoCategorize: true,
  })

  useEffect(() => {
    // Load settings from localStorage on mount
    const storedSettings = localStorage.getItem("ocr-settings")
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem("ocr-settings", JSON.stringify(settings))
  }, [settings])

  const handleSettingChange = (key: keyof OCRSettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Configuración OCR</CardTitle>
        <CardDescription>Ajusta las preferencias para el reconocimiento óptico de caracteres.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OCR Language */}
        <div>
          <Label htmlFor="ocr-language">Idioma Preferido para OCR</Label>
          <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
            <SelectTrigger id="ocr-language">
              <SelectValue placeholder="Seleccionar idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
              <SelectItem value="fr">Francés</SelectItem>
              <SelectItem value="de">Alemán</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Mejora la precisión para facturas en este idioma.</p>
        </div>

        <Separator />

        {/* Data Extraction Preferences */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">Preferencias de Extracción de Datos</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="extract-line-items"
              checked={settings.extractLineItems}
              onCheckedChange={(checked: boolean) => handleSettingChange("extractLineItems", checked)}
            />
            <label
              htmlFor="extract-line-items"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Extraer detalles de conceptos (líneas de factura)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="extract-supplier-address"
              checked={settings.extractSupplierAddress}
              onCheckedChange={(checked: boolean) => handleSettingChange("extractSupplierAddress", checked)}
            />
            <label
              htmlFor="extract-supplier-address"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Extraer dirección completa del proveedor
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-categorize"
              checked={settings.autoCategorize}
              onCheckedChange={(checked: boolean) => handleSettingChange("autoCategorize", checked)}
            />
            <label
              htmlFor="auto-categorize"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Categorizar automáticamente gastos/ingresos
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
