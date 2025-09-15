"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Info } from "@/components/ui/info"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle } from "../ui/alert-triangle"
import { Button } from "../ui/button"

interface VoiceInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  isListening: boolean
  transcript: string
  feedbackMessage: string | null
  error: string | null
  startListening: () => void
  stopListening: () => void
  hasSupport: boolean
  onCreateInvoice: (data: any) => void
}

export default function VoiceInvoiceModal({
  isOpen,
  onClose,
  isListening,
  transcript,
  feedbackMessage,
  error,
  startListening,
  stopListening,
  hasSupport,
  onCreateInvoice,
}: VoiceInvoiceModalProps) {
  const descriptionId = "voice-invoice-description"

  const handleMicButtonClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleCreateInvoice = () => {
    if (transcript) {
      // Aquí iría la lógica de procesamiento del transcript para extraer datos de la factura
      const invoiceData = {
        description: transcript,
        amount: 0, // Se extraería del transcript
        date: new Date().toISOString(),
      }
      onCreateInvoice(invoiceData)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📄 Crear Factura por Voz
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            Di algo como "Crear factura de 100 euros por servicios de desarrollo"
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4 min-h-[200px] flex flex-col justify-center items-center">
          {!hasSupport && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex items-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Tu navegador no soporta reconocimiento de voz, o no está inicializado.</span>
            </div>
          )}

          {hasSupport && (
            <Button
              onClick={handleMicButtonClick}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="rounded-full w-20 h-20 shadow-lg"
              aria-label={isListening ? "Detener escucha" : "Iniciar escucha"}
            >
              {isListening ? <LoadingSpinner size="lg" /> : "🎤"}
            </Button>
          )}

          <AnimatePresence mode="wait">
            {isListening && (
              <motion.p
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground mt-2"
              >
                Escuchando...
              </motion.p>
            )}
          </AnimatePresence>

          {transcript && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-muted rounded-md w-full text-center"
            >
              <p className="text-sm font-medium">
                "<em>{transcript}</em>"
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {feedbackMessage && !error && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm flex items-center gap-2"
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{feedbackMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {transcript && (
            <Button onClick={handleCreateInvoice} className="bg-green-600 hover:bg-green-700">
              Crear Factura
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
