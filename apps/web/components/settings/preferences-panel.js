"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PreferencesPanel;
const dialog_1 = require("@/components/ui/dialog");
const tabs_1 = require("@/components/ui/tabs");
const theme_selector_1 = require("./theme-selector");
const ocr_settings_1 = require("./ocr-settings");
const lucide_react_1 = require("lucide-react");
function PreferencesPanel({ open, onOpenChange }) {
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-cream-50 dark:from-slate-900 dark:to-slate-800">
        <dialog_1.DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <dialog_1.DialogTitle className="flex items-center gap-3 text-2xl">
            <lucide_react_1.Settings className="w-6 h-6 text-primary"/>
            Preferencias de la Aplicación
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>Personaliza la apariencia y el comportamiento de TributariApp.</dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <tabs_1.Tabs defaultValue="visual" className="w-full mt-4">
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="visual" className="flex items-center gap-2">
              <lucide_react_1.Palette className="w-4 h-4"/>
              Visual
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="ocr" className="flex items-center gap-2">
              <lucide_react_1.Scan className="w-4 h-4"/>
              OCR
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          <tabs_1.TabsContent value="visual" className="mt-4">
            <theme_selector_1.default />
          </tabs_1.TabsContent>
          <tabs_1.TabsContent value="ocr" className="mt-4">
            <ocr_settings_1.default />
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
