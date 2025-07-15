"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ThemeSelector;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const radio_group_1 = require("@/components/ui/radio-group");
const switch_1 = require("@/components/ui/switch");
const next_themes_1 = require("next-themes");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function ThemeSelector() {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const [selectedAppTheme, setSelectedAppTheme] = (0, react_1.useState)("default");
    const [enablePaperTexture, setEnablePaperTexture] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Read initial app theme from localStorage
        const storedAppTheme = localStorage.getItem("app-theme");
        if (storedAppTheme) {
            setSelectedAppTheme(storedAppTheme);
            document.body.classList.add(`theme-${storedAppTheme}`);
        }
        else {
            document.body.classList.add("theme-default");
        }
        // Read initial texture setting from localStorage
        const storedTexture = localStorage.getItem("app-texture") === "true";
        setEnablePaperTexture(storedTexture);
        if (storedTexture) {
            document.body.classList.add("bg-paper-texture");
        }
    }, []);
    const handleAppThemeChange = (newTheme) => {
        setSelectedAppTheme(newTheme);
        localStorage.setItem("app-theme", newTheme);
        // Remove previous theme classes and add the new one
        document.body.classList.remove("theme-default", "theme-sage", "theme-terracotta");
        document.body.classList.add(`theme-${newTheme}`);
    };
    const handleTextureToggle = (checked) => {
        setEnablePaperTexture(checked);
        localStorage.setItem("app-texture", String(checked));
        if (checked) {
            document.body.classList.add("bg-paper-texture");
        }
        else {
            document.body.classList.remove("bg-paper-texture");
        }
    };
    return (<card_1.Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
      <card_1.CardHeader>
        <card_1.CardTitle>Apariencia</card_1.CardTitle>
        <card_1.CardDescription>Personaliza el esquema de colores y la textura de la aplicación.</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Dark/Light Mode */}
        <div className="flex items-center justify-between">
          <label_1.Label htmlFor="dark-mode-switch" className="flex items-center gap-2">
            {theme === "dark" ? <lucide_react_1.Moon className="w-4 h-4"/> : <lucide_react_1.Sun className="w-4 h-4"/>}
            Modo Oscuro
          </label_1.Label>
          <switch_1.Switch id="dark-mode-switch" checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}/>
        </div>

        {/* Application Theme */}
        <div>
          <label_1.Label className="mb-2 block">Esquema de Colores</label_1.Label>
          <radio_group_1.RadioGroup value={selectedAppTheme} onValueChange={handleAppThemeChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center space-y-2">
              <radio_group_1.RadioGroupItem value="default" id="theme-default" className="sr-only"/>
              <label_1.Label htmlFor="theme-default" className={(0, utils_1.cn)("w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-primary", selectedAppTheme === "default" ? "border-primary ring-2 ring-primary" : "border-border", "bg-gradient-to-br from-petrol to-petrol-light dark:from-petrol-dark dark:to-petrol")}>
                <span className="text-white dark:text-gray-200">Default</span>
              </label_1.Label>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <radio_group_1.RadioGroupItem value="sage" id="theme-sage" className="sr-only"/>
              <label_1.Label htmlFor="theme-sage" className={(0, utils_1.cn)("w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-sage-500", selectedAppTheme === "sage" ? "border-sage-500 ring-2 ring-sage-500" : "border-border", "bg-gradient-to-br from-sage-500 to-sage-600 dark:from-sage-700 dark:to-sage-800")}>
                <span className="text-white dark:text-sage-100">Sage</span>
              </label_1.Label>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <radio_group_1.RadioGroupItem value="terracotta" id="theme-terracotta" className="sr-only"/>
              <label_1.Label htmlFor="theme-terracotta" className={(0, utils_1.cn)("w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-terracotta-500", selectedAppTheme === "terracotta"
            ? "border-terracotta-500 ring-2 ring-terracotta-500"
            : "border-border", "bg-gradient-to-br from-terracotta-500 to-terracotta-600 dark:from-terracotta-700 dark:to-terracotta-800")}>
                <span className="text-white dark:text-terracotta-100">Terracotta</span>
              </label_1.Label>
            </div>
          </radio_group_1.RadioGroup>
        </div>

        {/* Paper Texture */}
        <div className="flex items-center justify-between">
          <label_1.Label htmlFor="paper-texture-switch">Fondo con Textura de Papel</label_1.Label>
          <switch_1.Switch id="paper-texture-switch" checked={enablePaperTexture} onCheckedChange={handleTextureToggle}/>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
