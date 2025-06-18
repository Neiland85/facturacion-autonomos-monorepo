import { Request, Response } from 'express';

export const getInvoices = (req: Request, res: Response) => {
  res.json({ message: 'Obteniendo facturas...' });
};

export const createInvoice = (req: Request, res: Response) => {
  const { invoiceData } = req.body;
  if (!invoiceData) {
    return res.status(400).json({ error: 'Datos de factura no proporcionados.' });
  }

  res.status(201).json({ message: 'Factura creada exitosamente.', invoice: invoiceData });
};