import { Router } from 'express';
import { z } from 'zod';
import { facturaController } from '../controllers/factura.controller';
import { validate, validateQuery, validateParams } from '../middleware/validation.middleware';
import {
  CreateFacturaSchema,
  UpdateFacturaSchema,
  FacturaFilterSchema,
} from '../schemas/factura.schema';

const router = Router();

// Schema para validar ID UUID
const UUIDSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Schema para validar número de factura
const NumeroFacturaSchema = z.object({
  numero: z.string().regex(/^[A-Z0-9\-\/]+$/, 'Formato de número inválido'),
});

// Schema para cambio de estado
const CambiarEstadoSchema = z.object({
  estado: z.enum(['BORRADOR', 'EMITIDA', 'ENVIADA', 'COBRADA', 'ANULADA']),
});

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Listar facturas con filtros
 *     tags: [Facturas]
 *     parameters:
 *       - in: query
 *         name: numeroFactura
 *         schema:
 *           type: string
 *         description: Filtrar por número de factura
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [BORRADOR, EMITIDA, ENVIADA, COBRADA, ANULADA]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FacturaResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  validateQuery(FacturaFilterSchema),
  facturaController.list
);

/**
 * @swagger
 * /api/facturas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de facturas
 *     tags: [Facturas]
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente para filtrar estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Estadisticas'
 */
router.get(
  '/estadisticas',
  validateQuery(z.object({ clienteId: z.string().uuid().optional() })),
  facturaController.getEstadisticas
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FacturaResponse'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validateParams(UUIDSchema),
  facturaController.getById
);

/**
 * @swagger
 * /api/facturas/numero/{numero}:
 *   get:
 *     summary: Obtener factura por número
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9\-\/]+$'
 *         description: Número de factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FacturaResponse'
 *       404:
 *         description: Factura no encontrada
 */
router.get(
  '/numero/:numero',
  validateParams(NumeroFacturaSchema),
  facturaController.getByNumero
);

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFactura'
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FacturaResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validate(CreateFacturaSchema),
  facturaController.create
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   put:
 *     summary: Actualizar factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFactura'
 *     responses:
 *       200:
 *         description: Factura actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FacturaResponse'
 *       404:
 *         description: Factura no encontrada
 *       400:
 *         description: Error de validación
 */
router.put(
  '/:id',
  validateParams(UUIDSchema),
  validate(UpdateFacturaSchema.omit({ id: true })),
  facturaController.update
);

/**
 * @swagger
 * /api/facturas/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [BORRADOR, EMITIDA, ENVIADA, COBRADA, ANULADA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FacturaResponse'
 *       400:
 *         description: Transición de estado inválida
 *       404:
 *         description: Factura no encontrada
 */
router.patch(
  '/:id/estado',
  validateParams(UUIDSchema),
  validate(CambiarEstadoSchema),
  facturaController.cambiarEstado
);

/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Eliminar factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Solo se pueden eliminar facturas en estado borrador
 *       404:
 *         description: Factura no encontrada
 */
router.delete(
  '/:id',
  validateParams(UUIDSchema),
  facturaController.delete
);

export default router;