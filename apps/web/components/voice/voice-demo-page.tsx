'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useVoiceRecognition } from '../hooks/use-voice-recognition';
import { Button } from '../ui/button';
import GlobalVoiceCommandModal from './global-voice-command-modal';
import VoiceInvoiceModal from './voice-invoice-modal';

// Interfaces para tipado
interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  hasSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
}

interface InvoiceData {
  amount: number;
  description: string;
  clientName?: string;
  date?: string;
}

interface GlobalVoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  feedbackMessage: string | null;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  hasSupport: boolean;
}

interface VoiceInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  feedbackMessage: string | null;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  hasSupport: boolean;
  onCreateInvoice: (data: InvoiceData) => void;
}

export default function VoiceDemoPage() {
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Hook para comandos globales
  const globalVoice = useVoiceRecognition({
    onResult: (transcript: string) => {
      handleGlobalCommand(transcript);
    },
    onError: (error: string) => {
      console.error('Error en reconocimiento global:', error);
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
      console.error('Error en reconocimiento de factura:', error);
    },
    continuous: false,
    lang: 'es-ES',
  });

  const handleGlobalCommand = (transcript: string) => {
    const command = transcript.toLowerCase().trim();

    if (command.includes('ayuda')) {
      setFeedbackMessage(
        'Comandos disponibles: "crear factura", "ver estadísticas", "configuración"'
      );
    } else if (command.includes('crear factura')) {
      setIsGlobalModalOpen(false);
      setIsInvoiceModalOpen(true);
      setFeedbackMessage('Abriendo modal de creación de factura...');
    } else if (command.includes('estadísticas') || command.includes('ver')) {
      setFeedbackMessage('Mostrando estadísticas de facturación...');
    } else if (command.includes('configuración')) {
      setFeedbackMessage('Abriendo configuración...');
    } else {
      setFeedbackMessage(
        'Comando no reconocido. Di "ayuda" para ver comandos disponibles.'
      );
    }

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleInvoiceCommand = (transcript: string) => {
    console.log('Procesando comando de factura:', transcript);
    // Aquí iría la lógica de procesamiento del transcript
    setFeedbackMessage('Factura procesada exitosamente');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCreateInvoice = (data: InvoiceData) => {
    console.log('Creando factura con datos:', data);
    // Aquí iría la lógica para crear la factura
    setFeedbackMessage('Factura creada exitosamente');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Demo de Comandos de Voz
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Prueba las funcionalidades de voz para gestionar tus facturas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Comandos Globales
            </h2>
            <p className="text-gray-600 mb-6">
              Controla la aplicación con comandos de voz naturales
            </p>
            <Button
              onClick={() => setIsGlobalModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-md px-8"
            >
              🎤 Abrir Comandos Globales
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Prueba decir:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Ayuda"</li>
                <li>"Crear factura"</li>
                <li>"Ver estadísticas"</li>
                <li>"Configuración"</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Crear Factura por Voz
            </h2>
            <p className="text-gray-600 mb-6">
              Crea facturas rápidamente con tu voz
            </p>
            <Button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 h-11 rounded-md px-8"
            >
              📄 Crear Factura
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Prueba decir:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Factura de 100 euros por desarrollo web"</li>
                <li>"Crear factura de 50 euros por consultoría"</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-center"
          >
            {feedbackMessage}
          </motion.div>
        )}
      </div>

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
