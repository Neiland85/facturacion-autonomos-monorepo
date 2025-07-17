import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '4000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Servicios backend
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000'),
      retries: parseInt(process.env.AUTH_SERVICE_RETRIES || '3')
    },
    invoice: {
      url: process.env.INVOICE_SERVICE_URL || 'http://localhost:4002',
      timeout: parseInt(process.env.INVOICE_SERVICE_TIMEOUT || '10000'),
      retries: parseInt(process.env.INVOICE_SERVICE_RETRIES || '3')
    },
    client: {
      url: process.env.CLIENT_SERVICE_URL || 'http://localhost:4003',
      timeout: parseInt(process.env.CLIENT_SERVICE_TIMEOUT || '5000'),
      retries: parseInt(process.env.CLIENT_SERVICE_RETRIES || '3')
    },
    tax: {
      url: process.env.TAX_SERVICE_URL || 'http://localhost:4004',
      timeout: parseInt(process.env.TAX_SERVICE_TIMEOUT || '15000'),
      retries: parseInt(process.env.TAX_SERVICE_RETRIES || '3')
    },
    aeat: {
      url: process.env.AEAT_SERVICE_URL || 'http://localhost:4005',
      timeout: parseInt(process.env.AEAT_SERVICE_TIMEOUT || '30000'),
      retries: parseInt(process.env.AEAT_SERVICE_RETRIES || '5')
    },
    peppol: {
      url: process.env.PEPPOL_SERVICE_URL || 'http://localhost:4006',
      timeout: parseInt(process.env.PEPPOL_SERVICE_TIMEOUT || '20000'),
      retries: parseInt(process.env.PEPPOL_SERVICE_RETRIES || '3')
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4007',
      timeout: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT || '10000'),
      retries: parseInt(process.env.NOTIFICATION_SERVICE_RETRIES || '5')
    },
    storage: {
      url: process.env.STORAGE_SERVICE_URL || 'http://localhost:4008',
      timeout: parseInt(process.env.STORAGE_SERVICE_TIMEOUT || '15000'),
      retries: parseInt(process.env.STORAGE_SERVICE_RETRIES || '3')
    }
  },
  
  // Seguridad
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://facturacion-autonomos.com',
    'https://staging.facturacion-autonomos.com'
  ],
  
  // Rate limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'gateway:'
  },
  
  // Circuit breaker
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '3000'),
    errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '50'),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000')
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || './logs/gateway.log'
  },
  
  // Monitoreo
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableTracing: process.env.ENABLE_TRACING === 'true'
  }
};

// Validaciones
if (config.nodeEnv === 'production') {
  if (config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET debe configurarse en producción');
  }
  
  if (!process.env.REDIS_PASSWORD) {
    console.warn('⚠️ REDIS_PASSWORD no configurado para producción');
  }
}

export default config;
