import express from "express";
import { FacturasController } from "../controllers/facturas";

const router = express.Router();

/**
 * @swagger
 * /api/v1/facturas:
 *   get:
 *     summary: Obtener lista de facturas
 *     tags: [Facturas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [emitida, recibida]
 *         description: Tipo de factura
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, enviada, pagada, anulada]
 *         description: Estado de la factura
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Factura'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get("/", facturaController.getFacturas);

/**
 * @swagger
 * /api/v1/facturas:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaCreate'
 *     responses:
 *       201:
 *         description: Factura creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Factura'
 *                 message:
 *                   type: string
 */
router.post("/", validateFactura, facturaController.createFactura);

/**
 * @swagger
 * /api/v1/facturas/{id}:
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
 *                 data:
 *                   $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura no encontrada
 */
router.get("/:id", facturaController.getFacturaById);

/**
 * @swagger
 * /api/v1/facturas/{id}:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaUpdate'
 *     responses:
 *       200:
 *         description: Factura actualizada correctamente
 *       404:
 *         description: Factura no encontrada
 *       422:
 *         description: Error de validación
 */
router.put("/:id", validateFacturaUpdate, facturaController.updateFactura);

/**
 * @swagger
 * /api/v1/facturas/{id}:
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
 *     responses:
 *       204:
 *         description: Factura eliminada correctamente
 *       404:
 *         description: Factura no encontrada
 *       409:
 *         description: No se puede eliminar la factura
 */
router.delete("/:id", facturaController.deleteFactura);

/**
 * @swagger
 * /api/v1/facturas/{id}/pdf:
 *   get:
 *     summary: Generar PDF de factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:id/pdf", facturaController.generatePDF);

/**
 * @swagger
 * /api/v1/facturas/{id}/enviar:
 *   post:
 *     summary: Enviar factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enviarCliente:
 *                 type: boolean
 *                 default: true
 *               enviarAEAT:
 *                 type: boolean
 *                 default: false
 *               emailPersonalizado:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Factura enviada correctamente
 */
router.post("/:id/enviar", facturaController.enviarFactura);

export default router;
