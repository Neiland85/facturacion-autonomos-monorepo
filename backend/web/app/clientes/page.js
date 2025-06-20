"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Clients;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const table_1 = require("@/components/ui/table");
const lucide_react_1 = require("lucide-react");
const link_1 = require("next/link");
function Clients() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const clients = [
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
    ];
    const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.taxId.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalClients = filteredClients.length;
    const activeClients = filteredClients.filter((client) => client.status === "Activo").length;
    const totalRevenue = filteredClients.reduce((sum, client) => sum + client.totalInvoiced, 0);
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
                <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600">Gestiona tu cartera de clientes</p>
              </div>
            </div>
            <link_1.default href="/nuevo-cliente">
              <button_1.Button>
                <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                Nuevo Cliente
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
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Total Clientes</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-gray-600 mt-1">{activeClients} activos</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">De todos los clientes</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm font-medium text-gray-600">Promedio por Cliente</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-blue-600">
                €{totalClients > 0 ? Math.round(totalRevenue / totalClients).toLocaleString() : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Facturación media</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Search */}
        <card_1.Card className="mb-6">
          <card_1.CardHeader>
            <card_1.CardTitle>Buscar Clientes</card_1.CardTitle>
            <card_1.CardDescription>Encuentra clientes por nombre, email o CIF/NIF</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <input_1.Input placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Clients Table */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Lista de Clientes</card_1.CardTitle>
            <card_1.CardDescription>{filteredClients.length} clientes encontrados</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Cliente</table_1.TableHead>
                  <table_1.TableHead>Contacto</table_1.TableHead>
                  <table_1.TableHead>CIF/NIF</table_1.TableHead>
                  <table_1.TableHead>Facturas</table_1.TableHead>
                  <table_1.TableHead>Total Facturado</table_1.TableHead>
                  <table_1.TableHead>Estado</table_1.TableHead>
                  <table_1.TableHead className="text-right">Acciones</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredClients.map((client) => (<table_1.TableRow key={client.id}>
                    <table_1.TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.address}</div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <lucide_react_1.Mail className="w-3 h-3"/>
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <lucide_react_1.Phone className="w-3 h-3"/>
                          {client.phone}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell className="font-mono">{client.taxId}</table_1.TableCell>
                    <table_1.TableCell>{client.invoiceCount}</table_1.TableCell>
                    <table_1.TableCell className="font-medium">€{client.totalInvoiced.toLocaleString()}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge className={client.status === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {client.status}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Eye className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Edit className="w-4 h-4"/>
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
