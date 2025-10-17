"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceDemoPage;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var use_voice_recognition_1 = require("../../hooks/use-voice-recognition");
var global_voice_command_modal_1 = require("../global-voice-command-modal");
var button_1 = require("../ui/button");
var voice_invoice_modal_1 = require("../voice-invoice-modal");
function VoiceDemoPage() {
    var _a = (0, react_1.useState)(false), isGlobalModalOpen = _a[0], setIsGlobalModalOpen = _a[1];
    var _b = (0, react_1.useState)(false), isInvoiceModalOpen = _b[0], setIsInvoiceModalOpen = _b[1];
    var _c = (0, react_1.useState)(null), feedbackMessage = _c[0], setFeedbackMessage = _c[1];
    // Hook para comandos globales
    var globalVoice = (0, use_voice_recognition_1.useVoiceRecognition)({
        onResult: function (transcript) {
            handleGlobalCommand(transcript);
        },
        onError: function (error) {
            console.error('Error en reconocimiento global:', error);
        },
        continuous: false,
        lang: 'es-ES',
    });
    // Hook para facturas
    var invoiceVoice = (0, use_voice_recognition_1.useVoiceRecognition)({
        onResult: function (transcript) {
            handleInvoiceCommand(transcript);
        },
        onError: function (error) {
            console.error('Error en reconocimiento de factura:', error);
        },
        continuous: false,
        lang: 'es-ES',
    });
    var handleGlobalCommand = function (transcript) {
        var command = transcript.toLowerCase().trim();
        if (command.includes('ayuda')) {
            setFeedbackMessage('Comandos disponibles: "crear factura", "ver estadísticas", "configuración"');
        }
        else if (command.includes('crear factura')) {
            setIsGlobalModalOpen(false);
            setIsInvoiceModalOpen(true);
            setFeedbackMessage('Abriendo modal de creación de factura...');
        }
        else if (command.includes('estadísticas') || command.includes('ver')) {
            setFeedbackMessage('Mostrando estadísticas de facturación...');
        }
        else if (command.includes('configuración')) {
            setFeedbackMessage('Abriendo configuración...');
        }
        else {
            setFeedbackMessage('Comando no reconocido. Di "ayuda" para ver comandos disponibles.');
        }
        // Limpiar mensaje después de 3 segundos
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    var handleInvoiceCommand = function (transcript) {
        console.log('Procesando comando de factura:', transcript);
        // Aquí iría la lógica de procesamiento del transcript
        setFeedbackMessage('Factura procesada exitosamente');
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    var handleCreateInvoice = function (data) {
        console.log('Creando factura con datos:', data);
        // Aquí iría la lógica para crear la factura
        setFeedbackMessage('Factura creada exitosamente');
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Demo de Comandos de Voz
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Prueba las funcionalidades de voz para gestionar tus facturas
          </p>
        </framer_motion_1.motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Comandos Globales
            </h2>
            <p className="text-gray-600 mb-6">
              Controla la aplicación con comandos de voz naturales
            </p>
            <button_1.Button onClick={function () { return setIsGlobalModalOpen(true); }} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              🎤 Abrir Comandos Globales
            </button_1.Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Prueba decir:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Ayuda"</li>
                <li>"Crear factura"</li>
                <li>"Ver estadísticas"</li>
                <li>"Configuración"</li>
              </ul>
            </div>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Crear Factura por Voz
            </h2>
            <p className="text-gray-600 mb-6">
              Crea facturas rápidamente con tu voz
            </p>
            <button_1.Button onClick={function () { return setIsInvoiceModalOpen(true); }} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              📄 Crear Factura
            </button_1.Button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Prueba decir:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Factura de 100 euros por desarrollo web"</li>
                <li>"Crear factura de 50 euros por consultoría"</li>
              </ul>
            </div>
          </framer_motion_1.motion.div>
        </div>

        {feedbackMessage && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-center">
            {feedbackMessage}
          </framer_motion_1.motion.div>)}
      </div>

      {/* Modales */}
      <global_voice_command_modal_1.default isOpen={isGlobalModalOpen} onClose={function () { return setIsGlobalModalOpen(false); }} isListening={globalVoice.isListening} transcript={globalVoice.transcript} feedbackMessage={feedbackMessage} error={globalVoice.error} startListening={globalVoice.startListening} stopListening={globalVoice.stopListening} hasSupport={globalVoice.hasSupport}/>

      <voice_invoice_modal_1.default isOpen={isInvoiceModalOpen} onClose={function () { return setIsInvoiceModalOpen(false); }} isListening={invoiceVoice.isListening} transcript={invoiceVoice.transcript} feedbackMessage={feedbackMessage} error={invoiceVoice.error} startListening={invoiceVoice.startListening} stopListening={invoiceVoice.stopListening} hasSupport={invoiceVoice.hasSupport} onCreateInvoice={handleCreateInvoice}/>
    </div>);
}
