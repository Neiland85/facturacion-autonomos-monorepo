'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useVoiceRecognition } from '../../hooks/use-voice-recognition';
import { Button } from '../ui/button';
import GlobalVoiceCommandModal from './global-voice-command-modal';
import VoiceInvoiceModal from './voice-invoice-modal';

// Iconos personalizados para evitar problemas con Lucide React
const MicIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

interface InvoiceData {
  amount: number;
  description: string;
  clientName?: string;
  date?: string;
}

interface VoiceHeaderProps {
  onCreateInvoice?: (data: InvoiceData) => void;
  className?: string;
}

export default function VoiceHeader({
  onCreateInvoice,
  className = '',
}: VoiceHeaderProps) {
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Hook para comandos globales
  const globalVoice = useVoiceRecognition({
    onResult: (transcript: string) => {
      handleGlobalCommand(transcript);
    },
    onError: (error: string) => {
      console.error('Error en voz global:', error);
      setFeedbackMessage(`Error: ${error}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    continuous: false,
    lang: 'es-ES',
  });

  // Hook para facturas
  const invoiceVoice = useVoiceRecognition({
    onResult: (transcript: string) => {
      handleInvoiceCommand(transcript);
    },
    onError: (error: string) => {
      console.error('Error en voz facturas:', error);
      setFeedbackMessage(`Error: ${error}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    },
    continuous: false,
    lang: 'es-ES',
  });

  const handleGlobalCommand = (transcript: string) => {
    const command = transcript.toLowerCase().trim();

    if (command.includes('ayuda')) {
      setFeedbackMessage(
        'Comandos: "crear factura", "ver estadísticas", "configuración"'
      );
    } else if (command.includes('crear factura')) {
      setIsGlobalModalOpen(false);
      setIsInvoiceModalOpen(true);
      setFeedbackMessage('Abriendo creación de factura...');
    } else if (command.includes('estadísticas') || command.includes('ver')) {
      setFeedbackMessage('Mostrando estadísticas...');
    } else if (command.includes('configuración')) {
      setFeedbackMessage('Abriendo configuración...');
    } else {
      setFeedbackMessage(
        'Comando no reconocido. Di "ayuda" para ver opciones.'
      );
    }

    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleInvoiceCommand = (transcript: string) => {
    console.log('Procesando comando de factura:', transcript);
    setFeedbackMessage('Factura procesada exitosamente');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCreateInvoice = (data: any) => {
    console.log('Creando factura desde header:', data);
    onCreateInvoice?.(data);
    setFeedbackMessage('Factura creada exitosamente');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botón de comandos globales */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsGlobalModalOpen(true)}
          className="relative group"
          title="Comandos de voz"
        >
          <MicIcon className="w-4 h-4" />
          <span className="sr-only">Comandos de voz</span>
        </Button>

        {/* Indicador de estado */}
        <AnimatePresence>
          {globalVoice.isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Botón de crear factura por voz */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsInvoiceModalOpen(true)}
          className="relative group"
          title="Crear factura por voz"
        >
          <FileTextIcon className="w-4 h-4" />
          <span className="sr-only">Crear factura por voz</span>
        </Button>

        {/* Indicador de estado */}
        <AnimatePresence>
          {invoiceVoice.isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mensaje de feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 z-50"
          >
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm shadow-lg">
              {feedbackMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <GlobalVoiceCommandModal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        isListening={globalVoice.isListening}
        transcript={globalVoice.transcript}
        feedbackMessage={feedbackMessage}
        error={globalVoice.error}
        startListening={globalVoice.startListening}
        stopListening={globalVoice.stopListening}
        hasSupport={globalVoice.hasSupport}
      />

      <VoiceInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        isListening={invoiceVoice.isListening}
        transcript={invoiceVoice.transcript}
        feedbackMessage={feedbackMessage}
        error={invoiceVoice.error}
        startListening={invoiceVoice.startListening}
        stopListening={invoiceVoice.stopListening}
        hasSupport={invoiceVoice.hasSupport}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
}
