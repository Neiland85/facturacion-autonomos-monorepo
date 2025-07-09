"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRateLimitMiddleware = void 0;
var express_rate_limit_1 = require("express-rate-limit");
/**
 * Middleware para limitar rate de webhooks
 */
var WebhookRateLimitMiddleware = /** @class */ (function () {
    function WebhookRateLimitMiddleware() {
        var _this = this;
        /**
         * Middleware para aplicar rate limit a webhooks
         */
        this.limitWebhookRequests = function (req, res, next) {
            _this.rateLimiter(req, res, next);
        };
        // Configurar rate limit específico para webhooks
        this.rateLimiter = (0, express_rate_limit_1.default)({
            windowMs: 1 * 60 * 1000, // 1 minuto
            max: 100, // máximo 100 webhooks por minuto por IP
            message: {
                status: 'error',
                message: 'Demasiados webhooks recibidos, inténtalo más tarde',
                retryAfter: 60,
            },
            standardHeaders: true,
            legacyHeaders: false,
            // Usar IP real del cliente
            keyGenerator: function (req) {
                return _this.getClientIP(req);
            },
            // Configuración específica para webhooks
            skip: function (_req) {
                // Saltar rate limit en desarrollo
                if (process.env.NODE_ENV === 'development') {
                    return true;
                }
                return false;
            },
        });
    }
    /**
     * Obtiene la IP real del cliente
     */
    WebhookRateLimitMiddleware.prototype.getClientIP = function (req) {
        var _a;
        var forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return ((_a = forwarded.split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || 'unknown';
        }
        return req.socket.remoteAddress || 'unknown';
    };
    return WebhookRateLimitMiddleware;
}());
exports.WebhookRateLimitMiddleware = WebhookRateLimitMiddleware;
