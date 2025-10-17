"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceHeader;
var global_voice_command_modal_1 = require("@/components/global-voice-command-modal");
var button_1 = require("@/components/ui/button");
var voice_invoice_modal_1 = require("@/components/voice-invoice-modal");
var use_voice_recognition_1 = require("@/hooks/use-voice-recognition");
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
// Iconos personalizados para evitar problemas con Lucide React
var MicIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
  </svg>);
};
var FileTextIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>);
};
function VoiceHeader(_a) {
    var onCreateInvoice = _a.onCreateInvoice, _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = (0, react_1.useState)(false), isGlobalModalOpen = _c[0], setIsGlobalModalOpen = _c[1];
    var _d = (0, react_1.useState)(false), isInvoiceModalOpen = _d[0], setIsInvoiceModalOpen = _d[1];
    var _e = (0, react_1.useState)(null), feedbackMessage = _e[0], setFeedbackMessage = _e[1];
    // Hook para comandos globales
    var globalVoice = (0, use_voice_recognition_1.useVoiceRecognition)({
        onResult: function (transcript) {
            handleGlobalCommand(transcript);
        },
        onError: function (error) {
            console.error('Error en voz global:', error);
            setFeedbackMessage("Error: ".concat(error));
            setTimeout(function () { return setFeedbackMessage(null); }, 3000);
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
            console.error('Error en voz facturas:', error);
            setFeedbackMessage("Error: ".concat(error));
            setTimeout(function () { return setFeedbackMessage(null); }, 3000);
        },
        continuous: false,
        lang: 'es-ES',
    });
    var handleGlobalCommand = function (transcript) {
        var command = transcript.toLowerCase().trim();
        if (command.includes('ayuda')) {
            setFeedbackMessage('Comandos: "crear factura", "ver estadísticas", "configuración"');
        }
        else if (command.includes('crear factura')) {
            setIsGlobalModalOpen(false);
            setIsInvoiceModalOpen(true);
            setFeedbackMessage('Abriendo creación de factura...');
        }
        else if (command.includes('estadísticas') || command.includes('ver')) {
            setFeedbackMessage('Mostrando estadísticas...');
        }
        else if (command.includes('configuración')) {
            setFeedbackMessage('Abriendo configuración...');
        }
        else {
            setFeedbackMessage('Comando no reconocido. Di "ayuda" para ver opciones.');
        }
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    var handleInvoiceCommand = function (transcript) {
        console.log('Procesando comando de factura:', transcript);
        setFeedbackMessage('Factura procesada exitosamente');
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    var handleCreateInvoice = function (data) {
        console.log('Creando factura desde header:', data);
        onCreateInvoice === null || onCreateInvoice === void 0 ? void 0 : onCreateInvoice(data);
        setFeedbackMessage('Factura creada exitosamente');
        setTimeout(function () { return setFeedbackMessage(null); }, 3000);
    };
    return (<div className={"flex items-center gap-2 ".concat(className)}>
      {/* Botón de comandos globales */}
      <div className="relative">
        <button_1.Button variant="ghost" size="sm" onClick={function () { return setIsGlobalModalOpen(true); }} className="relative group" title="Comandos de voz">
          <MicIcon className="w-4 h-4"/>
          <span className="sr-only">Comandos de voz</span>
        </button_1.Button>

        {/* Indicador de estado */}
        <framer_motion_1.AnimatePresence>
          {globalVoice.isListening && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"/>)}
        </framer_motion_1.AnimatePresence>
      </div>

      {/* Botón de crear factura por voz */}
      <div className="relative">
        <button_1.Button variant="ghost" size="sm" onClick={function () { return setIsInvoiceModalOpen(true); }} className="relative group" title="Crear factura por voz">
          <FileTextIcon className="w-4 h-4"/>
          <span className="sr-only">Crear factura por voz</span>
        </button_1.Button>

        {/* Indicador de estado */}
        <framer_motion_1.AnimatePresence>
          {invoiceVoice.isListening && (<framer_motion_1.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"/>)}
        </framer_motion_1.AnimatePresence>
      </div>

      {/* Mensaje de feedback */}
      <framer_motion_1.AnimatePresence>
        {feedbackMessage && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 left-0 right-0 z-50">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm shadow-lg">
              {feedbackMessage}
            </div>
          </framer_motion_1.motion.div>)}
      </framer_motion_1.AnimatePresence>

      {/* Modales */}
      <global_voice_command_modal_1.default isOpen={isGlobalModalOpen} onClose={function () { return setIsGlobalModalOpen(false); }} isListening={globalVoice.isListening} transcript={globalVoice.transcript} feedbackMessage={feedbackMessage} error={globalVoice.error} startListening={globalVoice.startListening} stopListening={globalVoice.stopListening} hasSupport={globalVoice.hasSupport}/>

      <voice_invoice_modal_1.default isOpen={isInvoiceModalOpen} onClose={function () { return setIsInvoiceModalOpen(false); }} isListening={invoiceVoice.isListening} transcript={invoiceVoice.transcript} feedbackMessage={feedbackMessage} error={invoiceVoice.error} startListening={invoiceVoice.startListening} stopListening={invoiceVoice.stopListening} hasSupport={invoiceVoice.hasSupport} onCreateInvoice={handleCreateInvoice}/>
    </div>);
}
