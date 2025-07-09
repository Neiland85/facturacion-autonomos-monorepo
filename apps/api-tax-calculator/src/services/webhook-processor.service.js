"use strict";
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
exports.WebhookProcessorService = void 0;
var client_1 = require("@prisma/client");
var webhook_signature_service_1 = require("./webhook-signature.service");
var prisma = new client_1.PrismaClient();
/**
 * Servicio para procesar webhooks de AEAT y actualizar estados de presentaciones
 */
var WebhookProcessorService = /** @class */ (function () {
    function WebhookProcessorService() {
        this.signatureService = new webhook_signature_service_1.WebhookSignatureService();
    }
    /**
     * Procesa un webhook recibido de AEAT
     * @param payload - Payload del webhook
     * @param headers - Headers HTTP del webhook
     * @param ipOrigen - IP de origen del webhook
     * @returns ProcessingResult - Resultado d      return {
          webhooks: webhooks.map((webhook: any) => ({
            id: webhook.id,
            estado: webhook.estado,
            tipoNotificacion: webhook.tipoNotificacion,
            origen: webhook.origen,
            fechaRecepcion: webhook.fechaRecepcion,
            fechaProcesamiento: webhook.fechaProcesamiento,
            metodoVerificacion: webhook.metodoVerificacion,
            usuarioId: webhook.usuarioId,
            usuario: webhook.usuario,
            intentos: webhook.intentos,
            ultimoError: webhook.ultimoError
          })),
          total
        };
     */
    WebhookProcessorService.prototype.processWebhook = function (payload, headers, ipOrigen) {
        return __awaiter(this, void 0, void 0, function () {
            var result, verificationResult, parsedPayload, error_1, validationErrors, webhookNotificacion, processingSuccess, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        result = {
                            success: false,
                            webhookId: '',
                            message: '',
                            errors: [],
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 15, , 18]);
                        verificationResult = this.signatureService.verifyWebhookIntegrity(payload, headers);
                        if (!!verificationResult.isValid) return [3 /*break*/, 3];
                        result.errors.push("Firma inv\u00E1lida: ".concat(verificationResult.errors.join(', ')));
                        return [4 /*yield*/, this.saveFailedWebhook(payload, headers, ipOrigen, result.errors)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, result];
                    case 3:
                        parsedPayload = void 0;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 5, , 7]);
                        parsedPayload = JSON.parse(payload);
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _b.sent();
                        console.error('Error parsing JSON payload:', error_1);
                        result.errors.push('Payload JSON inválido');
                        return [4 /*yield*/, this.saveFailedWebhook(payload, headers, ipOrigen, result.errors)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, result];
                    case 7:
                        validationErrors = this.validatePayloadStructure(parsedPayload);
                        if (!(validationErrors.length > 0)) return [3 /*break*/, 9];
                        (_a = result.errors).push.apply(_a, validationErrors);
                        return [4 /*yield*/, this.saveFailedWebhook(payload, headers, ipOrigen, result.errors)];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, result];
                    case 9: return [4 /*yield*/, this.saveWebhookNotification(payload, headers, ipOrigen, parsedPayload, verificationResult.method)];
                    case 10:
                        webhookNotificacion = _b.sent();
                        result.webhookId = webhookNotificacion.id;
                        return [4 /*yield*/, this.processNotificationByType(parsedPayload, webhookNotificacion.id)];
                    case 11:
                        processingSuccess = _b.sent();
                        if (!processingSuccess) return [3 /*break*/, 13];
                        // Marcar webhook como procesado
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookNotificacion.id },
                                data: {
                                    estado: 'PROCESADO',
                                    fechaProcesamiento: new Date(),
                                },
                            })];
                    case 12:
                        // Marcar webhook como procesado
                        _b.sent();
                        result.success = true;
                        result.message = 'Webhook procesado correctamente';
                        return [3 /*break*/, 14];
                    case 13:
                        result.errors.push('Error procesando notificación');
                        _b.label = 14;
                    case 14: return [3 /*break*/, 18];
                    case 15:
                        error_2 = _b.sent();
                        console.error('Error procesando webhook:', error_2);
                        result.errors.push("Error interno: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                        if (!result.webhookId) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.markWebhookAsError(result.webhookId, result.errors.join('; '))];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17: return [3 /*break*/, 18];
                    case 18: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Valida la estructura del payload AEAT
     */
    WebhookProcessorService.prototype.validatePayloadStructure = function (payload) {
        var errors = [];
        if (!payload.tipo)
            errors.push('Campo "tipo" requerido');
        if (!payload.modelo)
            errors.push('Campo "modelo" requerido');
        if (!payload.ejercicio)
            errors.push('Campo "ejercicio" requerido');
        if (!payload.periodo)
            errors.push('Campo "periodo" requerido');
        if (!payload.referencia)
            errors.push('Campo "referencia" requerido');
        if (!payload.estado)
            errors.push('Campo "estado" requerido');
        if (!payload.fechaEvento)
            errors.push('Campo "fechaEvento" requerido');
        // Validar formato de referencia AEAT
        if (payload.referencia && !this.signatureService.validateAEATReference(payload.referencia)) {
            errors.push('Formato de referencia AEAT inválido');
        }
        // Validar CSV si está presente
        if (payload.csv && !this.signatureService.validateCSV(payload.csv)) {
            errors.push('Formato de CSV inválido');
        }
        return errors;
    };
    /**
     * Guarda la notificación webhook en base de datos
     */
    WebhookProcessorService.prototype.saveWebhookNotification = function (payload, headers, ipOrigen, parsedPayload, _verificationMethod) {
        return __awaiter(this, void 0, void 0, function () {
            var tipoNotificacion, origenWebhook;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tipoNotificacion = this.mapTipoNotificacion(parsedPayload.tipo);
                        origenWebhook = this.determineWebhookOrigin(headers);
                        return [4 /*yield*/, prisma.webhookNotificacion.create({
                                data: {
                                    origenWebhook: origenWebhook,
                                    tipoNotificacion: tipoNotificacion,
                                    numeroModelo: parsedPayload.modelo,
                                    payload: payload,
                                    firma: headers['x-aeat-signature'] || headers['x-signature'] || '',
                                    firmaValida: true,
                                    estado: 'PENDIENTE',
                                    userAgent: headers['user-agent'],
                                    ipOrigen: ipOrigen,
                                    referenciaAEAT: parsedPayload.referencia,
                                    csvNotificacion: parsedPayload.csv,
                                    fechaEvento: parsedPayload.fechaEvento ? new Date(parsedPayload.fechaEvento) : null,
                                },
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Procesa la notificación según su tipo
     */
    WebhookProcessorService.prototype.processNotificationByType = function (payload, webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            var presentacion, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 19, , 20]);
                        return [4 /*yield*/, prisma.presentacionModelo.findFirst({
                                where: {
                                    numeroModelo: payload.modelo,
                                    ejercicio: payload.ejercicio,
                                    periodo: payload.periodo,
                                    referenciaCompleta: payload.referencia,
                                },
                            })];
                    case 1:
                        presentacion = _b.sent();
                        if (!presentacion) {
                            console.warn("Presentaci\u00F3n no encontrada para: ".concat(payload.modelo, "/").concat(payload.ejercicio, "/").concat(payload.periodo));
                            return [2 /*return*/, false];
                        }
                        // Relacionar webhook con presentación
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookId },
                                data: { presentacionId: presentacion.id },
                            })];
                    case 2:
                        // Relacionar webhook con presentación
                        _b.sent();
                        _a = payload.tipo.toUpperCase();
                        switch (_a) {
                            case 'PRESENTACION_ACEPTADA': return [3 /*break*/, 3];
                            case 'PRESENTACION_RECHAZADA': return [3 /*break*/, 5];
                            case 'SUBSANACION_REQUERIDA': return [3 /*break*/, 7];
                            case 'LIQUIDACION_GENERADA': return [3 /*break*/, 9];
                            case 'DEVOLUCION_AUTORIZADA': return [3 /*break*/, 11];
                            case 'INGRESO_REALIZADO': return [3 /*break*/, 13];
                            case 'ACTUALIZACION_ESTADO': return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 17];
                    case 3: return [4 /*yield*/, this.processPresentacionAceptada(presentacion.id, payload)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.processPresentacionRechazada(presentacion.id, payload)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.processSubsanacionRequerida(presentacion.id, payload)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.processLiquidacionGenerada(presentacion.id, payload)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.processDevolucionAutorizada(presentacion.id, payload)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.processIngresoRealizado(presentacion.id, payload)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.processActualizacionEstado(presentacion.id, payload)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17:
                        console.warn("Tipo de notificaci\u00F3n no soportado: ".concat(payload.tipo));
                        return [2 /*return*/, false];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_3 = _b.sent();
                        console.error('Error procesando notificación:', error_3);
                        return [2 /*return*/, false];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Procesa notificación de presentación aceptada
     */
    WebhookProcessorService.prototype.processPresentacionAceptada = function (presentacionId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'ACEPTADO',
                                csv: payload.csv,
                                numeroJustificante: (_a = payload.datos) === null || _a === void 0 ? void 0 : _a.numeroJustificante,
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa notificación de presentación rechazada
     */
    WebhookProcessorService.prototype.processPresentacionRechazada = function (presentacionId, _payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'RECHAZADO',
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa notificación de subsanación requerida
     */
    WebhookProcessorService.prototype.processSubsanacionRequerida = function (presentacionId, _payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'SUBSANACION',
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa notificación de liquidación generada
     */
    WebhookProcessorService.prototype.processLiquidacionGenerada = function (presentacionId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'PROCESADO',
                                importeIngresar: (_a = payload.datos) === null || _a === void 0 ? void 0 : _a.importeIngresar,
                                importeDevolucion: (_b = payload.datos) === null || _b === void 0 ? void 0 : _b.importeDevolucion,
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa notificación de devolución autorizada
     */
    WebhookProcessorService.prototype.processDevolucionAutorizada = function (presentacionId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'PROCESADO',
                                importeDevolucion: (_a = payload.datos) === null || _a === void 0 ? void 0 : _a.importeDevolucion,
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa notificación de ingreso realizado
     */
    WebhookProcessorService.prototype.processIngresoRealizado = function (presentacionId, _payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.presentacionModelo.update({
                            where: { id: presentacionId },
                            data: {
                                estado: 'PROCESADO',
                                fechaActualizacion: new Date(),
                            },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Procesa actualización general de estado
     */
    WebhookProcessorService.prototype.processActualizacionEstado = function (presentacionId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var nuevoEstado;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nuevoEstado = this.mapEstadoAEAT(payload.estado);
                        return [4 /*yield*/, prisma.presentacionModelo.update({
                                where: { id: presentacionId },
                                data: {
                                    estado: nuevoEstado,
                                    fechaActualizacion: new Date(),
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Mapea tipos de notificación a enums de base de datos
     */
    WebhookProcessorService.prototype.mapTipoNotificacion = function (tipo) {
        var mapping = {
            PRESENTACION_ACEPTADA: 'PRESENTACION_ACEPTADA',
            PRESENTACION_RECHAZADA: 'PRESENTACION_RECHAZADA',
            SUBSANACION_REQUERIDA: 'SUBSANACION_REQUERIDA',
            LIQUIDACION_GENERADA: 'LIQUIDACION_GENERADA',
            DEVOLUCION_AUTORIZADA: 'DEVOLUCION_AUTORIZADA',
            INGRESO_REALIZADO: 'INGRESO_REALIZADO',
            ERROR_PROCESAMIENTO: 'ERROR_PROCESAMIENTO',
            ACTUALIZACION_ESTADO: 'ACTUALIZACION_ESTADO',
        };
        return mapping[tipo.toUpperCase()] || 'ACTUALIZACION_ESTADO';
    };
    /**
     * Mapea estados de AEAT a enums de base de datos
     */
    WebhookProcessorService.prototype.mapEstadoAEAT = function (estado) {
        var mapping = {
            ACEPTADO: 'ACEPTADO',
            RECHAZADO: 'RECHAZADO',
            PROCESADO: 'PROCESADO',
            SUBSANACION: 'SUBSANACION',
            ERROR: 'ERROR_TECNICO',
        };
        return mapping[estado.toUpperCase()] || 'PRESENTADO';
    };
    /**
     * Determina el origen del webhook basado en headers
     */
    WebhookProcessorService.prototype.determineWebhookOrigin = function (headers) {
        var _a;
        var userAgent = ((_a = headers['user-agent']) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        if (userAgent.includes('aeat-sandbox')) {
            return 'AEAT_SANDBOX';
        }
        else if (userAgent.includes('aeat')) {
            return 'AEAT_PRODUCCION';
        }
        else {
            return 'SISTEMA_INTERNO';
        }
    };
    /**
     * Guarda un webhook fallido
     */
    WebhookProcessorService.prototype.saveFailedWebhook = function (payload, headers, ipOrigen, errors) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.webhookNotificacion.create({
                                data: {
                                    origenWebhook: this.determineWebhookOrigin(headers),
                                    tipoNotificacion: 'ERROR_PROCESAMIENTO',
                                    payload: payload,
                                    firma: headers['x-aeat-signature'] || headers['x-signature'] || '',
                                    firmaValida: false,
                                    estado: 'ERROR',
                                    mensajeError: errors.join('; '),
                                    userAgent: headers['user-agent'],
                                    ipOrigen: ipOrigen,
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error guardando webhook fallido:', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Marca un webhook como error
     */
    WebhookProcessorService.prototype.markWebhookAsError = function (webhookId, errorMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookId },
                                data: {
                                    estado: 'ERROR',
                                    mensajeError: errorMessage,
                                    fechaProcesamiento: new Date(),
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error marcando webhook como error:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reintenta procesar webhooks fallidos
     */
    WebhookProcessorService.prototype.retryFailedWebhooks = function () {
        return __awaiter(this, arguments, void 0, function (maxRetries) {
            var processedCount, failedWebhooks, _i, failedWebhooks_1, webhook, parsedPayload, success, error_6, error_7;
            if (maxRetries === void 0) { maxRetries = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        processedCount = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 15, , 16]);
                        return [4 /*yield*/, prisma.webhookNotificacion.findMany({
                                where: {
                                    estado: 'ERROR',
                                    intentosProceso: { lt: maxRetries },
                                },
                                orderBy: { fechaRecepcion: 'asc' },
                                take: 10, // Procesar máximo 10 a la vez
                            })];
                    case 2:
                        failedWebhooks = _a.sent();
                        _i = 0, failedWebhooks_1 = failedWebhooks;
                        _a.label = 3;
                    case 3:
                        if (!(_i < failedWebhooks_1.length)) return [3 /*break*/, 14];
                        webhook = failedWebhooks_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 11, , 13]);
                        // Incrementar contador de intentos
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhook.id },
                                data: {
                                    intentosProceso: webhook.intentosProceso + 1,
                                    estado: 'REINTENTO',
                                },
                            })];
                    case 5:
                        // Incrementar contador de intentos
                        _a.sent();
                        parsedPayload = JSON.parse(webhook.payload);
                        return [4 /*yield*/, this.processNotificationByType(parsedPayload, webhook.id)];
                    case 6:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 8];
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhook.id },
                                data: {
                                    estado: 'PROCESADO',
                                    fechaProcesamiento: new Date(),
                                },
                            })];
                    case 7:
                        _a.sent();
                        processedCount++;
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, prisma.webhookNotificacion.update({
                            where: { id: webhook.id },
                            data: { estado: 'ERROR' },
                        })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        error_6 = _a.sent();
                        console.error("Error reintentando webhook ".concat(webhook.id, ":"), error_6);
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhook.id },
                                data: { estado: 'ERROR' },
                            })];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 13:
                        _i++;
                        return [3 /*break*/, 3];
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_7 = _a.sent();
                        console.error('Error en reintento de webhooks:', error_7);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, processedCount];
                }
            });
        });
    };
    /**
     * Obtiene el estado de un webhook
     * @param webhookId - ID del webhook
     * @returns WebhookStatus o null si no se encuentra
     */
    WebhookProcessorService.prototype.getWebhookStatus = function (webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            var webhook, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.webhookNotificacion.findUnique({
                                where: { id: webhookId },
                                include: {
                                    usuario: {
                                        select: {
                                            id: true,
                                            email: true,
                                        },
                                    },
                                },
                            })];
                    case 1:
                        webhook = _a.sent();
                        if (!webhook) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                id: webhook.id,
                                estado: webhook.estado,
                                tipoNotificacion: webhook.tipoNotificacion,
                                origen: webhook.origen,
                                fechaRecepcion: webhook.fechaRecepcion,
                                fechaProcesamiento: webhook.fechaProcesamiento,
                                metodoVerificacion: webhook.metodoVerificacion,
                                usuarioId: webhook.usuarioId,
                                usuario: webhook.usuario,
                                intentos: webhook.intentos,
                                ultimoError: webhook.ultimoError,
                            }];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error obteniendo estado del webhook:', error_8);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reintenta procesar un webhook específico
     * @param webhookId - ID del webhook a reintentar
     * @returns Resultado del reintento
     */
    WebhookProcessorService.prototype.retryWebhook = function (webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, webhook, parsedPayload, success, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = {
                            success: false,
                            webhookId: webhookId,
                            message: '',
                            errors: [],
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 11]);
                        return [4 /*yield*/, prisma.webhookNotificacion.findUnique({
                                where: { id: webhookId },
                            })];
                    case 2:
                        webhook = _a.sent();
                        if (!webhook) {
                            result.errors.push('Webhook no encontrado');
                            return [2 /*return*/, result];
                        }
                        if (webhook.estado === 'PROCESADO') {
                            result.errors.push('Webhook ya fue procesado correctamente');
                            return [2 /*return*/, result];
                        }
                        // Incrementar contador de intentos
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookId },
                                data: { intentos: { increment: 1 } },
                            })];
                    case 3:
                        // Incrementar contador de intentos
                        _a.sent();
                        parsedPayload = JSON.parse(webhook.payload);
                        return [4 /*yield*/, this.processNotificationByType(parsedPayload, webhookId)];
                    case 4:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 6];
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookId },
                                data: {
                                    estado: 'PROCESADO',
                                    fechaProcesamiento: new Date(),
                                    ultimoError: null,
                                },
                            })];
                    case 5:
                        _a.sent();
                        result.success = true;
                        result.message = 'Webhook reintentado correctamente';
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, prisma.webhookNotificacion.update({
                            where: { id: webhookId },
                            data: { estado: 'ERROR' },
                        })];
                    case 7:
                        _a.sent();
                        result.errors.push('Error procesando webhook en el reintento');
                        _a.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        error_9 = _a.sent();
                        console.error("Error reintentando webhook ".concat(webhookId, ":"), error_9);
                        result.errors.push("Error interno: ".concat(error_9 instanceof Error ? error_9.message : 'Unknown error'));
                        return [4 /*yield*/, prisma.webhookNotificacion.update({
                                where: { id: webhookId },
                                data: {
                                    estado: 'ERROR',
                                    ultimoError: error_9 instanceof Error ? error_9.message : 'Unknown error',
                                },
                            })];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Lista webhooks con paginación y filtros
     * @param options - Opciones de paginación y filtros
     * @returns Lista de webhooks con total
     */
    WebhookProcessorService.prototype.listWebhooks = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, estado, fechaDesde, fechaHasta, skip, where, _c, webhooks, total, error_10;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.limit, limit = _b === void 0 ? 10 : _b, estado = options.estado, fechaDesde = options.fechaDesde, fechaHasta = options.fechaHasta;
                        skip = (page - 1) * limit;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        where = {};
                        if (estado) {
                            where.estado = estado;
                        }
                        if (fechaDesde || fechaHasta) {
                            where.fechaRecepcion = {};
                            if (fechaDesde) {
                                where.fechaRecepcion.gte = fechaDesde;
                            }
                            if (fechaHasta) {
                                where.fechaRecepcion.lte = fechaHasta;
                            }
                        }
                        return [4 /*yield*/, Promise.all([
                                prisma.webhookNotificacion.findMany({
                                    where: where,
                                    skip: skip,
                                    take: limit,
                                    orderBy: { fechaRecepcion: 'desc' },
                                    include: {
                                        usuario: {
                                            select: {
                                                id: true,
                                                email: true,
                                            },
                                        },
                                    },
                                }),
                                prisma.webhookNotificacion.count({ where: where }),
                            ])];
                    case 2:
                        _c = _d.sent(), webhooks = _c[0], total = _c[1];
                        return [2 /*return*/, {
                                webhooks: webhooks.map(function (webhook) { return ({
                                    id: webhook.id,
                                    estado: webhook.estado,
                                    tipoNotificacion: webhook.tipoNotificacion,
                                    origen: webhook.origen,
                                    fechaRecepcion: webhook.fechaRecepcion,
                                    fechaProcesamiento: webhook.fechaProcesamiento,
                                    metodoVerificacion: webhook.metodoVerificacion,
                                    usuarioId: webhook.usuarioId,
                                    usuario: webhook.usuario,
                                    intentos: webhook.intentos,
                                    ultimoError: webhook.ultimoError,
                                }); }),
                                total: total,
                            }];
                    case 3:
                        error_10 = _d.sent();
                        console.error('Error listando webhooks:', error_10);
                        return [2 /*return*/, {
                                webhooks: [],
                                total: 0,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return WebhookProcessorService;
}());
exports.WebhookProcessorService = WebhookProcessorService;
exports.default = WebhookProcessorService;
