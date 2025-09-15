```tsx
// Ejemplo completo de integración en client-layout.tsx

"use client"

import { useState } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import TributariAppLogo from "@/components/tributariApp-logo"
import Link from "next/link"
import { Home, FileText, Users, Settings, MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
// Importar los componentes de voz desde la librería UI
import VoiceHeader from "@/components/ui" // o desde '@/components/voice-header'
import { InvoicesProvider, useInvoices } from "@/contexts/invoices-context"
import { useRouter } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// Componente interno que usa hooks
function AppContentController({ children }: { children: React.ReactNode }) {
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false)
  const { addInvoice } = useInvoices()
  const router = useRouter()

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/facturas", label: "Facturas", icon: FileText },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  // Función para manejar la creación de facturas desde voz
  const handleCreateInvoice = (invoiceData: any) => {
    console.log('Creando factura desde voz:', invoiceData)

    // Crear la factura usando el contexto
    const newInvoice = {
      id: Date.now().toString(),
      client: invoiceData.client || '',
      amount: invoiceData.amount || 0,
      description: invoiceData.description || '',
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    }

    addInvoice(newInvoice)

    // Navegar a la página de edición de la factura
    router.push(`/ facturas / ${ newInvoice.id }/editar`)
  }

return (
  <div className="flex flex-col min-h-screen">
    {/* Mobile Header */}
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <TributariAppLogo />
        </Link>
        <div className="flex items-center gap-2">
          {/* Integrar VoiceHeader en mobile header */}
          <VoiceHeader
            onCreateInvoice={handleCreateInvoice}
            className="flex items-center gap-1"
          />
          <Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
            <Settings className="h-6 w-6" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="p-4 border-b">
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
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent"
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
          {/* Integrar VoiceHeader en desktop header */}
          <VoiceHeader
            onCreateInvoice={handleCreateInvoice}
            className="flex items-center gap-2 mr-4"
          />
          <Button variant="ghost" size="icon" onClick={() => setShowPreferencesPanel(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>

    <main className="flex-1 container px-4 py-6 md:py-8">
      {children}
    </main>

    {/* Mobile Bottom Navigation */}
    <nav className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden shadow-soft">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>

    <footer className="hidden md:block py-6 text-center text-sm text-muted-foreground border-t">
      © 2025 TributariApp. Todos los derechos reservados.
    </footer>

    {/* Panel de preferencias u otros componentes modales */}
    {/* ... resto de componentes modales ... */}
  </div>
)
}

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-gradient-to-br from-background via-card/30 to-background text-foreground")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <InvoicesProvider>
            <AppContentController>{children}</AppContentController>
          </InvoicesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```
