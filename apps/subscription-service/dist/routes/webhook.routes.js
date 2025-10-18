"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_controller_1 = require("../controllers/webhook.controller");
const router = (0, express_1.Router)();
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
router.post('/stripe', webhook_controller_1.WebhookController.handleStripeWebhook);
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
router.post('/aeat', webhook_controller_1.WebhookController.handleAEATWebhook);
exports.default = router;
