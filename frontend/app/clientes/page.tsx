"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Edit, Eye, Mail, Phone } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  taxId: string
  totalInvoiced: number
  invoiceCount: number
  status: "Activo" | "Inactivo"
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("")

  const clients: Client[] = [
    {
      id: "1",
      name: "Empresa ABC S.L.",
      email: "contacto@empresaabc.com",
      phone: "+34 912 345 678",
      address: "Calle Mayor 123, 28001 Madrid",
      taxId: "B12345678",
      totalInvoiced: 2450,
      invoiceCount: 3,
      status: "Activo",
    },
    {
      id: "2",
      name: "Consultora XYZ",
      email: "info@consultoraxyz.es",
      phone: "+34 934 567 890",
      address: "Paseo de Gracia 45, 08007 Barcelona",
      taxId: "B87654321",
      totalInvoiced: 1800,
      invoiceCount: 2,
      status: "Activo",
    },
    {
      id: "3",
      name: "Startup Tech",
      email: "hello@startuptech.io",
      phone: "+34 955 123 456",
      address: "Calle Sierpes 67, 41004 Sevilla",
      taxId: "B11223344",
      totalInvoiced: 650,
      invoiceCount: 1,
      status: "Activo",
    },
    {
      id: "4",
      name: "Desarrollo Web Pro",
      email: "admin@webpro.com",
      phone: "+34 963 789 012",
      address: "Plaza del Ayuntamiento 8, 46002 Valencia",
      taxId: "B55667788",
      totalInvoiced: 2100,
      invoiceCount: 1,
      status: "Inactivo",
    },
  ]

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.taxId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalClients = filteredClients.length
  const activeClients = filteredClients.filter((client) => client.status === "Activo").length
  const totalRevenue = filteredClients.reduce((sum, client) => sum + client.totalInvoiced, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600">Gestiona tu cartera de clientes</p>
              </div>
            </div>
            <Link href="/nuevo-cliente">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-gray-600 mt-1">{activeClients} activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">De todos los clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Promedio por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                €{totalClients > 0 ? Math.round(totalRevenue / totalClients).toLocaleString() : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Facturación media</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
            <CardDescription>Encuentra clientes por nombre, email o CIF/NIF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>{filteredClients.length} clientes encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>CIF/NIF</TableHead>
                  <TableHead>Facturas</TableHead>
                  <TableHead>Total Facturado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{client.taxId}</TableCell>
                    <TableCell>{client.invoiceCount}</TableCell>
                    <TableCell className="font-medium">€{client.totalInvoiced.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          client.status === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
