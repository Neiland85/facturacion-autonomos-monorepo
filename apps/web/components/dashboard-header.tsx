"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  systemStatus?: "operational" | "degraded" | "down"
}

export function DashboardHeader({ systemStatus = "operational" }: DashboardHeaderProps) {
  const statusConfig = {
    operational: { label: "Sistema Operativo", color: "bg-success text-white" },
    degraded: { label: "Rendimiento Degradado", color: "bg-warning text-white" },
    down: { label: "Sistema Caído", color: "bg-destructive text-white" },
  }

  const status = statusConfig[systemStatus]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Panel de Control</h1>
        <Badge className={status.color}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Buscar facturas, clientes..." className="w-64 pl-9" />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  )
}
