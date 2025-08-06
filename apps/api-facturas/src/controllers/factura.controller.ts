import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { FacturaService } from '../services/factura.service';
import { 
  CreateFacturaInput, 
  UpdateFacturaInput, 
  FacturaFilter 
} from '../schemas/factura.schema';
import logger from '../config/logger';

const prisma = new PrismaClient();
const facturaService = new FacturaService(prisma);

export class FacturaController {
  async create(req: Request<{}, {}, CreateFacturaInput>, res: Response, next: NextFunction) {
    try {
      const factura = await facturaService.createFactura(req.body);
      res.status(201).json({
        success: true,
        data: factura,
      });
    } catch (error) {
      logger.error('Controller error creating factura', { error });
      next(error);
    }
  }

  async update(req: Request<{ id: string }, {}, UpdateFacturaInput>, res: Response, next: NextFunction) {
    try {
      const factura = await facturaService.updateFactura(req.params.id, req.body);
      res.json({
        success: true,
        data: factura,
      });
    } catch (error) {
      logger.error('Controller error updating factura', { error });
      next(error);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const factura = await facturaService.getFactura(req.params.id);
      res.json({
        success: true,
        data: factura,
      });
    } catch (error) {
      logger.error('Controller error getting factura', { error });
      next(error);
    }
  }

  async getByNumero(req: Request<{ numero: string }>, res: Response, next: NextFunction) {
    try {
      const factura = await facturaService.getFacturaByNumero(req.params.numero);
      res.json({
        success: true,
        data: factura,
      });
    } catch (error) {
      logger.error('Controller error getting factura by numero', { error });
      next(error);
    }
  }

  async list(req: Request<{}, {}, {}, FacturaFilter>, res: Response, next: NextFunction) {
    try {
      const result = await facturaService.listFacturas(req.query);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Controller error listing facturas', { error });
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      await facturaService.deleteFactura(req.params.id);
      res.json({
        success: true,
        message: 'Factura eliminada correctamente',
      });
    } catch (error) {
      logger.error('Controller error deleting factura', { error });
      next(error);
    }
  }

  async cambiarEstado(req: Request<{ id: string }, {}, { estado: string }>, res: Response, next: NextFunction) {
    try {
      const factura = await facturaService.cambiarEstado(req.params.id, req.body.estado);
      res.json({
        success: true,
        data: factura,
      });
    } catch (error) {
      logger.error('Controller error changing factura estado', { error });
      next(error);
    }
  }

  async getEstadisticas(req: Request<{}, {}, {}, { clienteId?: string }>, res: Response, next: NextFunction) {
    try {
      const estadisticas = await facturaService.getEstadisticas(req.query.clienteId);
      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      logger.error('Controller error getting estadisticas', { error });
      next(error);
    }
  }
}

export const facturaController = new FacturaController();