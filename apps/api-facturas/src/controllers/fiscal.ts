import { CalculadorFiscal } from '@facturacion/core';
import { Request, Response } from 'express';
import { validarNIF } from '../utils/fiscal';

export class FiscalController {
  async calcular(req: Request, res: Response) {
    try {
      const { baseImponible, tipoIVA, tipoIRPF, regimenEspecial } = req.body;

      if (!baseImponible || baseImponible < 0) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Base imponible requerida y debe ser mayor que 0',
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const calculador = new CalculadorFiscal();
      const resultado = calculador.calcularImpuestos({
        baseImponible,
        tipoIVA: tipoIVA || 21,
        tipoIRPF: tipoIRPF || 0,
        regimenEspecial: regimenEspecial || 'general',
      });

      res.json({
        data: resultado,
      });
    } catch (error) {
      console.error('Error al calcular impuestos:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al calcular los impuestos',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async getTiposIVA(req: Request, res: Response) {
    try {
      const tiposIVA = [
        { tipo: 0, descripcion: 'Exento', vigente: true },
        { tipo: 4, descripcion: 'Superreducido', vigente: true },
        { tipo: 10, descripcion: 'Reducido', vigente: true },
        { tipo: 21, descripcion: 'General', vigente: true },
      ];

      res.json({
        data: tiposIVA,
      });
    } catch (error) {
      console.error('Error al obtener tipos de IVA:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener los tipos de IVA',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }

  async validarNIF(req: Request, res: Response) {
    try {
      const { nif } = req.body;

      if (!nif) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'NIF requerido',
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      const resultado = validarNIF(nif);
      let tipo = '';
      let mensaje = '';

      if (resultado) {
        if (nif.match(/^\d{8}[A-Z]$/)) {
          tipo = 'NIF';
          mensaje = 'NIF válido';
        } else if (nif.match(/^[A-Z]\d{7}[A-Z]$/)) {
          tipo = 'CIF';
          mensaje = 'CIF válido';
        }
      } else {
        mensaje = 'NIF/CIF no válido';
      }

      res.json({
        valid: resultado,
        tipo,
        message: mensaje,
      });
    } catch (error) {
      console.error('Error al validar NIF:', error);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error al validar el NIF',
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
}
