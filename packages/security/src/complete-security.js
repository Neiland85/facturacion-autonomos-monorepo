/**
 * 🛡️ MIDDLEWARE DE SEGURIDAD EXPRESS COMPLETO
 *
 * Versión completa que incluye CSRF + manejo seguro de errores
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { setupCSRFProtection } = require('./csrf-protection');
const { setupErrorHandling } = require('./error-handling');

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
      const error = new Error(
        `CORS policy violation: Origin ${origin} not allowed`
      );
      error.status = 403;
      error.code = 'CORS_VIOLATION';
      callback(error);
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
    'X-Session-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-CSRF-Token',
    'X-Error-ID',
  ],
  maxAge: 86400, // 24 horas
};

/**
 * Configuración de Helmet con CSP mejorada
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
      formAction: ["'self'"],
      upgradeInsecureRequests: IS_PRODUCTION ? [] : null,
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
  crossOriginEmbedderPolicy: false, // Para compatibilidad
};

/**
 * Rate limiting general mejorado
 */
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: IS_PRODUCTION ? 100 : 1000,
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP',
    retryAfter: 15 * 60,
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    const skipPaths = ['/health', '/ping', '/api/csrf-token'];
    return skipPaths.includes(req.path);
  },
  onLimitReached: req => {
    console.warn(`🚨 Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
  },
};

/**
 * Rate limiting estricto para autenticación
 */
const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    error: 'Authentication rate limit exceeded',
    message: 'Too many authentication attempts',
    retryAfter: 15 * 60,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: true,
  onLimitReached: req => {
    console.error(`🚨 Auth rate limit exceeded for IP: ${req.ip}`);
  },
};

/**
 * Middleware de cabeceras personalizadas mejorado
 */
const customHeaders = (req, res, next) => {
  // Request ID para tracking
  const requestId =
    req.get('x-request-id') ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.requestId = requestId;

  res.set({
    'X-Request-ID': requestId,
    'X-API-Version': '1.0.0',
    'X-Powered-By': 'Facturacion-Autonomos-API',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-CSRF-Protection': 'enabled',
    'X-Error-Handling': 'secure',
  });

  // Headers específicos para rutas sensibles
  if (req.path?.includes('/api/auth') || req.path?.includes('/api/user')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Sensitive-Route': 'true',
    });
  }

  next();
};

/**
 * Validación de origin mejorada con manejo de errores
 */
const validateOrigin = (req, res, next) => {
  const origin = req.get('Origin') || req.get('Referer');
  const method = req.method;

  // Solo validar para métodos que modifican datos
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!origin && IS_PRODUCTION) {
      const error = new Error('Origin header required for security');
      error.status = 403;
      error.code = 'MISSING_ORIGIN';
      return next(error);
    }

    if (origin && !ALLOWED_ORIGINS.some(allowed => origin.includes(allowed))) {
      console.error(`🚨 Invalid origin: ${origin} for ${method} ${req.path}`);
      const error = new Error('Invalid origin - possible CSRF attack');
      error.status = 403;
      error.code = 'INVALID_ORIGIN';
      return next(error);
    }
  }

  next();
};

/**
 * Middleware de timeout para prevenir hanging requests
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      const error = new Error('Request timeout');
      error.status = 408;
      error.code = 'REQUEST_TIMEOUT';
      next(error);
    });
    next();
  };
};

/**
 * Middleware para limitar tamaño de payload
 */
const payloadSizeLimit = (req, res, next) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    const error = new Error('Payload too large');
    error.status = 413;
    error.code = 'PAYLOAD_TOO_LARGE';
    return next(error);
  }

  next();
};

/**
 * Configuración completa de seguridad para Express
 */
function setupCompleteSecurity(app, options = {}) {
  console.log('🛡️ Configurando seguridad completa...');

  const {
    enableCSRF = true,
    strictCSRF = IS_PRODUCTION,
    customCSRFIgnoreRoutes = [],
    enableErrorHandling = true,
    enableRequestLogging = true,
    requestTimeoutMs = 30000,
    enablePayloadLimit = true,
  } = options;

  // Trust proxy
  app.set('trust proxy', 1);

  // Middleware de timeout
  if (requestTimeoutMs > 0) {
    app.use(requestTimeout(requestTimeoutMs));
  }

  // Limitar tamaño de payload
  if (enablePayloadLimit) {
    app.use(payloadSizeLimit);
  }

  // Helmet para headers de seguridad
  app.use(helmet(helmetOptions));

  // CORS con manejo de errores
  app.use(cors(corsOptions));

  // Rate limiting general
  app.use(rateLimit(rateLimitOptions));

  // Headers personalizados
  app.use(customHeaders);

  // Validación de origin
  app.use(validateOrigin);

  // Manejo de errores (debe ir antes de CSRF para capturar errores de setup)
  if (enableErrorHandling) {
    setupErrorHandling(app, {
      enableRequestLogging,
      logSensitiveData: !IS_PRODUCTION,
    });
  }

  // Protección CSRF
  if (enableCSRF) {
    setupCSRFProtection(app, {
      strictValidation: strictCSRF,
      customIgnoreRoutes: [
        '/health',
        '/ping',
        '/api/public',
        ...customCSRFIgnoreRoutes,
      ],
    });
  }

  // Rate limiting específico para autenticación (después de error handling)
  const authRateLimit = rateLimit(authRateLimitOptions);
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);
  app.use('/api/auth/reset-password', authRateLimit);
  app.use('/api/auth/change-password', authRateLimit);

  console.log('✅ Seguridad completa configurada');
}

module.exports = {
  setupCompleteSecurity,
  corsOptions,
  helmetOptions,
  rateLimitOptions,
  authRateLimitOptions,
  customHeaders,
  validateOrigin,
  requestTimeout,
  payloadSizeLimit,
  ALLOWED_ORIGINS,
};
