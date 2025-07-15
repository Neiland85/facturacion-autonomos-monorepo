"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ClientLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const theme_provider_1 = require("@/components/theme-provider");
const tributariApp_logo_1 = require("@/components/tributariApp-logo");
const link_1 = require("next/link");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const sheet_1 = require("@/components/ui/sheet");
const ocr_scan_button_1 = require("@/components/ocr/ocr-scan-button");
const ocr_results_modal_1 = require("@/components/ocr/ocr-results-modal");
const preferences_panel_1 = require("@/components/settings/preferences-panel");
const react_1 = require("react");
const utils_1 = require("@/lib/utils");
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
const navItems = [
    { href: "/", label: "Inicio", icon: lucide_react_1.Home },
    { href: "/facturas", label: "Facturas", icon: lucide_react_1.FileText },
    { href: "/clientes", label: "Clientes", icon: lucide_react_1.Users },
    { href: "/configuracion", label: "Ajustes", icon: lucide_react_1.Settings },
];
function ClientLayout({ children, }) {
    const [ocrResult, setOcrResult] = (0, react_1.useState)(null);
    const [showOcrModal, setShowOcrModal] = (0, react_1.useState)(false);
    const [showPreferencesPanel, setShowPreferencesPanel] = (0, react_1.useState)(false);
    const [currentAppTheme, setCurrentAppTheme] = (0, react_1.useState)("default");
    const [hasPaperTexture, setHasPaperTexture] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Apply theme and texture from localStorage on initial load
        const storedAppTheme = localStorage.getItem("app-theme") || "default";
        const storedTexture = localStorage.getItem("app-texture") === "true";
        setCurrentAppTheme(storedAppTheme);
        setHasPaperTexture(storedTexture);
        // Manually add classes to body as it's outside React's direct control for initial render
        document.body.classList.add(`theme-${storedAppTheme}`);
        if (storedTexture) {
            document.body.classList.add("bg-paper-texture");
        }
        // Listen for changes from the preferences panel
        const handleStorageChange = () => {
            const updatedAppTheme = localStorage.getItem("app-theme") || "default";
            const updatedTexture = localStorage.getItem("app-texture") === "true";
            if (updatedAppTheme !== currentAppTheme) {
                document.body.classList.remove(`theme-${currentAppTheme}`);
                document.body.classList.add(`theme-${updatedAppTheme}`);
                setCurrentAppTheme(updatedAppTheme);
            }
            if (updatedTexture !== hasPaperTexture) {
                if (updatedTexture) {
                    document.body.classList.add("bg-paper-texture");
                }
                else {
                    document.body.classList.remove("bg-paper-texture");
                }
                setHasPaperTexture(updatedTexture);
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [currentAppTheme, hasPaperTexture]); // Re-run if these states change internally
    const handleOcrComplete = (result) => {
        setOcrResult(result);
        setShowOcrModal(true);
    };
    const handleOcrSave = (data) => {
        // Here you would typically save to your backend
        console.log("Saving OCR data:", data);
        setShowOcrModal(false);
        // You could redirect to invoice creation page with pre-filled data
        // router.push(`/nueva-factura?ocr=${data.id}`)
    };
    return (<html lang="es" suppressHydrationWarning>
      <body className={(0, utils_1.cn)(inter.className, "bg-gradient-to-br from-background via-card/30 to-background text-foreground", hasPaperTexture && "bg-paper-texture")}>
        <theme_provider_1.ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
              <div className="container flex h-14 items-center justify-between px-4">
                <link_1.default href="/" className="flex items-center">
                  <tributariApp_logo_1.default />
                </link_1.default>
                <div className="flex items-center gap-2">
                  <ocr_scan_button_1.default onScanComplete={handleOcrComplete} variant="floating" className="w-10 h-10"/>
                  <button_1.Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
                    <lucide_react_1.Settings className="h-6 w-6"/>
                    <span className="sr-only">Abrir preferencias</span>
                  </button_1.Button>
                  <sheet_1.Sheet>
                    <sheet_1.SheetTrigger asChild>
                      <button_1.Button variant="ghost" size="icon">
                        <lucide_react_1.MenuIcon className="h-6 w-6"/>
                        <span className="sr-only">Abrir menú</span>
                      </button_1.Button>
                    </sheet_1.SheetTrigger>
                    <sheet_1.SheetContent side="right" className="w-[280px] p-0 bg-gradient-to-b from-background to-card/30">
                      <div className="p-4 border-b border-border">
                        <sheet_1.SheetClose asChild>
                          <link_1.default href="/" className="flex items-center">
                            <tributariApp_logo_1.default />
                          </link_1.default>
                        </sheet_1.SheetClose>
                      </div>
                      <nav className="flex flex-col space-y-1 p-4">
                        {navItems.map((item) => (<sheet_1.SheetClose asChild key={item.href}>
                            <link_1.default href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                              <item.icon className="h-5 w-5"/>
                              {item.label}
                            </link_1.default>
                          </sheet_1.SheetClose>))}
                      </nav>
                    </sheet_1.SheetContent>
                  </sheet_1.Sheet>
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block shadow-soft">
              <div className="container flex h-16 items-center justify-between px-4">
                <link_1.default href="/" className="flex items-center">
                  <tributariApp_logo_1.default />
                </link_1.default>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  {navItems.slice(0, 3).map((item) => (<link_1.default key={item.href} href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </link_1.default>))}
                </nav>
                <div className="flex items-center gap-3">
                  <ocr_scan_button_1.default onScanComplete={handleOcrComplete} variant="header" className="shadow-elegant"/>
                  <button_1.Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
                    <lucide_react_1.Settings className="h-5 w-5"/>
                    <span className="sr-only">Abrir preferencias</span>
                  </button_1.Button>
                </div>
              </div>
            </header>

            <main className="flex-1 container px-4 py-6 md:py-8">{children}</main>

            {/* Mobile Bottom Navigation */}
            <nav className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
              <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => (<link_1.default key={item.href} href={item.href} className="flex flex-col items-center justify-center p-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    <item.icon className="h-6 w-6 mb-0.5"/>
                    {item.label}
                  </link_1.default>))}
              </div>
            </nav>

            <footer className="hidden md:block py-6 text-center text-sm text-muted-foreground border-t border-border bg-gradient-to-r from-card/50 to-background/30">
              © {new Date().getFullYear()} TributariApp. Todos los derechos reservados.
            </footer>
          </div>

          <ocr_results_modal_1.default open={showOcrModal} onOpenChange={setShowOcrModal} result={ocrResult} onSave={handleOcrSave}/>
          <preferences_panel_1.default open={showPreferencesPanel} onOpenChange={setShowPreferencesPanel}/>
        </theme_provider_1.ThemeProvider>
      </body>
    </html>);
}
