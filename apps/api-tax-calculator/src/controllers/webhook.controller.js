"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
var zod_1 = require("zod");
var webhook_processor_service_1 = require("../services/webhook-processor.service");
/**
 * Controlador para manejar webhooks de AEAT
 */
var WebhookController = /** @class */ (function () {
    function WebhookController() {
        var _this = this;
        /**
         * Endpoint para recibir webhooks de AEAT
         * POST /api/webhooks/aeat
         */
        this.receiveAeatWebhook = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var rawPayload, headers_1, ipOrigen, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        rawPayload = JSON.stringify(req.body);
                        headers_1 = {};
                        Object.keys(req.headers).forEach(function (key) {
                            var value = req.headers[key];
                            if (typeof value === 'string') {
                                headers_1[key] = value;
                            }
                            else if (Array.isArray(value)) {
                                headers_1[key] = value.join(', ');
                            }
                        });
                        ipOrigen = this.getClientIp(req);
                        console.log('Recibiendo webhook AEAT:', {
                            ip: ipOrigen,
                            headers: this.filterSensitiveHeaders(headers_1),
                            payloadSize: rawPayload.length,
                        });
                        return [4 /*yield*/, this.webhookProcessor.processWebhook(rawPayload, headers_1, ipOrigen)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                status: 'success',
                                message: result.message,
                                webhookId: result.webhookId,
                            });
                        }
                        else {
                            console.error('Error procesando webhook AEAT:', result.errors);
                            res.status(400).json({
                                status: 'error',
                                message: 'Error procesando webhook',
                                errors: result.errors,
                                webhookId: result.webhookId,
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error en webhook endpoint:', error_1);
                        res.status(500).json({
                            status: 'error',
                            message: 'Error interno del servidor',
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Endpoint para verificar el estado de un webhook
         * GET /api/webhooks/aeat/:webhookId/status
         */
        this.getWebhookStatus = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var webhookIdSchema, webhookId, status_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        webhookIdSchema = zod_1.z.string().uuid();
                        webhookId = webhookIdSchema.parse(req.params.webhookId);
                        return [4 /*yield*/, this.webhookProcessor.getWebhookStatus(webhookId)];
                    case 1:
                        status_1 = _a.sent();
                        if (!status_1) {
                            res.status(404).json({
                                status: 'error',
                                message: 'Webhook no encontrado',
                            });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            status: 'success',
                            data: status_1,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof zod_1.z.ZodError) {
                            res.status(400).json({
                                status: 'error',
                                message: 'ID de webhook inválido',
                                errors: error_2.errors,
                            });
                            return [2 /*return*/];
                        }
                        console.error('Error obteniendo estado del webhook:', error_2);
                        res.status(500).json({
                            status: 'error',
                            message: 'Error interno del servidor',
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Endpoint para reenviar un webhook fallido
         * POST /api/webhooks/aeat/:webhookId/retry
         */
        this.retryWebhook = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var webhookIdSchema, webhookId, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        webhookIdSchema = zod_1.z.string().uuid();
                        webhookId = webhookIdSchema.parse(req.params.webhookId);
                        return [4 /*yield*/, this.webhookProcessor.retryWebhook(webhookId)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                status: 'success',
                                message: result.message,
                            });
                        }
                        else {
                            res.status(400).json({
                                status: 'error',
                                message: result.message,
                                errors: result.errors,
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof zod_1.z.ZodError) {
                            res.status(400).json({
                                status: 'error',
                                message: 'ID de webhook inválido',
                                errors: error_3.errors,
                            });
                            return [2 /*return*/];
                        }
                        console.error('Error reintentando webhook:', error_3);
                        res.status(500).json({
                            status: 'error',
                            message: 'Error interno del servidor',
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Endpoint para listar webhooks (con paginación)
         * GET /api/webhooks/aeat
         */
        this.listWebhooks = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var querySchema, query, page, limit, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        querySchema = zod_1.z.object({
                            page: zod_1.z.string().optional().default('1'),
                            limit: zod_1.z.string().optional().default('10'),
                            estado: zod_1.z.enum(['PENDIENTE', 'PROCESADO', 'ERROR']).optional(),
                            fechaDesde: zod_1.z.string().optional(),
                            fechaHasta: zod_1.z.string().optional(),
                        });
                        query = querySchema.parse(req.query);
                        page = parseInt(query.page);
                        limit = parseInt(query.limit);
                        return [4 /*yield*/, this.webhookProcessor.listWebhooks({
                                page: page,
                                limit: limit,
                                estado: query.estado,
                                fechaDesde: query.fechaDesde ? new Date(query.fechaDesde) : undefined,
                                fechaHasta: query.fechaHasta ? new Date(query.fechaHasta) : undefined,
                            })];
                    case 1:
                        result = _a.sent();
                        res.status(200).json({
                            status: 'success',
                            data: result.webhooks,
                            pagination: {
                                page: page,
                                limit: limit,
                                total: result.total,
                                pages: Math.ceil(result.total / limit),
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        if (error_4 instanceof zod_1.z.ZodError) {
                            res.status(400).json({
                                status: 'error',
                                message: 'Parámetros de consulta inválidos',
                                errors: error_4.errors,
                            });
                            return [2 /*return*/];
                        }
                        console.error('Error listando webhooks:', error_4);
                        res.status(500).json({
                            status: 'error',
                            message: 'Error interno del servidor',
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.webhookProcessor = new webhook_processor_service_1.WebhookProcessorService();
    }
    /**
     * Obtiene la IP real del cliente
     */
    WebhookController.prototype.getClientIp = function (req) {
        var _a;
        var forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return ((_a = forwarded.split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim()) || 'unknown';
        }
        return req.socket.remoteAddress || 'unknown';
    };
    /**
     * Filtra headers sensibles para logging
     */
    WebhookController.prototype.filterSensitiveHeaders = function (headers) {
        var filtered = __assign({}, headers);
        // Ocultar headers sensibles
        var sensitiveHeaders = ['authorization', 'x-aeat-signature', 'x-aeat-hmac'];
        sensitiveHeaders.forEach(function (header) {
            if (filtered[header]) {
                filtered[header] = '***';
            }
        });
        return filtered;
    };
    return WebhookController;
}());
exports.WebhookController = WebhookController;
