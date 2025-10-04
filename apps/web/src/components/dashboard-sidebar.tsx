import Link from "next/link"
import { Home, FileText, Users, BarChart3, Settings } from "lucide-react"

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Facturación</h1>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/invoices" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <FileText className="h-4 w-4" />
            Facturas
          </Link>
          <Link href="/clients" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Users className="h-4 w-4" />
            Clientes
          </Link>
          <Link href="/reports" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </nav>
      </div>
    </aside>
  )
}