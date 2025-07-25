/**
 * 🚀 Railway Production Configuration
 * 
 * Configuración específica para Railway con sistema de seguridad integral
 */

import { securitySystem } from './packages/security/src/index';

// Configuración de Railway para producción
const railwayConfig = {
  // Build configuration
  build: {
    command: [
      'corepack enable',
      'corepack prepare yarn@4.9.2 --activate', 
      'yarn install --immutable',
      'yarn workspace @facturacion/security build',
      'yarn workspace @facturacion/web build'
    ].join(' && '),
    outputDirectory: 'apps/web/.next'
  },

  // Start configuration
  start: {
    command: 'yarn workspace @facturacion/web start',
    healthCheck: '/api/health',
    port: process.env.PORT || 3000
  },

  // Environment variables específicas para Railway
  environment: {
    // Variables de Railway
    NODE_ENV: 'production',
    NODE_VERSION: '20',
    
    // Variables de seguridad
    ENABLE_CSP: 'true',
    ENABLE_FRAME_GUARD: 'true',
    ENABLE_METRICS: 'true',
    ENABLE_SENTRY: 'true',
    
    // Next.js variables (Railway auto-configura RAILWAY_PUBLIC_DOMAIN)
    NEXT_PUBLIC_APP_URL: process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL: `${process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000'}/api`,
    
    // Variables críticas (configurar en Railway Dashboard)
    JWT_SECRET: process.env.JWT_SECRET,
    CSRF_SECRET: process.env.CSRF_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    DATABASE_URL: process.env.DATABASE_URL
  },

  // Servicios Railway
  services: {
    web: {
      dockerfile: 'Dockerfile.railway',
      healthCheck: '/api/health',
      port: 3000,
      domains: ['facturacion-autonomos.up.railway.app']
    },
    
    postgres: {
      image: 'postgres:15',
      volumes: ['postgres_data:/var/lib/postgresql/data'],
      environment: {
        POSTGRES_DB: 'facturacion_prod',
        POSTGRES_USER: 'facturacion_user',
        POSTGRES_PASSWORD: '${{POSTGRES_PASSWORD}}'
      }
    }
  },

  // Security headers para Railway
  headers: {
    '/*': {
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-*'",
        "style-src 'self' 'unsafe-inline' 'nonce-*'", 
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https: wss:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
        "block-all-mixed-content"
      ].join('; ')
    },
    
    '/admin/security-dashboard': {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    
    '/api/*': {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-Permitted-Cross-Domain-Policies': 'none'
    }
  }
};

/**
 * Inicializar configuración Railway con sistema de seguridad
 */
export async function initializeRailwayApp() {
  console.log('🚀 Inicializando aplicación Railway con seguridad integral...');
  
  try {
    // Configurar sistema de seguridad para Railway
    const security = securitySystem.getInstance({
      environment: 'production',
      
      auth: {
        jwtSecret: process.env.JWT_SECRET!,
        jwtExpiration: '1h',
        bcryptRounds: 12,
        enableMFA: true
      },
      
      monitoring: {
        enableSentry: true,
        sentryDsn: process.env.SENTRY_DSN,
        enableMetrics: true,
        metricsInterval: 30000
      },
      
      headers: {
        enableHSTS: true,
        enableCSP: true,
        enableFrameGuard: true
      },
      
      rateLimit: {
        windowMs: 900000, // 15 minutos
        maxRequests: 100,
        enableDDosProtection: true
      }
    });
    
    await security.initialize();
    
    console.log('✅ Sistema de seguridad Railway inicializado correctamente');
    console.log('📊 Dashboard disponible en: /admin/security-dashboard');
    console.log('🛡️ Todos los middlewares de seguridad activos');
    
    return security;
    
  } catch (error) {
    console.error('❌ Error inicializando seguridad Railway:', error);
    throw error;
  }
}

export default railwayConfig;
