"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Filter, Download, Eye, Edit, Plus } from "lucide-react"
import Link from "next/link"

interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: "Pagada" | "Pendiente" | "Vencida" | "Borrador"
  date: string
  dueDate: string
}

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const invoices: Invoice[] = [
    {
      id: "1",
      number: "INV-001",
      client: "Empresa ABC S.L.",
      amount: 850,
      status: "Pagada",
      date: "2024-01-15",
      dueDate: "2024-02-15",
    },
    {
      id: "2",
      number: "INV-002",
      client: "Consultora XYZ",
      amount: 1200,
      status: "Pendiente",
      date: "2024-01-10",
      dueDate: "2024-02-10",
    },
    {
      id: "3",
      number: "INV-003",
      client: "Startup Tech",
      amount: 650,
      status: "Vencida",
      date: "2023-12-28",
      dueDate: "2024-01-28",
    },
    {
      id: "4",
      number: "INV-004",
      client: "Desarrollo Web Pro",
      amount: 2100,
      status: "Borrador",
      date: "2024-01-20",
      dueDate: "2024-02-20",
    },
    {
      id: "5",
      number: "INV-005",
      client: "Marketing Digital Plus",
      amount: 750,
      status: "Pagada",
      date: "2024-01-12",
      dueDate: "2024-02-12",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pagada":
        return "bg-green-100 text-green-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "Vencida":
        return "bg-red-100 text-red-800"
      case "Borrador":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = filteredInvoices
    .filter((invoice) => invoice.status === "Pagada")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.status === "Pendiente" || invoice.status === "Vencida")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

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
                <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
                <p className="text-gray-600">Gestiona todas tus facturas</p>
              </div>
            </div>
            <Link href="/nueva-factura">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Facturado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">{filteredInvoices.length} facturas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{paidAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Facturas pagadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">€{pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Por cobrar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra tus facturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por número o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Facturas</CardTitle>
            <CardDescription>{filteredInvoices.length} facturas encontradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell className="font-medium">€{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
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
