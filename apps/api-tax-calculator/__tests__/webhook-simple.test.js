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
var express_1 = require("express");
var supertest_1 = require("supertest");
var webhook_routes_1 = require("../src/routes/webhook.routes");
// Mock del servicio webhook processor
jest.mock('../src/services/webhook-processor.service', function () { return ({
    WebhookProcessorService: jest.fn().mockImplementation(function () { return ({
        processWebhook: jest.fn().mockResolvedValue({
            success: true,
            webhookId: 'webhook-123',
            message: 'Webhook procesado correctamente',
            errors: [],
        }),
        getWebhookStatus: jest.fn().mockResolvedValue(null),
        retryWebhook: jest.fn().mockResolvedValue({
            success: false,
            webhookId: 'webhook-123',
            message: 'Webhook ya fue procesado correctamente',
            errors: ['Webhook ya fue procesado correctamente'],
        }),
        listWebhooks: jest.fn().mockResolvedValue({
            webhooks: [],
            total: 0,
        }),
    }); }),
}); });
// Mock de los middlewares
jest.mock('../src/middleware/webhook-ip-whitelist.middleware', function () { return ({
    WebhookIPWhitelistMiddleware: jest.fn().mockImplementation(function () { return ({
        checkIPWhitelist: jest.fn(function (req, res, next) { return next(); }),
    }); }),
}); });
jest.mock('../src/middleware/webhook-rate-limit.middleware', function () { return ({
    WebhookRateLimitMiddleware: jest.fn().mockImplementation(function () { return ({
        limitWebhookRequests: jest.fn(function (req, res, next) { return next(); }),
    }); }),
}); });
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/webhooks', webhook_routes_1.webhookRoutes);
describe('Webhook Routes', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('POST /api/webhooks/aeat', function () {
        it('debería aceptar un webhook con datos válidos', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPayload, mockHeaders, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPayload = {
                            modeloId: 'test-modelo-123',
                            estado: 'ACEPTADO',
                            timestamp: '2024-01-01T00:00:00Z',
                            numeroJustificante: 'J123456789',
                            observaciones: 'Presentación aceptada correctamente',
                        };
                        mockHeaders = {
                            'x-aeat-signature': 'valid-signature',
                            'x-aeat-timestamp': '1640995200',
                            'content-type': 'application/json',
                        };
                        return [4 /*yield*/, (0, supertest_1.default)(app)
                                .post('/api/webhooks/aeat')
                                .set(mockHeaders)
                                .send(mockPayload)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.body.status).toBe('success');
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería retornar success para webhook', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPayload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPayload = {
                            modeloId: 'test-modelo-123',
                            estado: 'ACEPTADO',
                        };
                        return [4 /*yield*/, (0, supertest_1.default)(app).post('/api/webhooks/aeat').send(mockPayload)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.body.status).toBe('success');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /api/webhooks/aeat/:webhookId/status', function () {
        it('debería aceptar solicitudes de estado con UUID válido', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validUUID, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validUUID = '550e8400-e29b-41d4-a716-446655440000';
                        return [4 /*yield*/, (0, supertest_1.default)(app).get("/api/webhooks/aeat/".concat(validUUID, "/status"))];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(404); // Mock devuelve null
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería rechazar solicitudes con UUID inválido', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidUUID, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidUUID = 'invalid-uuid';
                        return [4 /*yield*/, (0, supertest_1.default)(app).get("/api/webhooks/aeat/".concat(invalidUUID, "/status"))];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        expect(response.body.status).toBe('error');
                        expect(response.body.message).toBe('ID de webhook inválido');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/webhooks/aeat/:webhookId/retry', function () {
        it('debería aceptar solicitudes de reintento con UUID válido', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validUUID, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validUUID = '550e8400-e29b-41d4-a716-446655440000';
                        return [4 /*yield*/, (0, supertest_1.default)(app).post("/api/webhooks/aeat/".concat(validUUID, "/retry"))];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400); // Mock devuelve error
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería rechazar solicitudes de reintento con UUID inválido', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidUUID, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidUUID = 'invalid-uuid';
                        return [4 /*yield*/, (0, supertest_1.default)(app).post("/api/webhooks/aeat/".concat(invalidUUID, "/retry"))];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        expect(response.body.status).toBe('error');
                        expect(response.body.message).toBe('ID de webhook inválido');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /api/webhooks/aeat', function () {
        it('debería listar webhooks con parámetros por defecto', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app).get('/api/webhooks/aeat')];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.body.status).toBe('success');
                        expect(response.body.pagination).toBeDefined();
                        expect(response.body.pagination.page).toBe(1);
                        expect(response.body.pagination.limit).toBe(10);
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería aceptar parámetros de paginación válidos', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                            .get('/api/webhooks/aeat')
                            .query({ page: '2', limit: '20' })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.body.status).toBe('success');
                        expect(response.body.pagination.page).toBe(2);
                        expect(response.body.pagination.limit).toBe(20);
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería aceptar filtros de estado válidos', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app).get('/api/webhooks/aeat').query({ estado: 'PROCESADO' })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(response.body.status).toBe('success');
                        return [2 /*return*/];
                }
            });
        }); });
        it('debería rechazar filtros de estado inválidos', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                            .get('/api/webhooks/aeat')
                            .query({ estado: 'INVALID_STATUS' })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        expect(response.body.status).toBe('error');
                        expect(response.body.message).toBe('Parámetros de consulta inválidos');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
