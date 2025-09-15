"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Mic } from "lucide-react"

interface GlobalVoiceCommandButtonProps {
  onClick: () => void
  isListening?: boolean
  className?: string
}

export default function GlobalVoiceCommandButton({
  onClick,
  isListening = false,
  className,
}: GlobalVoiceCommandButtonProps) {
  return (
    <motion.div
      className={cn("fixed bottom-6 right-6 z-50", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
    >
      <Button
        onClick={onClick}
        variant="default"
        size="icon"
        className={cn(
          "rounded-full w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105",
          isListening && "ring-4 ring-purple-400 ring-offset-2 ring-offset-background animate-pulse",
        )}
        aria-label="Activar comandos de voz"
      >
        <Mic className="w-6 h-6" />
      </Button>
    </motion.div>
  )
}
