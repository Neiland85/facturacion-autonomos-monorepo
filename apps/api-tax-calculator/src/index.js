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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = require("cors");
require("dotenv/config");
var express_1 = require("express");
var express_rate_limit_1 = require("express-rate-limit");
var helmet_1 = require("helmet");
var cron_manager_1 = require("./cron/cron-manager");
var error_middleware_1 = require("./middleware/error.middleware");
var logger_middleware_1 = require("./middleware/logger.middleware");
var configuracion_fiscal_routes_1 = require("./routes/configuracion-fiscal.routes");
var quarter_closure_routes_1 = require("./routes/quarter-closure.routes");
var tax_routes_1 = require("./routes/tax.routes");
var webhook_routes_1 = require("./routes/webhook.routes");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3002;
// Inicializar cron jobs
var cronManager = new cron_manager_1.CronJobManager();
// Middleware de seguridad
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'],
    credentials: true,
}));
// Rate limiting
var limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
        error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
    },
});
app.use(limiter);
// Middleware general
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.requestLogger);
// Health check
app.get('/health', function (_req, res) {
    res.json({
        status: 'ok',
        service: 'tax-calculator',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
    });
});
// Rutas
app.use('/api/tax', tax_routes_1.taxRoutes);
app.use('/api/quarter-closure', quarter_closure_routes_1.quarterClosureRoutes);
app.use('/api/configuracion-fiscal', configuracion_fiscal_routes_1.configuracionFiscalRoutes);
app.use('/api/webhooks', webhook_routes_1.webhookRoutes);
// 404 handler
app.use('*', function (req, res) {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method,
    });
});
// Error handler
app.use(error_middleware_1.errorHandler);
// Iniciar servidor
var server = app.listen(PORT, function () {
    console.log("Tax Calculator API corriendo en puerto ".concat(PORT));
    console.log("Entorno: ".concat(process.env.NODE_ENV || 'development'));
    // Iniciar cron jobs
    cronManager.startCronJobs();
});
// Manejo de señales de cierre
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Señal SIGTERM recibida, cerrando servidor...');
                // Detener cron jobs
                return [4 /*yield*/, cronManager.shutdown()];
            case 1:
                // Detener cron jobs
                _a.sent();
                // Cerrar servidor
                server.close(function () {
                    console.log('Servidor cerrado correctamente');
                    process.exit(0);
                });
                return [2 /*return*/];
        }
    });
}); });
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Señal SIGINT recibida, cerrando servidor...');
                // Detener cron jobs
                return [4 /*yield*/, cronManager.shutdown()];
            case 1:
                // Detener cron jobs
                _a.sent();
                // Cerrar servidor
                server.close(function () {
                    console.log('Servidor cerrado correctamente');
                    process.exit(0);
                });
                return [2 /*return*/];
        }
    });
}); });
