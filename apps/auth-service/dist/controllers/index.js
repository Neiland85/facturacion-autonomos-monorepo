"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const compression_1 = __importDefault(require("compression"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const ioredis_1 = __importDefault(require("ioredis"));
const morgan_1 = __importDefault(require("morgan"));
const path = require('path');
// Configurar documentación API
const { setupSwagger } = require(path.join(__dirname, '../../../config/auth-service-swagger'));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_middleware_1 = require("./middleware/logger.middleware");
const auth_routes_1 = require("./routes/auth.routes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
// Configuración de Redis para sesiones
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
});
exports.redis = redis;
// Store de sesiones Redis
const redisStore = new connect_redis_1.default({
    client: redis,
    prefix: 'facturacion_sess:',
});
// Middleware de seguridad
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'https://localhost:3000',
        ];
        // Permitir requests sin origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Importante para cookies
    optionsSuccessStatus: 200,
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cookie_parser_1.default)());
// Configuración de sesiones EXPRESS-SESSION con configuración segura
app.use((0, express_session_1.default)({
    store: redisStore,
    secret: process.env.SESSION_SECRET ||
        'your-super-secret-session-key-change-in-production',
    name: 'sessionId', // Nombre personalizado para ocultar express
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renovar expiración en cada request
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS en producción
        httpOnly: true, // No accesible desde JavaScript
        maxAge: 30 * 60 * 1000, // 30 minutos
        sameSite: 'strict', // Protección CSRF
        domain: process.env.COOKIE_DOMAIN, // Configurar según dominio
    },
    genid: () => {
        // Generar ID de sesión más seguro
        return crypto_1.default.randomBytes(32).toString('hex');
    },
}));
// Rate limiting específico para auth
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP para rutas de auth
    message: {
        error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
        code: 'TOO_MANY_AUTH_ATTEMPTS',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
});
// Rate limiting general
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
    },
});
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);
// Middleware para parsing JSON
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Middleware de logging personalizado
app.use(logger_middleware_1.requestLogger);
// Configurar documentación API
setupSwagger(app);
// Middleware para regenerar session ID tras login exitoso
app.use((req, res, next) => {
    if (req.path.includes('/login') && req.method === 'POST') {
        // Guardar datos antes de regenerar
        const sessionData = req.session;
        req.session.regenerate((err) => {
            if (err) {
                console.error('Error regenerating session:', err);
                return next(err);
            }
            // Restaurar datos importantes (evita session fixation)
            Object.assign(req.session, sessionData);
            next();
        });
    }
    else {
        next();
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        session: {
            connected: redis.status === 'ready',
            store: 'redis',
        },
    });
});
// Rutas
app.use('/api/auth', auth_routes_1.authRoutes);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    redis.disconnect();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    redis.disconnect();
    process.exit(0);
});
app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
    console.log(`📖 API Documentation available at: http://localhost:${PORT}/api-docs`);
    console.log(`🔒 Security features enabled:`);
    console.log(`   ✅ HttpOnly cookies`);
    console.log(`   ✅ Secure cookies (${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled - dev mode'})`);
    console.log(`   ✅ SameSite=Strict`);
    console.log(`   ✅ Session fixation protection`);
    console.log(`   ✅ Redis session store`);
    console.log(`   ✅ Rate limiting`);
    console.log(`   ✅ CORS protection`);
    console.log(`   ✅ Helmet security headers`);
});
