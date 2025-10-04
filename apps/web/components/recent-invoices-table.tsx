import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Invoice {
  id: string
  client: string
  amount: number
  date: string
  status: "paid" | "pending"
}

interface RecentInvoicesTableProps {
  invoices: Invoice[]
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Facturas</CardTitle>
        <CardDescription>Las 5 facturas más recientes de tu negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.client}</TableCell>
                <TableCell className="font-mono">
                  €{invoice.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(invoice.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === "paid" ? "default" : "secondary"}
                    className={
                      invoice.status === "paid"
                        ? "bg-success text-white hover:bg-success/90"
                        : "bg-warning text-white hover:bg-warning/90"
                    }
                  >
                    {invoice.status === "paid" ? "Pagada" : "Pendiente"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
