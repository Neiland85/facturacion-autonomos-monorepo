/**
 * 🛡️ MIDDLEWARE DE SEGURIDAD PARA EXPRESS
 *
 * Configuración completa de Helmet y CORS para servicios Express
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Configuración de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Lista de dominios permitidos
 */
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://facturacion-autonomos.vercel.app',
  'https://api.facturacion-autonomos.com',
];

/**
 * Configuración de CORS restrictiva
 */
const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo, permitir requests sin origin (Postman, testing)
    if (!IS_PRODUCTION && !origin) {
      return callback(null, true);
    }

    // Verificar si el origin está permitido
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`🚨 CORS VIOLATION: Origin "${origin}" not allowed`);
      callback(
        new Error(`CORS policy violation: Origin ${origin} not allowed`)
      );
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  maxAge: 86400, // 24 horas
};

/**
 * Configuración de Helmet con CSP
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(IS_PRODUCTION ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
        'https://cdn.jsdelivr.net',
        'https://vercel.live',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        ...(IS_PRODUCTION ? [] : ['http:']),
      ],
      connectSrc: [
        "'self'",
        'https://api.facturacion-autonomos.com',
        'https://fal.run',
        'https://api.openai.com',
        ...(IS_PRODUCTION ? [] : ['http:', 'ws:', 'wss:']),
      ],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
    reportOnly: !IS_PRODUCTION,
  },
  hsts: IS_PRODUCTION
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true,
};

/**
 * Rate limiting general
 */
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: IS_PRODUCTION ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    return req.url === '/health' || req.url === '/ping';
  },
};

/**
 * Rate limiting para autenticación
 */
const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts',
    message: 'Account temporarily locked',
    retryAfter: 15 * 60,
  },
  skipSuccessfulRequests: true,
};

/**
 * Middleware de cabeceras personalizadas
 */
const customHeaders = (req, res, next) => {
  // Request ID
  const requestId =
    req.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.set({
    'X-Request-ID': requestId,
    'X-API-Version': '1.0.0',
    'X-Powered-By': 'Facturacion-Autonomos-API',
    'X-Robots-Tag': 'noindex, nofollow',
  });

  // Prevenir caching para rutas sensibles
  if (req.path?.includes('/api/auth') || req.path?.includes('/api/user')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
  }

  next();
};

/**
 * Validación de origin para requests críticos
 */
const validateOrigin = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const method = req.method;

  // Solo validar para métodos que modifican datos
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!origin && IS_PRODUCTION) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Origin header required',
        code: 'MISSING_ORIGIN',
      });
    }

    if (origin && !ALLOWED_ORIGINS.some(allowed => origin.includes(allowed))) {
      console.error(`🚨 INVALID ORIGIN: ${origin}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid origin',
        code: 'INVALID_ORIGIN',
      });
    }
  }

  next();
};

/**
 * Configuración completa de seguridad para Express
 */
function setupSecurity(app) {
  console.log('🛡️ Configurando middleware de seguridad...');

  // Trust proxy
  app.set('trust proxy', 1);

  // Helmet
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting
  app.use(rateLimit(rateLimitOptions));

  // Cabeceras personalizadas
  app.use(customHeaders);

  // Validación de origin para rutas críticas
  app.use('/api/auth', validateOrigin);
  app.use('/api/user', validateOrigin);
  app.use('/api/invoices', validateOrigin);

  // Rate limiting específico para auth
  const authRateLimit = rateLimit(authRateLimitOptions);
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);
  app.use('/api/auth/reset-password', authRateLimit);

  console.log('✅ Middleware de seguridad configurado');
}

module.exports = {
  setupSecurity,
  corsOptions,
  helmetOptions,
  rateLimitOptions,
  authRateLimitOptions,
  customHeaders,
  validateOrigin,
  ALLOWED_ORIGINS,
};
