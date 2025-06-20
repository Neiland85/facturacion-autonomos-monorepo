"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Invoices;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const select_1 = require("@/components/ui/select");
const table_1 = require("@/components/ui/table");
const lucide_react_1 = require("lucide-react");
const link_1 = require("next/link");
function Invoices() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const invoices = [
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
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case "Pagada":
                return "bg-green-100 text-green-800";
            case "Pendiente":
                return "bg-yellow-100 text-yellow-800";
            case "Vencida":
                return "bg-red-100 text-red-800";
            case "Borrador":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidAmount = filteredInvoices
        .filter((invoice) => invoice.status === "Pagada")
        .reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingAmount = filteredInvoices
        .filter((invoice) => invoice.status === "Pendiente" || invoice.status === "Vencida")
        .reduce((sum, invoice) => sum + invoice.amount, 0);
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <link_1.default href="/">
                <button_1.Button variant="ghost" size="sm">
                  <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
                  Volver
                </button_1.Button>
              </link_1.default>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
                <p className="text-gray-600">Gestiona todas tus facturas</p>
              </div>
            </div>
            <link_1.default href="/nueva-factura">
              <button_1.Button>
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                Nueva Factura
              </button_1.Button>
            </link_1.default>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Total Facturado</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">€{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">{filteredInvoices.length} facturas</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Cobrado</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">€{paidAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Facturas pagadas</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Pendiente</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-orange-600">€{pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Por cobrar</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Filters and Search */}
        <card_1.Card className="mb-6">
          <card_1.CardHeader>
            <card_1.CardTitle>Filtros</card_1.CardTitle>
            <card_1.CardDescription>Busca y filtra tus facturas</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                  <input_1.Input placeholder="Buscar por número o cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
                </div>
              </div>
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-full sm:w-48">
                  <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                  <select_1.SelectValue placeholder="Estado"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos los estados</select_1.SelectItem>
                  <select_1.SelectItem value="pagada">Pagada</select_1.SelectItem>
                  <select_1.SelectItem value="pendiente">Pendiente</select_1.SelectItem>
                  <select_1.SelectItem value="vencida">Vencida</select_1.SelectItem>
                  <select_1.SelectItem value="borrador">Borrador</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Invoices Table */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Lista de Facturas</card_1.CardTitle>
            <card_1.CardDescription>{filteredInvoices.length} facturas encontradas</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Número</table_1.TableHead>
                  <table_1.TableHead>Cliente</table_1.TableHead>
                  <table_1.TableHead>Fecha</table_1.TableHead>
                  <table_1.TableHead>Vencimiento</table_1.TableHead>
                  <table_1.TableHead>Importe</table_1.TableHead>
                  <table_1.TableHead>Estado</table_1.TableHead>
                  <table_1.TableHead className="text-right">Acciones</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredInvoices.map((invoice) => (<table_1.TableRow key={invoice.id}>
                    <table_1.TableCell className="font-medium">{invoice.number}</table_1.TableCell>
                    <table_1.TableCell>{invoice.client}</table_1.TableCell>
                    <table_1.TableCell>{new Date(invoice.date).toLocaleDateString("es-ES")}</table_1.TableCell>
                    <table_1.TableCell>{new Date(invoice.dueDate).toLocaleDateString("es-ES")}</table_1.TableCell>
                    <table_1.TableCell className="font-medium">€{invoice.amount.toLocaleString()}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge className={getStatusColor(invoice.status)}>{invoice.status}</badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Eye className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Edit className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Download className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>))}
              </table_1.TableBody>
            </table_1.Table>
          </card_1.CardContent>
        </card_1.Card>
      </main>
    </div>);
}
