"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookIPWhitelistMiddleware = void 0;
/**
 * Middleware para verificar lista blanca de IPs para webhooks de AEAT
 */
var WebhookIPWhitelistMiddleware = /** @class */ (function () {
    function WebhookIPWhitelistMiddleware() {
        var _this = this;
        /**
         * Middleware para verificar IP en lista blanca
         */
        this.checkIPWhitelist = function (req, res, next) {
            var clientIP = _this.getClientIP(req);
            // En desarrollo, permitir localhost
            if (process.env.NODE_ENV === 'development' && _this.isLocalhost(clientIP)) {
                console.log("[WEBHOOK] IP permitida en desarrollo: ".concat(clientIP));
                return next();
            }
            // Verificar IP en lista blanca
            if (_this.isIPAllowed(clientIP)) {
                console.log("[WEBHOOK] IP permitida: ".concat(clientIP));
                return next();
            }
            console.warn("[WEBHOOK] IP bloqueada: ".concat(clientIP));
            res.status(403).json({
                status: 'error',
                message: 'IP no autorizada para webhooks',
                ip: clientIP,
            });
        };
        // IPs permitidas para webhooks de AEAT (configurables por entorno)
        this.allowedIPs = this.getAllowedIPs();
    }
    /**
     * Obtiene IPs permitidas desde configuración
     */
    WebhookIPWhitelistMiddleware.prototype.getAllowedIPs = function () {
        var _a;
        var allowedIPs = ((_a = process.env.WEBHOOK_ALLOWED_IPS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
        // IPs conocidas de AEAT (sandbox y producción)
        var aeatIPs = [
            '193.146.16.0/20', // Rango AEAT sandbox
            '193.146.32.0/19', // Rango AEAT producción
            '127.0.0.1', // Localhost para desarrollo
            '::1', // IPv6 localhost
        ];
        return __spreadArray(__spreadArray([], allowedIPs, true), aeatIPs, true);
    };
    /**
     * Obtiene la IP real del cliente
     */
    WebhookIPWhitelistMiddleware.prototype.getClientIP = function (req) {
        var _a;
        var forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return ((_a = forwarded.split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || 'unknown';
        }
        return req.socket.remoteAddress || 'unknown';
    };
    /**
     * Verifica si la IP está permitida
     */
    WebhookIPWhitelistMiddleware.prototype.isIPAllowed = function (ip) {
        var _this = this;
        return this.allowedIPs.some(function (allowedIP) {
            // Verificación exacta
            if (allowedIP === ip)
                return true;
            // Verificación de rango CIDR (simplificada)
            if (allowedIP.includes('/')) {
                return _this.isIPInRange(ip, allowedIP);
            }
            return false;
        });
    };
    /**
     * Verifica si es localhost
     */
    WebhookIPWhitelistMiddleware.prototype.isLocalhost = function (ip) {
        return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    };
    /**
     * Verifica si IP está en rango CIDR (implementación básica)
     */
    WebhookIPWhitelistMiddleware.prototype.isIPInRange = function (ip, range) {
        try {
            var _a = range.split('/'), rangeIP = _a[0], cidr = _a[1];
            if (!rangeIP || !cidr)
                return false;
            var cidrNum = parseInt(cidr);
            // Conversión básica para IPv4
            var ipToNum = function (ip) {
                return ip.split('.').reduce(function (acc, octet) { return (acc << 8) + parseInt(octet); }, 0);
            };
            var mask = ~(0xffffffff >>> cidrNum);
            var ipNum = ipToNum(ip);
            var rangeNum = ipToNum(rangeIP);
            return (ipNum & mask) === (rangeNum & mask);
        }
        catch (error) {
            console.error('Error verificando rango IP:', error);
            return false;
        }
    };
    return WebhookIPWhitelistMiddleware;
}());
exports.WebhookIPWhitelistMiddleware = WebhookIPWhitelistMiddleware;
