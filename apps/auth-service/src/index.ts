import compression from 'compression';
import RedisStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import Redis from 'ioredis';
import morgan from 'morgan';
const path = require('path');

// Configurar documentación API
const { setupSwagger } = require(
  path.join(__dirname, '../../../config/auth-service-swagger')
);

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger.middleware';
import { authRoutes } from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3003;

// Configuración de Redis para sesiones
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

// Store de sesiones Redis
const redisStore = new RedisStore({
  client: redis,
  prefix: 'facturacion_sess:',
});

// Middleware de seguridad
app.use(
  helmet({
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
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://localhost:3000',
      ];

      // Permitir requests sin origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Importante para cookies
    optionsSuccessStatus: 200,
  })
);

app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());

// Configuración de sesiones EXPRESS-SESSION con configuración segura
app.use(
  session({
    store: redisStore,
    secret:
      process.env.SESSION_SECRET ||
      'your-super-secret-session-key-change-in-production',
    name: 'sessionId', // Nombre personalizado para ocultar express
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renovar expiración en cada request
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      httpOnly: true, // No accesible desde JavaScript
      maxAge: 30 * 60 * 1000, // 30 minutos
      sameSite: 'strict' as const, // Protección CSRF
      domain: process.env.COOKIE_DOMAIN, // Configurar según dominio
    },
    genid: () => {
      // Generar ID de sesión más seguro
      return crypto.randomBytes(32).toString('hex');
    },
  })
);

// Rate limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP para rutas de auth
  message: {
    error:
      'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
    code: 'TOO_MANY_AUTH_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes, inténtalo de nuevo más tarde.',
  },
});

app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middleware de logging personalizado
app.use(requestLogger);

// Configurar documentación API
setupSwagger(app);

// Middleware para regenerar session ID tras login exitoso
app.use((req, res, next) => {
  if (req.path.includes('/login') && req.method === 'POST') {
    // Guardar datos antes de regenerar
    const sessionData = req.session;
    req.session.regenerate((err: any) => {
      if (err) {
        console.error('Error regenerating session:', err);
        return next(err);
      }
      // Restaurar datos importantes (evita session fixation)
      Object.assign(req.session, sessionData);
      next();
    });
  } else {
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
app.use('/api/auth', authRoutes);

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
app.use(errorHandler);

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
  console.log(
    `📖 API Documentation available at: http://localhost:${PORT}/api-docs`
  );
  console.log(`🔒 Security features enabled:`);
  console.log(`   ✅ HttpOnly cookies`);
  console.log(
    `   ✅ Secure cookies (${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled - dev mode'})`
  );
  console.log(`   ✅ SameSite=Strict`);
  console.log(`   ✅ Session fixation protection`);
  console.log(`   ✅ Redis session store`);
  console.log(`   ✅ Rate limiting`);
  console.log(`   ✅ CORS protection`);
  console.log(`   ✅ Helmet security headers`);
});

export { redis };
