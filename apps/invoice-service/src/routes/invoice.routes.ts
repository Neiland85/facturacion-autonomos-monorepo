import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Obtener lista de facturas
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, overdue, cancelled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
 *       401:
 *         description: No autorizado
 */
router.get("/", authenticateToken, InvoiceController.getInvoices);

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - items
 *               - total
 *             properties:
 *               clientId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     taxRate:
 *                       type: number
 *               total:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post("/", idempotencyMiddleware(), InvoiceController.createInvoice);

/**
 * @swagger
 * /api/v1/invoices/stats/summary:
 *   get:
 *     summary: Obtener estadísticas de facturas
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get("/stats/summary", authenticateToken, InvoiceController.getStats);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.get("/:id", authenticateToken, InvoiceController.getInvoiceById);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   put:
 *     summary: Actualizar factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid, overdue, cancelled]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.put("/:id", idempotencyMiddleware(), InvoiceController.updateInvoice);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   delete:
 *     summary: Eliminar factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       204:
 *         description: Factura eliminada exitosamente
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", InvoiceController.deleteInvoice);

/**
 * @swagger
 * /api/v1/invoices/{id}/pdf:
 *   get:
 *     summary: Generar PDF de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.get("/:id/pdf", authenticateToken, (req, res) => {
  res.json({
    success: false,
    message: "Invoice routes not yet implemented - Generate PDF endpoint",
    endpoint: `/api/v1/invoices/${req.params.id}/pdf`,
    method: "GET",
    invoiceId: req.params.id,
  });
});

/**
 * @swagger
 * /api/v1/invoices/{id}/xml/signed:
 *   get:
 *     summary: Descargar XML firmado de una factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: XML firmado de la factura
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Factura no encontrada o XML no disponible
 */
router.get("/:id/xml/signed", authenticateToken, InvoiceController.getSignedXml);

/**
 * @swagger
 * /api/v1/invoices/{id}/send:
 *   post:
 *     summary: Enviar factura por email
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del destinatario (opcional, usa el del cliente si no se especifica)
 *               message:
 *                 type: string
 *                 description: Mensaje personalizado
 *     responses:
 *       200:
 *         description: Factura enviada exitosamente
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.post("/:id/send", idempotencyMiddleware(), InvoiceController.sendInvoice);

/**
 * @swagger
 * /api/v1/invoices/{id}/submit-aeat:
 *   post:
 *     summary: Enviar factura a AEAT SII
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura enviada a AEAT exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     siiReference:
 *                       type: string
 *                       description: CSV (Código Seguro de Verificación)
 *       404:
 *         description: Factura no encontrada
 *       409:
 *         description: Factura ya enviada a AEAT
 *       503:
 *         description: Integración AEAT SII no habilitada
 *       500:
 *         description: Error al enviar a AEAT
 */
router.post(
  "/:id/submit-aeat",
  authenticateToken,
  idempotencyMiddleware(),
  InvoiceController.submitToAEAT
);

export default router;

