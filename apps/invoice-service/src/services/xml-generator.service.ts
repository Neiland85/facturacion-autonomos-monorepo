import { InvoiceWithDetails } from "@facturacion/database";

const DEFAULT_XML_TRANSFORMER_URL = "http://localhost:3004";

export class XmlGeneratorService {
  private static get transformerUrl(): string {
    return process.env.XML_TRANSFORMER_URL || DEFAULT_XML_TRANSFORMER_URL;
  }

  private static mapInvoiceToPayload(invoice: InvoiceWithDetails) {
    const toNumber = (value: any) => (value ? Number(value) : 0);

    return {
      number: invoice.number,
      date: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : undefined,
      issuer: {
        name: invoice.company.name,
        fiscalId: invoice.company.cif,
        address: {
          street: invoice.company.address,
          city: invoice.company.city,
          postalCode: invoice.company.postalCode,
          province: invoice.company.province,
          country: "España",
        },
      },
      client: {
        name: invoice.client.name,
        fiscalId: invoice.client.nifCif,
        address: {
          street: invoice.client.address ?? "",
          city: invoice.client.city ?? "",
          postalCode: invoice.client.postalCode ?? "",
          province: invoice.client.province ?? "",
          country: "España",
        },
      },
      lines: invoice.lines.map((line) => {
        const quantity = toNumber(line.quantity);
        const price = toNumber(line.price);
        const vatRate = toNumber(line.vatRate);
        const lineSubtotal = quantity * price;
        const vatAmount = lineSubtotal * (vatRate / 100);

        return {
          description: line.description,
          quantity,
          unitPrice: price,
          vatRate,
          vatAmount,
          total: lineSubtotal + vatAmount,
        };
      }),
      subtotal: toNumber(invoice.subtotal),
      totalVat: toNumber(invoice.vatAmount),
      total: toNumber(invoice.total),
      notes: invoice.notes ?? undefined,
    };
  }

  static async generateAndSignXml(invoice: InvoiceWithDetails): Promise<string> {
    const payload = this.mapInvoiceToPayload(invoice);
    const endpoint = `${this.transformerUrl.replace(/\/$/, "")}/api/transform/facturae`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`XML transformer error (${response.status}): ${errorBody}`);
    }

    return response.text();
  }
}
