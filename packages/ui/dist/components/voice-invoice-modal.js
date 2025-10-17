"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceInvoiceModal;
var alert_triangle_1 = require("@/components/ui/alert-triangle");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var info_1 = require("@/components/ui/info");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var framer_motion_1 = require("framer-motion");
function VoiceInvoiceModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, isListening = _a.isListening, transcript = _a.transcript, feedbackMessage = _a.feedbackMessage, error = _a.error, startListening = _a.startListening, stopListening = _a.stopListening, hasSupport = _a.hasSupport, onCreateInvoice = _a.onCreateInvoice;
    var descriptionId = "voice-invoice-description";
    var handleMicButtonClick = function () {
        if (isListening) {
            stopListening();
        }
        else {
            startListening();
        }
    };
    var handleCreateInvoice = function () {
        if (transcript) {
            // Aquí iría la lógica de procesamiento del transcript para extraer datos de la factura
            var invoiceData = {
                description: transcript,
                amount: 0, // Se extraería del transcript
                date: new Date().toISOString(),
            };
            onCreateInvoice(invoiceData);
            onClose();
        }
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={function (open) { return !open && onClose(); }}>
      <dialog_1.DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            📄 Crear Factura por Voz
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription id={descriptionId}>
            Di algo como "Crear factura de 100 euros por servicios de desarrollo"
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="py-6 space-y-4 min-h-[200px] flex flex-col justify-center items-center">
          {!hasSupport && (<div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex items-center gap-2 text-sm">
              <alert_triangle_1.AlertTriangle className="w-5 h-5 flex-shrink-0"/>
              <span>Tu navegador no soporta reconocimiento de voz, o no está inicializado.</span>
            </div>)}

          {hasSupport && (<button_1.Button onClick={handleMicButtonClick} size="lg" variant={isListening ? "destructive" : "default"} className="rounded-full w-20 h-20 shadow-lg" aria-label={isListening ? "Detener escucha" : "Iniciar escucha"}>
              {isListening ? <loading_spinner_1.LoadingSpinner size="lg"/> : "🎤"}
            </button_1.Button>)}

          <framer_motion_1.AnimatePresence mode="wait">
            {isListening && (<framer_motion_1.motion.p key="listening" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-muted-foreground mt-2">
                Escuchando...
              </framer_motion_1.motion.p>)}
          </framer_motion_1.AnimatePresence>

          {transcript && (<framer_motion_1.motion.div key="transcript" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-muted rounded-md w-full text-center">
              <p className="text-sm font-medium">
                "<em>{transcript}</em>"
              </p>
            </framer_motion_1.motion.div>)}

          <framer_motion_1.AnimatePresence mode="wait">
            {feedbackMessage && !error && (<framer_motion_1.motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm flex items-center gap-2">
                <info_1.Info className="w-4 h-4 flex-shrink-0"/>
                <span>{feedbackMessage}</span>
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>

          <framer_motion_1.AnimatePresence mode="wait">
            {error && (<framer_motion_1.motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
                <alert_triangle_1.AlertTriangle className="w-4 h-4 flex-shrink-0"/>
                <span>{error}</span>
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>
        </div>

        <dialog_1.DialogFooter className="flex gap-2">
          <button_1.Button variant="outline" onClick={onClose}>
            Cancelar
          </button_1.Button>
          {transcript && (<button_1.Button onClick={handleCreateInvoice} className="bg-green-600 hover:bg-green-700">
              Crear Factura
            </button_1.Button>)}
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
