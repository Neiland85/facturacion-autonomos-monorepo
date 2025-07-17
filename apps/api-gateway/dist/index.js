"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_prometheus_middleware_1 = __importDefault(require("express-prometheus-middleware"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("./config");
const error_middleware_1 = require("./middleware/error.middleware");
const health_middleware_1 = require("./middleware/health.middleware");
const logging_middleware_1 = require("./middleware/logging.middleware");
const routes_1 = require("./routes");
const circuit_breaker_service_1 = require("./services/circuit-breaker.service");
const service_registry_service_1 = require("./services/service-registry.service");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = config_1.config.port || 4000;
const serviceRegistry = new service_registry_service_1.ServiceRegistry();
const circuitBreaker = new circuit_breaker_service_1.CircuitBreakerManager();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: config_1.config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: config_1.config.rateLimit.max,
    message: {
        error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, express_prometheus_middleware_1.default)({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logging_middleware_1.requestLogger);
app.use('/health', health_middleware_1.healthCheck);
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Facturación Autónomos - API Gateway',
            version: '1.0.0',
            description: 'Gateway centralizado para todos los microservicios del sistema de facturación',
            contact: {
                name: 'API Support',
                email: 'api-support@facturacion-autonomos.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Desarrollo'
            },
            {
                url: 'https://api-staging.facturacion-autonomos.com',
                description: 'Staging'
            },
            {
                url: 'https://api.facturacion-autonomos.com',
                description: 'Producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Facturación Autónomos API'
}));
(0, routes_1.setupRoutes)(app, serviceRegistry, circuitBreaker);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        available_endpoints: '/docs'
    });
});
app.use(error_middleware_1.errorHandler);
const server = app.listen(PORT, () => {
    logger_1.logger.info(`🚀 API Gateway ejecutándose en puerto ${PORT}`);
    logger_1.logger.info(`📚 Documentación disponible en http://localhost:${PORT}/docs`);
    logger_1.logger.info(`📊 Métricas disponibles en http://localhost:${PORT}/metrics`);
    logger_1.logger.info(`❤️ Health check en http://localhost:${PORT}/health`);
    serviceRegistry.registerAllServices();
});
process.on('SIGTERM', () => {
    logger_1.logger.info('Señal SIGTERM recibida, cerrando servidor...');
    server.close(() => {
        logger_1.logger.info('Servidor cerrado correctamente');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('Señal SIGINT recibida, cerrando servidor...');
    server.close(() => {
        logger_1.logger.info('Servidor cerrado correctamente');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map