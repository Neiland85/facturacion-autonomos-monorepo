import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/webhooks/stripe:
 *   post:
 *     summary: Webhook de Stripe
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 */
router.post('/stripe', WebhookController.handleStripeWebhook);

/**
 * @swagger
 * /api/v1/webhooks/aeat:
 *   post:
 *     summary: Webhook de AEAT
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 */
router.post('/aeat', WebhookController.handleAEATWebhook);

export default router;
