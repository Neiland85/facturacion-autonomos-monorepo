import express from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { WebhookIPWhitelistMiddleware } from '../middleware/webhook-ip-whitelist.middleware';
import { WebhookRateLimitMiddleware } from '../middleware/webhook-rate-limit.middleware';

const router = express.Router();
const webhookController = new WebhookController();

// Middleware específico para webhooks
const webhookIPWhitelist = new WebhookIPWhitelistMiddleware();
const webhookRateLimit = new WebhookRateLimitMiddleware();

/**
 * POST /api/webhooks/aeat
 * Endpoint principal para recibir webhooks de AEAT
 */
router.post(
  '/aeat',
  webhookIPWhitelist.checkIPWhitelist,
  webhookRateLimit.limitWebhookRequests,
  asyncHandler(webhookController.receiveAeatWebhook)
);

/**
 * GET /api/webhooks/aeat/:webhookId/status
 * Obtener estado de un webhook específico
 */
router.get(
  '/aeat/:webhookId/status',
  asyncHandler(webhookController.getWebhookStatus)
);

/**
 * POST /api/webhooks/aeat/:webhookId/retry
 * Reintentar procesamiento de un webhook fallido
 */
router.post(
  '/aeat/:webhookId/retry',
  asyncHandler(webhookController.retryWebhook)
);

/**
 * GET /api/webhooks/aeat
 * Listar webhooks con paginación y filtros
 */
router.get('/aeat', asyncHandler(webhookController.listWebhooks));

export { router as webhookRoutes };
