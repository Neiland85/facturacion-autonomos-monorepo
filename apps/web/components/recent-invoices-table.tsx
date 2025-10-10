import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const mockInvoices = [
  { id: "F-2024-001", client: "Empresa ABC S.L.", date: "2024-10-05", amount: "1.250,00 €", status: "Pagada" },
  { id: "F-2024-002", client: "Freelance Juan", date: "2024-10-03", amount: "850,00 €", status: "Pendiente" },
  { id: "F-2024-003", client: "Startup XYZ", date: "2024-10-01", amount: "2.100,00 €", status: "Pagada" },
  { id: "F-2024-004", client: "Consultoría Pro", date: "2024-09-28", amount: "3.500,00 €", status: "Vencida" },
];

export function RecentInvoicesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    invoice.status === 'Pagada' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
