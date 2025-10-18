import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/subscriptions:
 *   post:
 *     summary: Crear nueva suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethodId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID del plan de suscripción
 *               paymentMethodId:
 *                 type: string
 *                 description: ID del método de pago (Stripe)
 *               couponCode:
 *                 type: string
 *                 description: Código de descuento opcional
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       402:
 *         description: Pago requerido
 */
router.post("/", idempotencyMiddleware(), SubscriptionController.createSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/plans:
 *   get:
 *     summary: Obtener planes de suscripción disponibles
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Lista de planes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   interval:
 *                     type: string
 *                     enum: [month, year]
 *                   features:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/plans", SubscriptionController.getSubscriptionPlans);

/**
 * @swagger
 * /api/v1/subscriptions/user:
 *   get:
 *     summary: Obtener suscripciones del usuario actual
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suscripciones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get("/user", authenticateToken, SubscriptionController.getUserSubscriptions);

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   get:
 *     summary: Obtener suscripción por ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción obtenida exitosamente
 *       404:
 *         description: Suscripción no encontrada
 *       401:
 *         description: No autorizado
 */
router.get("/:id", authenticateToken, SubscriptionController.getSubscriptionById);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/cancel:
 *   put:
 *     summary: Cancelar suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelAtPeriodEnd:
 *                 type: boolean
 *                 default: true
 *                 description: Cancelar al final del período actual
 *               cancellationReason:
 *                 type: string
 *                 description: Razón de cancelación
 *     responses:
 *       200:
 *         description: Suscripción cancelada exitosamente
 *       404:
 *         description: Suscripción no encontrada
 *       401:
 *         description: No autorizado
 */
router.put("/:id/cancel", authenticateToken, SubscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/payment-methods:
 *   get:
 *     summary: Obtener métodos de pago de la suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Métodos de pago obtenidos exitosamente
 *       404:
 *         description: Suscripción no encontrada
 *       401:
 *         description: No autorizado
 */
router.get("/:id/payment-methods", authenticateToken, SubscriptionController.getPaymentMethods);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/reactivate:
 *   put:
 *     summary: Reactivar suscripción cancelada
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción reactivada exitosamente
 *       404:
 *         description: Suscripción no encontrada
 *       401:
 *         description: No autorizado
 */
router.put("/:id/reactivate", authenticateToken, SubscriptionController.reactivateSubscription);

export default router;
