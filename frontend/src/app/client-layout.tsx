"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TributariAppLogo from "@/components/tributariApp-logo"
import Link from "next/link"
import { Home, FileText, Users, Settings, MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import OCRScanButton from "@/components/ocr/ocr-scan-button"
import OCRResultsModal from "@/components/ocr/ocr-results-modal"
import PreferencesPanel from "@/components/settings/preferences-panel"
import { useState, useEffect } from "react"
import type { OCRProcessingResult, OCRInvoiceData } from "@/types/ocr"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/facturas", label: "Facturas", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/configuracion", label: "Ajustes", icon: Settings },
]

type AppTheme = "default" | "sage" | "terracotta"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [ocrResult, setOcrResult] = useState<OCRProcessingResult | null>(null)
  const [showOcrModal, setShowOcrModal] = useState(false)
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false)
  const [currentAppTheme, setCurrentAppTheme] = useState<AppTheme>("default")
  const [hasPaperTexture, setHasPaperTexture] = useState(false)

  useEffect(() => {
    // Apply theme and texture from localStorage on initial load
    const storedAppTheme = (localStorage.getItem("app-theme") as AppTheme) || "default"
    const storedTexture = localStorage.getItem("app-texture") === "true"

    setCurrentAppTheme(storedAppTheme)
    setHasPaperTexture(storedTexture)

    // Manually add classes to body as it's outside React's direct control for initial render
    document.body.classList.add(`theme-${storedAppTheme}`)
    if (storedTexture) {
      document.body.classList.add("bg-paper-texture")
    }

    // Listen for changes from the preferences panel
    const handleStorageChange = () => {
      const updatedAppTheme = (localStorage.getItem("app-theme") as AppTheme) || "default"
      const updatedTexture = localStorage.getItem("app-texture") === "true"

      if (updatedAppTheme !== currentAppTheme) {
        document.body.classList.remove(`theme-${currentAppTheme}`)
        document.body.classList.add(`theme-${updatedAppTheme}`)
        setCurrentAppTheme(updatedAppTheme)
      }

      if (updatedTexture !== hasPaperTexture) {
        if (updatedTexture) {
          document.body.classList.add("bg-paper-texture")
        } else {
          document.body.classList.remove("bg-paper-texture")
        }
        setHasPaperTexture(updatedTexture)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [currentAppTheme, hasPaperTexture]) // Re-run if these states change internally

  const handleOcrComplete = (result: OCRProcessingResult) => {
    setOcrResult(result)
    setShowOcrModal(true)
  }

  const handleOcrSave = (data: OCRInvoiceData) => {
    // Here you would typically save to your backend
    console.log("Saving OCR data:", data)
    setShowOcrModal(false)
    // You could redirect to invoice creation page with pre-filled data
    // router.push(`/nueva-factura?ocr=${data.id}`)
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "bg-gradient-to-br from-background via-card/30 to-background text-foreground",
          hasPaperTexture && "bg-paper-texture",
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
              <div className="container flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center">
                  <TributariAppLogo />
                </Link>
                <div className="flex items-center gap-2">
                  <OCRScanButton onScanComplete={handleOcrComplete} variant="floating" className="w-10 h-10" />
                  <Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
                    <Settings className="h-6 w-6" />
                    <span className="sr-only">Abrir preferencias</span>
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MenuIcon className="h-6 w-6" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] p-0 bg-gradient-to-b from-background to-card/30">
                      <div className="p-4 border-b border-border">
                        <SheetClose asChild>
                          <Link href="/" className="flex items-center">
                            <TributariAppLogo />
                          </Link>
                        </SheetClose>
                      </div>
                      <nav className="flex flex-col space-y-1 p-4">
                        {navItems.map((item) => (
                          <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <item.icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block shadow-soft">
              <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center">
                  <TributariAppLogo />
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  {navItems.slice(0, 3).map((item) => (
                    <Link key={item.href} href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-3">
                  <OCRScanButton onScanComplete={handleOcrComplete} variant="header" className="shadow-elegant" />
                  <Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Abrir preferencias</span>
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 container px-4 py-6 md:py-8">{children}</main>

            {/* Mobile Bottom Navigation */}
            <nav className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
              <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <item.icon className="h-6 w-6 mb-0.5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <footer className="hidden md:block py-6 text-center text-sm text-muted-foreground border-t border-border bg-gradient-to-r from-card/50 to-background/30">
              © {new Date().getFullYear()} TributariApp. Todos los derechos reservados.
            </footer>
          </div>

          <OCRResultsModal
            open={showOcrModal}
            onOpenChange={setShowOcrModal}
            result={ocrResult}
            onSave={handleOcrSave}
          />
          <PreferencesPanel open={showPreferencesPanel} onOpenChange={setShowPreferencesPanel} />
        </ThemeProvider>
      </body>
    </html>
  )
}
