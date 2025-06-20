"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ThemeSelector from "./theme-selector"
import OCRSettings from "./ocr-settings"
import { Settings, Palette, Scan } from "lucide-react"

interface PreferencesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PreferencesPanel({ open, onOpenChange }: PreferencesPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-cream-50 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Settings className="w-6 h-6 text-primary" />
            Preferencias de la Aplicación
          </DialogTitle>
          <DialogDescription>Personaliza la apariencia y el comportamiento de TributariApp.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              OCR
            </TabsTrigger>
          </TabsList>
          <TabsContent value="visual" className="mt-4">
            <ThemeSelector />
          </TabsContent>
          <TabsContent value="ocr" className="mt-4">
            <OCRSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
