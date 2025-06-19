import { Request, Response } from 'express';
import PDFDocument = require('pdfkit');

export const generateInvoicePDF = (req: Request, res: Response) => {
  const { clientName, invoiceNumber, items, total } = req.body;

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);

  doc.pipe(res);

  // Encabezado
  doc.fontSize(20).text('Factura', { align: 'center' });
  doc.moveDown();

  // Información del cliente
  doc.fontSize(12).text(`Cliente: ${clientName}`);
  doc.text(`Número de factura: ${invoiceNumber}`);
  doc.moveDown();

  // Detalles de los ítems
  items.forEach((item: { description: string; price: number }) => {
    doc.text(`${item.description} - $${item.price}`);
  });

  doc.moveDown();

  // Total
  doc.fontSize(16).text(`Total: $${total}`, { align: 'right' });

  doc.end();
};
