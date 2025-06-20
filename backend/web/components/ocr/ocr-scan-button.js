"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OCRScanButton;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const utils_1 = require("@/lib/utils");
function OCRScanButton({ onScanComplete, className, variant = "header", disabled = false, }) {
    const [isScanning, setIsScanning] = (0, react_1.useState)(false);
    const [showOptions, setShowOptions] = (0, react_1.useState)(false);
    const [scanProgress, setScanProgress] = (0, react_1.useState)(0);
    const fileInputRef = (0, react_1.useRef)(null);
    const handleFileUpload = (0, react_1.useCallback)(async (file) => {
        setIsScanning(true);
        setScanProgress(0);
        try {
            const progressInterval = setInterval(() => {
                setScanProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 20;
                });
            }, 200);
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/ocr/process", {
                method: "POST",
                body: formData,
            });
            clearInterval(progressInterval); // Stop progress simulation once response is received
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error en la respuesta del servidor OCR");
            }
            const result = await response.json();
            setScanProgress(100); // Ensure progress is 100% on success
            onScanComplete(result);
        }
        catch (error) {
            console.error("OCR Scan Error:", error);
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : "Error procesando la factura",
                processingTime: 0, // Can't determine if error occurred before or after API call
            };
            onScanComplete(errorResult);
        }
        finally {
            setIsScanning(false);
            setScanProgress(0);
            setShowOptions(false);
        }
    }, [onScanComplete]);
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    const buttonVariants = {
        header: "bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-elegant",
        floating: "bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white shadow-elegant rounded-full",
        inline: "bg-gradient-to-r from-cream-400 to-cream-500 hover:from-cream-500 hover:to-cream-600 text-slate-800 shadow-soft",
    };
    if (isScanning) {
        return (<framer_motion_1.motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={(0, utils_1.cn)("relative overflow-hidden rounded-lg", variant === "floating" ? "rounded-full" : "", className)}>
        <button_1.Button disabled className={(0, utils_1.cn)(buttonVariants[variant], "relative min-w-[120px] animate-pulse-glow")}>
          <div className="flex items-center gap-2">
            <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>
            <span className="hidden sm:inline">Procesando...</span>
          </div>
        </button_1.Button>

        {/* Progress indicator */}
        <framer_motion_1.motion.div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full" initial={{ width: "0%" }} animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }}/>

        {/* Scanning animation overlay */}
        <framer_motion_1.motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}/>
      </framer_motion_1.motion.div>);
    }
    return (<div className={(0, utils_1.cn)("relative", className)}>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden"/>

      <framer_motion_1.motion.div onHoverStart={() => setShowOptions(true)} onHoverEnd={() => setShowOptions(false)} className="relative">
        <button_1.Button onClick={triggerFileSelect} disabled={disabled} className={(0, utils_1.cn)(buttonVariants[variant], "relative overflow-hidden group transition-all duration-300", showOptions && "animate-ocr-scan")}>
          <framer_motion_1.motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <lucide_react_1.Scan className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"/>
            <span className="hidden sm:inline font-medium">{variant === "header" ? "Escanear Factura" : "OCR"}</span>
          </framer_motion_1.motion.div>

          {/* Hover effect overlay */}
          <framer_motion_1.motion.div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={false}/>
        </button_1.Button>

        {/* Quick options on hover */}
        <framer_motion_1.AnimatePresence>
          {showOptions && !isScanning && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-elegant border border-slate-200 dark:border-slate-700 p-2 min-w-[200px]">
              <div className="space-y-1">
                <button_1.Button variant="ghost" size="sm" className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-sage-900/20" onClick={triggerFileSelect}>
                  <lucide_react_1.Upload className="w-4 h-4 mr-2"/>
                  Subir Archivo
                </button_1.Button>
                <button_1.Button variant="ghost" size="sm" className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-sage-900/20" onClick={triggerFileSelect}>
                  <lucide_react_1.Camera className="w-4 h-4 mr-2"/>
                  Tomar Foto
                </button_1.Button>
                <div className="pt-1 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">Formatos: PDF, JPG, PNG</p>
                </div>
              </div>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </framer_motion_1.motion.div>
    </div>);
}
