import { Request, Response } from 'express';
import { FacturaeService } from '../services/facturae.service';
import { invoiceSchema } from '@facturacion/validation';
import { ZodError } from 'zod';

export class TransformController {
  public static transform = (req: Request, res: Response): void => {
    try {
      // Validar el JSON de entrada con el esquema de Zod
      const validatedData = invoiceSchema.parse(req.body);

      const xmlResult = FacturaeService.generateFacturae(validatedData);

      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(xmlResult);
    } catch (error) {
      if (error instanceof ZodError) {
        // Error de validación de Zod
        res.status(400).json({
          error: 'Datos de entrada inválidos.',
          details: error.flatten().fieldErrors,
        });
      } else {
        // Otros errores internos
        console.error('Error al transformar a XML:', error);
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({
          error: 'Error interno al generar el XML.',
          details: message,
        });
      }
    }
  };
}
