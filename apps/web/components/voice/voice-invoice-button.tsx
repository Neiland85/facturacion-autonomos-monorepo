'use client';

import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

// Aserción de tipo para solucionar problemas con Lucide React
const MicIcon = Mic as React.ComponentType<{ className?: string }>;

interface VoiceInvoiceButtonProps {
  onClick: () => void;
  isListening: boolean;
  disabled?: boolean;
  className?: string;
}

export default function VoiceInvoiceButton({
  onClick,
  isListening,
  disabled = false,
  className,
}: VoiceInvoiceButtonProps) {
  return (
    <motion.div className={cn('relative', className)}>
      <Button
        onClick={onClick}
        disabled={disabled || isListening}
        className={cn(
          'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-elegant relative overflow-hidden group transition-all duration-300 px-3 sm:px-4',
          isListening && 'animate-pulse'
        )}
        aria-label="Crear factura por voz"
      >
        <motion.div
          className="flex items-center gap-1 sm:gap-2"
          whileHover={{ scale: disabled || isListening ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isListening ? 1 : 0.98 }}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </motion.div>
          ) : (
            <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
          )}
          <span className="hidden sm:inline font-medium">Crear Factura</span>
          <span className="sm:hidden font-medium">Dictar</span>
        </motion.div>
        {isListening && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </Button>
    </motion.div>
  );
}
