"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
var express_1 = require("express");
var webhook_controller_1 = require("../controllers/webhook.controller");
var async_handler_middleware_1 = require("../middleware/async-handler.middleware");
var webhook_ip_whitelist_middleware_1 = require("../middleware/webhook-ip-whitelist.middleware");
var webhook_rate_limit_middleware_1 = require("../middleware/webhook-rate-limit.middleware");
var router = express_1.default.Router();
exports.webhookRoutes = router;
var webhookController = new webhook_controller_1.WebhookController();
// Middleware específico para webhooks
var webhookIPWhitelist = new webhook_ip_whitelist_middleware_1.WebhookIPWhitelistMiddleware();
var webhookRateLimit = new webhook_rate_limit_middleware_1.WebhookRateLimitMiddleware();
/**
 * POST /api/webhooks/aeat
 * Endpoint principal para recibir webhooks de AEAT
 */
router.post('/aeat', webhookIPWhitelist.checkIPWhitelist, webhookRateLimit.limitWebhookRequests, (0, async_handler_middleware_1.asyncHandler)(webhookController.receiveAeatWebhook));
/**
 * GET /api/webhooks/aeat/:webhookId/status
 * Obtener estado de un webhook específico
 */
router.get('/aeat/:webhookId/status', (0, async_handler_middleware_1.asyncHandler)(webhookController.getWebhookStatus));
/**
 * POST /api/webhooks/aeat/:webhookId/retry
 * Reintentar procesamiento de un webhook fallido
 */
router.post('/aeat/:webhookId/retry', (0, async_handler_middleware_1.asyncHandler)(webhookController.retryWebhook));
/**
 * GET /api/webhooks/aeat
 * Listar webhooks con paginación y filtros
 */
router.get('/aeat', (0, async_handler_middleware_1.asyncHandler)(webhookController.listWebhooks));
