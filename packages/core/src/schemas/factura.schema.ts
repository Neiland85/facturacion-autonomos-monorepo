import { z } from 'zod';
import { Factura, LineaFactura, TIPOS_IVA } from '../types';

// Validación de factura
export const facturaSchema = z.object({
  numero: z.string().min(1),
  fecha: z.date(),
  emisor: z.object({
    nombre: z.string().min(1),
    nif: z.string().regex(/^[0-9XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i),
    direccion: z.string().min(1)
  }),
  receptor: z.object({
    nombre: z.string().min(1),
    nif: z.string().regex(/^[0-9XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i),
    direccion: z.string().min(1)
  }),
  conceptos: z.array(z.object({
    descripcion: z.string().min(1),
    cantidad: z.number().positive(),
    precioUnitario: z.number().nonnegative(),
    tipoIVA: z.number().refine(tipo => TIPOS_IVA.some(t => t.tipo === tipo)),
    importe: z.number().nonnegative()
  })),
  baseImponible: z.number().nonnegative(),
  iva: z.number().nonnegative(),
  total: z.number().nonnegative(),
  retencion: z.number().nonnegative().optional()
});
