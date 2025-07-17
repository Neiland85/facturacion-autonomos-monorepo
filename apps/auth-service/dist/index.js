"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerUi = __importStar(require("swagger-ui-express"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = require("./routes/auth.routes");
const health_routes_1 = require("./routes/health.routes");
const user_routes_1 = require("./routes/user.routes");
const logger_1 = require("./utils/logger");
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth Service API',
            version: '1.0.0',
            description: 'Microservicio de autenticación y autorización para el sistema de facturación',
            contact: {
                name: 'API Support',
                email: 'support@facturacion.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Desarrollo'
            },
            {
                url: 'https://api.facturacion.com/auth',
                description: 'Producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
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
if (process.env.ENABLE_SWAGGER !== 'false') {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Auth Service API Documentation'
    }));
}
app.use('/health', health_routes_1.healthRoutes);
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/users', user_routes_1.userRoutes);
app.use('*', (req, res) => {
    logger_1.logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: {
            documentation: '/docs',
            health: '/health',
            auth: '/api/auth',
            users: '/api/users'
        }
    });
});
app.use(errorHandler_1.errorHandler);
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Auth Service running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        documentation: `http://localhost:${PORT}/docs`,
        timestamp: new Date().toISOString()
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map