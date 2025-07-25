/**
 * 🛡️ MIDDLEWARE DE SEGURIDAD AVANZADO
 * 
 * Configuración completa de cabeceras de seguridad, CORS, CSP y políticas de protección
 * para servicios Express y Next.js del monorepo.
 * 
 * SECURITY: Este middleware debe ser aplicado ANTES que cualquier otra ruta.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// Variables de entorno para configuración de seguridad
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_DOMAIN = process.env.API_DOMAIN || 'localhost:3001';ARE DE SEGURIDAD AVANZADO
 * 
 * Configuración completa de cabeceras de seguridad, CORS, CSP y políticas de protección
 * para todos los servicios Express del monorepo.
 * 
 * SECURITY: Este middleware debe ser aplicado ANTES que cualquier otra ruta.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction, Application } from 'express';

// Variables de entorno para configuración de seguridad
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_DOMAIN = process.env.API_DOMAIN || 'localhost:3001';

/**
 * Configuración de CORS restrictiva para Express
 */
export const corsConfig = cors({
  origin: function (origin, callback) {
    // Lista de dominios autorizados
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',  // Frontend desarrollo
      'http://localhost:3001',  // API desarrollo
      'https://facturacion-autonomos.vercel.app',  // Frontend producción
      'https://api.facturacion-autonomos.com',     // API producción
    ];

    // En desarrollo, permitir requests sin origin (Postman, etc.)
    if (NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    // Verificar si el origin está en la lista permitida
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`🚨 CORS VIOLATION: Origin ${origin} not allowed`);
      callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
    }
  },
  credentials: true,  // Permitir cookies y headers de autenticación
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
  maxAge: 86400, // 24 horas para preflight cache
});

/**
 * Configuración de Content Security Policy
 */
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Solo para desarrollo - remover en producción
      "'unsafe-eval'",   // Solo para desarrollo - remover en producción
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
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
      "http://localhost:*", // Solo desarrollo
    ],
    connectSrc: [
      "'self'",
      "https://api.facturacion-autonomos.com",
      "https://fal.run", // FAL API
      "https://api.openai.com", // OpenAI API
      "http://localhost:*", // Solo desarrollo
      "ws://localhost:*",   // WebSockets desarrollo
      "wss://localhost:*",  // WebSockets desarrollo
    ],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    manifestSrc: ["'self'"],
    workerSrc: ["'self'", "blob:"],
    upgradeInsecureRequests: NODE_ENV === 'production' ? [] : undefined,
  },
  reportOnly: NODE_ENV === 'development', // Solo reportar en desarrollo
};

/**
 * Configuración de Helmet con políticas de seguridad
 */
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: cspConfig,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny', // Prevenir clickjacking
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: ['strict-origin-when-cross-origin'],
  },
  
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: false,
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },
  
  // Expect-CT
  expectCt: {
    enforce: true,
    maxAge: 86400, // 24 horas
  },
  
  // Feature Policy / Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    gyroscope: [],
    magnetometer: [],
    payment: [],
    usb: [],
  },
});

/**
 * Rate Limiting por IP
 */
export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: NODE_ENV === 'production' ? 100 : 1000, // requests por ventana
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: 15 * 60, // segundos
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Saltar rate limiting para health checks
    return req.path === '/health' || req.path === '/ping';
  },
  keyGenerator: (req) => {
    // Usar X-Forwarded-For si está disponible (proxies/load balancers)
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
});

/**
 * Rate Limiting estricto para rutas de autenticación
 */
export const authRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por IP
  message: {
    error: 'Too many authentication attempts',
    message: 'Account temporarily locked. Please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Middleware personalizado para cabeceras de seguridad adicionales
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // X-Request-ID para tracking
  const requestId = req.headers['x-request-id'] || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', requestId);
  
  // Cabeceras personalizadas de seguridad
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Powered-By', 'Facturacion-Autonomos-API');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  
  // Prevenir caching de respuestas sensibles
  if (req.path.includes('/api/auth') || req.path.includes('/api/user')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Logging de seguridad
  if (NODE_ENV === 'development') {
    console.log(`🔍 Security Headers Applied - ${req.method} ${req.path} [${requestId}]`);
  }
  
  next();
};

/**
 * Middleware para validar Origin en requests críticos
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin') || req.get('Referer');
  const host = req.get('Host');
  
  // Lista de hosts permitidos
  const allowedHosts = [
    'localhost:3000',
    'localhost:3001',
    'facturacion-autonomos.vercel.app',
    'api.facturacion-autonomos.com',
    API_DOMAIN,
  ];
  
  // Verificar que el host está en la lista permitida
  if (host && !allowedHosts.some(allowedHost => host.includes(allowedHost))) {
    console.error(`🚨 HOST VALIDATION FAILED: ${host} not in allowed hosts`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid host header',
      code: 'INVALID_HOST'
    });
  }
  
  // Para requests POST/PUT/DELETE, verificar Origin
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!origin) {
      console.error('🚨 MISSING ORIGIN: Critical request without Origin header');
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Origin header required for this request',
        code: 'MISSING_ORIGIN'
      });
    }
    
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'https://facturacion-autonomos.vercel.app',
    ];
    
    if (!allowedOrigins.some(allowedOrigin => origin.includes(allowedOrigin))) {
      console.error(`🚨 ORIGIN VALIDATION FAILED: ${origin} not in allowed origins`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid origin for this request',
        code: 'INVALID_ORIGIN'
      });
    }
  }
  
  next();
};

/**
 * Configuración completa de seguridad para Express
 */
export const setupSecurity = (app: any) => {
  // 1. Trust proxy (para obtener IPs reales detrás de load balancers)
  app.set('trust proxy', 1);
  
  // 2. Helmet para cabeceras de seguridad
  app.use(helmetConfig);
  
  // 3. CORS restrictivo
  app.use(corsConfig);
  
  // 4. Rate limiting general
  app.use(rateLimitConfig);
  
  // 5. Cabeceras personalizadas
  app.use(customSecurityHeaders);
  
  // 6. Validación de Origin para rutas críticas
  app.use('/api/auth', validateOrigin);
  app.use('/api/user', validateOrigin);
  app.use('/api/invoices', validateOrigin);
  
  // 7. Rate limiting específico para autenticación
  app.use('/api/auth/login', authRateLimitConfig);
  app.use('/api/auth/register', authRateLimitConfig);
  app.use('/api/auth/reset-password', authRateLimitConfig);
  
  console.log('🛡️ Security middleware configured successfully');
};

/**
 * Middleware de desarrollo para debugging de cabeceras
 */
export const debugHeaders = (req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'development') {
    console.log('\n🔍 REQUEST HEADERS DEBUG:');
    console.log('Origin:', req.get('Origin'));
    console.log('Referer:', req.get('Referer'));
    console.log('Host:', req.get('Host'));
    console.log('User-Agent:', req.get('User-Agent'));
    console.log('X-Forwarded-For:', req.get('X-Forwarded-For'));
    console.log('X-Real-IP:', req.get('X-Real-IP'));
    console.log('\n🔍 RESPONSE HEADERS DEBUG:');
    
    // Hook para mostrar response headers
    const originalSend = res.send;
    res.send = function(data) {
      console.log('Access-Control-Allow-Origin:', res.get('Access-Control-Allow-Origin'));
      console.log('Content-Security-Policy:', res.get('Content-Security-Policy'));
      console.log('X-Frame-Options:', res.get('X-Frame-Options'));
      console.log('Strict-Transport-Security:', res.get('Strict-Transport-Security'));
      console.log('----------------------------------------\n');
      return originalSend.call(this, data);
    };
  }
  
  next();
};

export default {
  setupSecurity,
  corsConfig,
  helmetConfig,
  rateLimitConfig,
  authRateLimitConfig,
  customSecurityHeaders,
  validateOrigin,
  debugHeaders,
};
