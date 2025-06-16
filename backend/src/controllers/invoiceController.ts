import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { logger } from '../utils/logger';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany();
    res.status(200).json(invoices);
  } catch (error) {
    logger.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error interno al obtener facturas' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { clientId, amount, description } = req.body;
    const newInvoice = await prisma.invoice.create({
      data: { clientId, amount, description },
    });
    res.status(201).json(newInvoice);
  } catch (error) {
    logger.error('Error al crear factura:', error);
    res.status(500).json({ error: 'Error interno al crear factura' });
  }
};
