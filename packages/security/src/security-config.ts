/**
 * 🛡️ CONFIGURACIÓN DE SEGURIDAD PARA EXPRESS Y NEXT.JS
 * 
 * Implementación completa de cabeceras de seguridad, CORS, CSP y rate limiting
 * según las mejores prácticas de seguridad.
 */

import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Configuración de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * 🌐 CONFIGURACIÓN DE CORS RESTRICTIVA
 */
export const setupCORS = () => {
  const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://facturacion-autonomos.vercel.app',
    'https://api.facturacion-autonomos.com',
  ];

  return cors({
    origin: function (origin, callback) {
      // En desarrollo, permitir requests sin origin (Postman, testing)
      if (!IS_PRODUCTION && !origin) {
        return callback(null, true);
      }

      // Verificar si el origin está permitido
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚨 CORS VIOLATION: Origin "${origin}" not allowed`);
        callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
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
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ],
    maxAge: 86400, // 24 horas
  });
};

/**
 * 🛡️ CONFIGURACIÓN DE HELMET (CABECERAS DE SEGURIDAD)
 */
export const setupHelmet = () => {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          ...(IS_PRODUCTION ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
          "https://cdn.jsdelivr.net",
          "https://vercel.live",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          ...(IS_PRODUCTION ? [] : ["http://localhost:*"]),
        ],
        connectSrc: [
          "'self'",
          "https://api.facturacion-autonomos.com",
          "https://fal.run",
          "https://api.openai.com",
          ...(IS_PRODUCTION ? [] : [
            "http://localhost:*",
            "ws://localhost:*",
            "wss://localhost:*"
          ]),
        ],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
      },
      reportOnly: !IS_PRODUCTION,
    },

    // HTTP Strict Transport Security (solo producción)
    hsts: IS_PRODUCTION ? {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    } : false,

    // Prevenir clickjacking
    frameguard: { action: 'deny' },

    // Prevenir MIME type sniffing
    noSniff: true,

    // XSS Protection (legacy pero útil)
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: { policy: ['strict-origin-when-cross-origin'] },

    // Permissions Policy
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      gyroscope: [],
      magnetometer: [],
      payment: [],
      usb: [],
    },

    // Deshabilitar X-Powered-By
    hidePoweredBy: true,
  });
};

/**
 * ⚡ CONFIGURACIÓN DE RATE LIMITING
 */
export const setupRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: IS_PRODUCTION ? 100 : 1000,
    message: {
      error: 'Too many requests from this IP',
      message: 'Please try again later',
      retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Saltar rate limiting para health checks
      return req.url === '/health' || req.url === '/ping' || req.url === '/api/health';
    },
    keyGenerator: (req) => {
      // Obtener IP real considerando proxies
      return req.ip || 
             req.headers['x-forwarded-for']?.toString().split(',')[0] ||
             req.socket.remoteAddress || 
             'unknown';
    },
  });
};

/**
 * 🔐 RATE LIMITING ESTRICTO PARA AUTENTICACIÓN
 */
export const setupAuthRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos
    message: {
      error: 'Too many authentication attempts',
      message: 'Account temporarily locked. Please try again later',
      retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });
};

/**
 * 📋 MIDDLEWARE PERSONALIZADO DE CABECERAS
 */
export const customSecurityHeaders = (req: any, res: any, next: any) => {
  // Request ID para tracking
  const requestId = req.get('x-request-id') || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.set('X-Request-ID', requestId);
  
  // Cabeceras personalizadas
  res.set('X-API-Version', '1.0.0');
  res.set('X-Powered-By', 'Facturacion-Autonomos-API');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  
  // Prevenir caching para rutas sensibles
  if (req.path?.includes('/api/auth') || req.path?.includes('/api/user')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
  }
  
  next();
};

/**
 * 🔍 VALIDACIÓN DE ORIGIN PARA REQUESTS CRÍTICOS
 */
export const validateOrigin = (req: any, res: any, next: any) => {
  const origin = req.get('Origin') || req.get('Referer');
  const method = req.method;
  
  // Solo validar origin para requests que modifican datos
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!origin && IS_PRODUCTION) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Origin header required for this request',
        code: 'MISSING_ORIGIN'
      });
    }
    
    if (origin) {
      const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:3000',
        'https://facturacion-autonomos.vercel.app',
      ];
      
      const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed));
      
      if (!isAllowed) {
        console.error(`🚨 ORIGIN VALIDATION FAILED: ${origin}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid origin for this request',
          code: 'INVALID_ORIGIN'
        });
      }
    }
  }
  
  next();
};

/**
 * 🚀 CONFIGURACIÓN COMPLETA PARA EXPRESS
 */
export const setupExpressSecurity = (app: any) => {
  console.log('🛡️ Configurando seguridad para Express...');
  
  // 1. Trust proxy para obtener IPs reales
  app.set('trust proxy', 1);
  
  // 2. Helmet para cabeceras de seguridad
  app.use(setupHelmet());
  
  // 3. CORS restrictivo
  app.use(setupCORS());
  
  // 4. Rate limiting general
  app.use(setupRateLimit());
  
  // 5. Cabeceras personalizadas
  app.use(customSecurityHeaders);
  
  // 6. Validación de origin para rutas críticas
  app.use('/api/auth', validateOrigin);
  app.use('/api/user', validateOrigin);
  app.use('/api/invoices', validateOrigin);
  
  // 7. Rate limiting específico para autenticación
  const authRateLimit = setupAuthRateLimit();
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);
  app.use('/api/auth/reset-password', authRateLimit);
  
  console.log('✅ Seguridad Express configurada correctamente');
};

/**
 * 🌐 CONFIGURACIÓN DE NEXT.JS (next.config.js)
 */
export const nextjsSecurityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection', 
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  ...(IS_PRODUCTION ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  }] : [])
];

/**
 * 🔒 VALIDACIÓN DE CORS PARA NEXT.JS API ROUTES
 */
export const validateNextCORS = (req: any): boolean => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:3000',
    'https://facturacion-autonomos.vercel.app',
  ];

  // En desarrollo, permitir requests sin origin
  if (!IS_PRODUCTION && !origin) {
    return true;
  }

  // Verificar origin para requests críticos
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return origin && allowedOrigins.some(allowed => origin.includes(allowed));
  }

  return true;
};

// Exportar configuraciones por defecto
export default {
  setupExpressSecurity,
  setupCORS,
  setupHelmet,
  setupRateLimit,
  setupAuthRateLimit,
  customSecurityHeaders,
  validateOrigin,
  nextjsSecurityHeaders,
  validateNextCORS,
};
