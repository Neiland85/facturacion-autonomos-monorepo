"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceInvoiceButton;
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("../../lib/utils");
var button_1 = require("../ui/button");
// Aserción de tipo para solucionar problemas con Lucide React
var MicIcon = lucide_react_1.Mic;
function VoiceInvoiceButton(_a) {
    var onClick = _a.onClick, isListening = _a.isListening, _b = _a.disabled, disabled = _b === void 0 ? false : _b, className = _a.className;
    return (<framer_motion_1.motion.div className={(0, utils_1.cn)("relative", className)}>
      <button_1.Button onClick={onClick} disabled={disabled || isListening} className={(0, utils_1.cn)("bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-elegant relative overflow-hidden group transition-all duration-300 px-3 sm:px-4", isListening && "animate-pulse")} aria-label="Crear factura por voz">
        <framer_motion_1.motion.div className="flex items-center gap-1 sm:gap-2" whileHover={{ scale: disabled || isListening ? 1 : 1.02 }} whileTap={{ scale: disabled || isListening ? 1 : 0.98 }}>
          {isListening ? (<framer_motion_1.motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}>
              <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"/>
            </framer_motion_1.motion.div>) : (<MicIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"/>)}
          <span className="hidden sm:inline font-medium">Crear Factura</span>
          <span className="sm:hidden font-medium">Dictar</span>
        </framer_motion_1.motion.div>
        {isListening && (<framer_motion_1.motion.div className="absolute inset-0 bg-white/20" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}/>)}
      </button_1.Button>
    </framer_motion_1.motion.div>);
}
