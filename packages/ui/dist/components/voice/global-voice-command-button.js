"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GlobalVoiceCommandButton;
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("../../lib/utils");
var button_1 = require("../ui/button");
// Aserción de tipo para solucionar problemas con Lucide React
var MicIcon = lucide_react_1.Mic;
function GlobalVoiceCommandButton(_a) {
    var onClick = _a.onClick, _b = _a.isListening, isListening = _b === void 0 ? false : _b, className = _a.className;
    return (<framer_motion_1.motion.div className={(0, utils_1.cn)("fixed bottom-6 right-6 z-50", className)} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}>
      <button_1.Button onClick={onClick} variant="default" size="icon" className={(0, utils_1.cn)("rounded-full w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105", isListening && "ring-4 ring-purple-400 ring-offset-2 ring-offset-background animate-pulse")} aria-label="Activar comandos de voz">
        <MicIcon className="w-6 h-6"/>
      </button_1.Button>
    </framer_motion_1.motion.div>);
}
