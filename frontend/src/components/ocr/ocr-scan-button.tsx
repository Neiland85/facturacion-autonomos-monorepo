"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Scan, Upload, Camera, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { OCRProcessingResult } from "@/types/ocr"

interface OCRScanButtonProps {
  onScanComplete: (result: OCRProcessingResult) => void
  className?: string
  variant?: "header" | "floating" | "inline"
  disabled?: boolean
}

export default function OCRScanButton({
  onScanComplete,
  className,
  variant = "header",
  disabled = false,
}: OCRScanButtonProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsScanning(true)
      setScanProgress(0)

      try {
        const progressInterval = setInterval(() => {
          setScanProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + Math.random() * 20
          })
        }, 200)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/ocr/process", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval) // Stop progress simulation once response is received

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error en la respuesta del servidor OCR")
        }

        const result: OCRProcessingResult = await response.json()
        setScanProgress(100) // Ensure progress is 100% on success

        onScanComplete(result)
      } catch (error) {
        console.error("OCR Scan Error:", error)
        const errorResult: OCRProcessingResult = {
          success: false,
          error: error instanceof Error ? error.message : "Error procesando la factura",
          processingTime: 0, // Can't determine if error occurred before or after API call
        }
        onScanComplete(errorResult)
      } finally {
        setIsScanning(false)
        setScanProgress(0)
        setShowOptions(false)
      }
    },
    [onScanComplete],
  )

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const buttonVariants = {
    header:
      "bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-elegant",
    floating:
      "bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white shadow-elegant rounded-full",
    inline:
      "bg-gradient-to-r from-cream-400 to-cream-500 hover:from-cream-500 hover:to-cream-600 text-slate-800 shadow-soft",
  }

  if (isScanning) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("relative overflow-hidden rounded-lg", variant === "floating" ? "rounded-full" : "", className)}
      >
        <Button disabled className={cn(buttonVariants[variant], "relative min-w-[120px] animate-pulse-glow")}>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Procesando...</span>
          </div>
        </Button>

        {/* Progress indicator */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${scanProgress}%` }}
          transition={{ duration: 0.3 }}
        />

        {/* Scanning animation overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />

      <motion.div
        onHoverStart={() => setShowOptions(true)}
        onHoverEnd={() => setShowOptions(false)}
        className="relative"
      >
        <Button
          onClick={triggerFileSelect}
          disabled={disabled}
          className={cn(
            buttonVariants[variant],
            "relative overflow-hidden group transition-all duration-300",
            showOptions && "animate-ocr-scan",
          )}
        >
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Scan className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline font-medium">{variant === "header" ? "Escanear Factura" : "OCR"}</span>
          </motion.div>

          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        </Button>

        {/* Quick options on hover */}
        <AnimatePresence>
          {showOptions && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-elegant border border-slate-200 dark:border-slate-700 p-2 min-w-[200px]"
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-sage-900/20"
                  onClick={triggerFileSelect}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Archivo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-sage-900/20"
                  onClick={triggerFileSelect}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tomar Foto
                </Button>
                <div className="pt-1 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">Formatos: PDF, JPG, PNG</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
