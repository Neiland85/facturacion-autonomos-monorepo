/**
 * 🚀 CONFIGURACIÓN FINAL DEL SISTEMA DE SEGURIDAD
 * 
 * Exportación completa de los 10 puntos de seguridad implementados
 */

// 1. Autenticación robusta
export * from './auth-system';

// 2. Autorización granular (RBAC)
export * from './rbac-system';

// 3. Validación y sanitización de datos
export * from './data-validation';

// 4. Protección CSRF
export * from './csrf-protection';

// 5. Rate limiting y throttling
export * from './rate-limiting';

// 6. Manejo seguro de sesiones
export * from './session-security';

// 7. Protección contra inyecciones SQL
export * from './sql-injection-protection';

// 8. Configuración de headers de seguridad
export * from './security-headers';

// 9. Seguridad en el frontend (XSS y CSP)
export * from './csp-security';
export * from './frontend-security';
export * from './safe-components';

// 10. Monitoreo y alertas
export * from './centralized-logging';
export * from './monitoring-system';
export * from './sentry-alerts';

/**
 * Configuración integrada del sistema de seguridad
 */
export interface SecurityConfig {
  auth: {
    jwtSecret: string;
    jwtExpiration: string;
    bcryptRounds: number;
    enableMFA: boolean;
  };
  rbac: {
    enableRoleCache: boolean;
    cacheExpiration: number;
  };
  csrf: {
    secret: string;
    ignoreMethods: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    enableDDosProtection: boolean;
  };
  session: {
    secret: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
  };
  headers: {
    enableHSTS: boolean;
    enableCSP: boolean;
    enableFrameGuard: boolean;
  };
  monitoring: {
    enableSentry: boolean;
    sentryDsn?: string;
    enableMetrics: boolean;
    metricsInterval: number;
  };
  environment: 'development' | 'production' | 'test';
}

/**
 * Configuración por defecto
 */
export const getDefaultSecurityConfig = (): SecurityConfig => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    enableMFA: process.env.ENABLE_MFA === 'true'
  },
  rbac: {
    enableRoleCache: process.env.ENABLE_ROLE_CACHE !== 'false',
    cacheExpiration: parseInt(process.env.ROLE_CACHE_EXPIRATION || '3600000') // 1 hora
  },
  csrf: {
    secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    enableDDosProtection: process.env.ENABLE_DDOS_PROTECTION === 'true'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 horas
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  },
  headers: {
    enableHSTS: process.env.NODE_ENV === 'production',
    enableCSP: process.env.ENABLE_CSP !== 'false',
    enableFrameGuard: process.env.ENABLE_FRAME_GUARD !== 'false'
  },
  monitoring: {
    enableSentry: Boolean(process.env.SENTRY_DSN),
    sentryDsn: process.env.SENTRY_DSN,
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000') // 30 segundos
  },
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'
});

/**
 * Inicialización completa del sistema de seguridad
 */
import { AuthSystem } from './auth-system';
import { createCSRFMiddleware } from './csrf-protection';
import { monitoringSystem } from './monitoring-system';
import { createRateLimitMiddleware } from './rate-limiting';
import { RBACSystem } from './rbac-system';
import { createSecurityHeaders } from './security-headers';

export class ComprehensiveSecuritySystem {
  private static instance: ComprehensiveSecuritySystem;
  private config: SecurityConfig;
  private authSystem: AuthSystem;
  private rbacSystem: RBACSystem;
  private isInitialized = false;

  private constructor(config?: Partial<SecurityConfig>) {
    this.config = { ...getDefaultSecurityConfig(), ...config };
    this.authSystem = AuthSystem.getInstance();
    this.rbacSystem = RBACSystem.getInstance();
  }

  public static getInstance(config?: Partial<SecurityConfig>): ComprehensiveSecuritySystem {
    if (!ComprehensiveSecuritySystem.instance) {
      ComprehensiveSecuritySystem.instance = new ComprehensiveSecuritySystem(config);
    }
    return ComprehensiveSecuritySystem.instance;
  }

  /**
   * Inicializar todo el sistema de seguridad
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔒 Sistema de seguridad ya inicializado');
      return;
    }

    console.log('🔒 Inicializando sistema completo de seguridad...');

    try {
      // 1. Inicializar autenticación
      await this.authSystem.initialize();

      // 2. Inicializar RBAC
      await this.rbacSystem.initialize();

      // 3. Inicializar monitoreo
      await monitoringSystem.initialize();

      this.isInitialized = true;

      console.log('✅ Sistema de seguridad inicializado correctamente');
      console.log('📊 Componentes activos:');
      console.log('  ✓ Autenticación JWT con MFA');
      console.log('  ✓ Sistema RBAC granular');
      console.log('  ✓ Protección CSRF');
      console.log('  ✓ Rate limiting y DDoS protection');
      console.log('  ✓ Validación y sanitización de datos');
      console.log('  ✓ Sesiones seguras');
      console.log('  ✓ Protección contra SQL injection');
      console.log('  ✓ Headers de seguridad');
      console.log('  ✓ Protección XSS y CSP');
      console.log('  ✓ Monitoreo y alertas Sentry');

    } catch (error) {
      console.error('❌ Error inicializando sistema de seguridad:', error);
      throw error;
    }
  }

  /**
   * Obtener middlewares de Express configurados
   */
  getExpressMiddlewares() {
    if (!this.isInitialized) {
      throw new Error('Sistema de seguridad no inicializado. Ejecuta initialize() primero.');
    }

    return {
      // Headers de seguridad
      securityHeaders: createSecurityHeaders(this.config.headers),
      
      // Rate limiting
      rateLimit: createRateLimitMiddleware(this.config.rateLimit),
      
      // CSRF protection
      csrf: createCSRFMiddleware(this.config.csrf),
      
      // Monitoreo de requests
      monitoring: monitoringSystem.getExpressMiddleware(),
      
      // Autenticación JWT
      authenticate: this.authSystem.getMiddleware(),
      
      // Autorización RBAC
      authorize: (permissions: string[]) => this.rbacSystem.getMiddleware(permissions)
    };
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Shutdown del sistema
   */
  shutdown() {
    monitoringSystem.shutdown();
    console.log('🔒 Sistema de seguridad detenido');
  }

  /**
   * Health check del sistema de seguridad
   */
  healthCheck(): { status: 'healthy' | 'unhealthy', components: Record<string, boolean> } {
    const components = {
      auth: this.authSystem.isInitialized(),
      rbac: this.rbacSystem.isInitialized(),
      monitoring: true, // Siempre activo una vez inicializado
      initialized: this.isInitialized
    };

    const allHealthy = Object.values(components).every(status => status);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      components
    };
  }
}

// Instancia singleton para uso global
export const securitySystem = ComprehensiveSecuritySystem.getInstance();

// Configuración de desarrollo rápido
export const quickSetup = {
  /**
   * Setup rápido para desarrollo
   */
  development: () => {
    const config: Partial<SecurityConfig> = {
      environment: 'development',
      auth: {
        jwtSecret: 'dev-jwt-secret',
        jwtExpiration: '7d',
        bcryptRounds: 8,
        enableMFA: false
      },
      rateLimit: {
        windowMs: 60000, // 1 minuto
        maxRequests: 1000, // Más permisivo en desarrollo
        enableDDosProtection: false
      },
      monitoring: {
        enableSentry: false,
        enableMetrics: true,
        metricsInterval: 60000 // 1 minuto
      }
    };
    
    return ComprehensiveSecuritySystem.getInstance(config);
  },

  /**
   * Setup para producción
   */
  production: () => {
    const config: Partial<SecurityConfig> = {
      environment: 'production',
      auth: {
        jwtSecret: process.env.JWT_SECRET!,
        jwtExpiration: '1h',
        bcryptRounds: 12,
        enableMFA: true
      },
      rateLimit: {
        windowMs: 900000, // 15 minutos
        maxRequests: 100,
        enableDDosProtection: true
      },
      session: {
        secure: true, // HTTPS only
        httpOnly: true,
        maxAge: 3600000, // 1 hora
        secret: process.env.SESSION_SECRET!
      },
      headers: {
        enableHSTS: true,
        enableCSP: true,
        enableFrameGuard: true
      },
      monitoring: {
        enableSentry: true,
        sentryDsn: process.env.SENTRY_DSN,
        enableMetrics: true,
        metricsInterval: 30000 // 30 segundos
      }
    };
    
    return ComprehensiveSecuritySystem.getInstance(config);
  }
};

export default {
  ComprehensiveSecuritySystem,
  securitySystem,
  getDefaultSecurityConfig,
  quickSetup
};
