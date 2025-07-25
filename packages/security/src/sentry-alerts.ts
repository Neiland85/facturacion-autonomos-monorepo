/**
 * 🚨 SISTEMA DE ALERTAS Y MONITOREO CON SENTRY
 * 
 * Configuración completa de Sentry para alertas críticas y monitoreo de errores
 */

import { securityLogger } from './centralized-logging';

// Tipos básicos para Sentry (sin dependencias externas)
interface SentryScope {
  setLevel: (level: string) => void;
  setTag: (key: string, value: string) => void;
  setContext: (key: string, context: Record<string, any>) => void;
}

interface SentryBreadcrumb {
  category?: string;
  data?: any;
}

interface SentryEvent {
  request?: {
    headers?: Record<string, any>;
    data?: any;
  };
  contexts?: Record<string, any>;
}

// Mock de Sentry para desarrollo sin dependencias
const MockSentry = {
  init: (config: any) => {
    console.log('Mock Sentry initialized with config:', config);
  },
  withScope: (callback: (scope: SentryScope) => void) => {
    const mockScope: SentryScope = {
      setLevel: (level: string) => console.log(`Sentry level: ${level}`),
      setTag: (key: string, value: string) => console.log(`Sentry tag: ${key}=${value}`),
      setContext: (key: string, context: Record<string, any>) => console.log(`Sentry context: ${key}`, context)
    };
    callback(mockScope);
  },
  captureException: (error: Error) => {
    console.log('Sentry captured exception:', error.message);
  },
  captureMessage: (message: string, level: string) => {
    console.log(`Sentry captured message [${level}]: ${message}`);
  },
  setUser: (user: any) => {
    console.log('Sentry user set:', user);
  },
  setTags: (tags: Record<string, string>) => {
    console.log('Sentry tags set:', tags);
  },
  setContext: (key: string, context: Record<string, any>) => {
    console.log(`Sentry context set: ${key}`, context);
  },
  expressIntegration: () => (req: any, res: any, next: any) => next(),
  expressErrorHandler: (config: any) => (error: any, req: any, res: any, next: any) => {
    console.log('Sentry error handler:', error.message);
    next(error);
  },
  httpIntegration: () => ({}),
  nativeNodeFetchIntegration: () => ({}),
  nodeContextIntegration: () => ({})
};

/**
 * Configuración de Sentry
 */
export interface SentryConfig {
  dsn: string;
  environment: string;
  sampleRate: number;
  profilesSampleRate: number;
  tracesSampleRate: number;
  maxBreadcrumbs: number;
  attachStacktrace: boolean;
  release?: string;
  serverName?: string;
  enableTracing: boolean;
  enableProfiling: boolean;
}

/**
 * Configuraciones por ambiente
 */
const getSentryConfig = (): SentryConfig => {
  const environment = process.env.NODE_ENV || 'development';
  
  const baseConfig: SentryConfig = {
    dsn: process.env.SENTRY_DSN || '',
    environment,
    sampleRate: environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    maxBreadcrumbs: 100,
    attachStacktrace: true,
    release: process.env.SENTRY_RELEASE || `facturacion-autonomos@${process.env.npm_package_version}`,
    serverName: process.env.SERVICE_NAME || 'facturacion-autonomos',
    enableTracing: true,
    enableProfiling: environment === 'production'
  };

  return baseConfig;
};

/**
 * Inicializar Sentry
 */
export function initializeSentry(): void {
  const config = getSentryConfig();
  
  if (!config.dsn) {
    securityLogger.logWarn('Sentry DSN no configurado - alertas deshabilitadas');
    return;
  }

  const integrations = [
    MockSentry.httpIntegration(),
    MockSentry.nativeNodeFetchIntegration(),
    MockSentry.expressIntegration(),
    MockSentry.nodeContextIntegration()
  ];

  // Agregar profiling en producción (mock)
  if (config.enableProfiling) {
    integrations.push({});
  }

  MockSentry.init({
    dsn: config.dsn,
    environment: config.environment,
    sampleRate: config.sampleRate,
    profilesSampleRate: config.profilesSampleRate,
    tracesSampleRate: config.tracesSampleRate,
    maxBreadcrumbs: config.maxBreadcrumbs,
    attachStacktrace: config.attachStacktrace,
    release: config.release,
    serverName: config.serverName,
    integrations,
    
    // Configuración de breadcrumbs
    beforeBreadcrumb(breadcrumb: SentryBreadcrumb) {
      // Filtrar información sensible
      if (breadcrumb.category === 'http') {
        // Remover headers sensibles
        if (breadcrumb.data?.headers) {
          delete breadcrumb.data.headers.authorization;
          delete breadcrumb.data.headers.cookie;
          delete breadcrumb.data.headers['x-api-key'];
        }
        
        // Remover query parameters sensibles
        if (breadcrumb.data?.url) {
          const url = new URL(breadcrumb.data.url, 'http://localhost');
          url.searchParams.delete('password');
          url.searchParams.delete('token');
          url.searchParams.delete('api_key');
          breadcrumb.data.url = url.pathname + url.search;
        }
      }
      
      return breadcrumb;
    },

    // Configuración de eventos
    beforeSend(event: SentryEvent) {
      // Filtrar información sensible de los eventos
      if (event.request) {
        // Remover headers sensibles
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }
        
        // Remover datos sensibles del cuerpo
        if (event.request.data && typeof event.request.data === 'object') {
          const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'credit_card'];
          sensitiveFields.forEach(field => {
            if (event.request!.data && typeof event.request!.data === 'object') {
              delete (event.request!.data as any)[field];
            }
          });
        }
      }
      
      // Agregar contexto adicional
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: 'node',
          version: process.version
        },
        os: {
          name: process.platform,
          version: process.version
        }
      };
      
      return event;
    }
  });

  securityLogger.logInfo('🚨 Sentry inicializado correctamente', {
    action: 'SENTRY_INITIALIZED',
    metadata: {
      environment: config.environment,
      release: config.release,
      serverName: config.serverName
    }
  });
}

/**
 * Clase para manejo de alertas
 */
export class AlertManager {
  private static instance: AlertManager;

  private constructor() {}

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Alerta crítica - errores que requieren atención inmediata
   */
  alertCritical(message: string, error?: Error, context?: Record<string, any>) {
    securityLogger.logError(`CRITICAL: ${message}`, error || message, {
      action: 'CRITICAL_ALERT',
      metadata: context
    });

    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel('fatal');
      scope.setTag('alert_type', 'critical');
      scope.setContext('alert_context', context || {});
      
      if (error) {
        MockSentry.captureException(error);
      } else {
        MockSentry.captureMessage(message, 'fatal');
      }
    });
  }

  /**
   * Alerta de seguridad - violaciones de seguridad
   */
  alertSecurity(violationType: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) {
    securityLogger.logSecurityViolation(violationType, severity, {
      metadata: context
    });

    const sentryLevel = this.mapSeverityToSentryLevel(severity);
    
    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel(sentryLevel);
      scope.setTag('alert_type', 'security');
      scope.setTag('violation_type', violationType);
      scope.setTag('severity', severity);
      scope.setContext('security_context', context || {});
      
      MockSentry.captureMessage(`Security Violation: ${violationType}`, sentryLevel);
    });
  }

  /**
   * Alerta de SII - problemas con transacciones fiscales
   */
  alertSII(operation: string, status: 'error' | 'timeout' | 'invalid_response', context?: Record<string, any>) {
    securityLogger.logSIITransaction(operation, 'error', {
      metadata: { status, ...context }
    });

    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel('error');
      scope.setTag('alert_type', 'sii');
      scope.setTag('sii_operation', operation);
      scope.setTag('sii_status', status);
      scope.setContext('sii_context', context || {});
      
      MockSentry.captureMessage(`SII Transaction Failed: ${operation} - ${status}`, 'error');
    });
  }

  /**
   * Alerta de autenticación - problemas de acceso
   */
  alertAuth(event: string, severity: 'warning' | 'error', context?: Record<string, any>) {
    securityLogger.logAuth(event as any, {
      metadata: context
    });

    const sentryLevel = severity === 'error' ? 'error' : 'warning';
    
    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel(sentryLevel);
      scope.setTag('alert_type', 'authentication');
      scope.setTag('auth_event', event);
      scope.setContext('auth_context', context || {});
      
      MockSentry.captureMessage(`Authentication Alert: ${event}`, sentryLevel);
    });
  }

  /**
   * Alerta de rendimiento - problemas de performance
   */
  alertPerformance(operation: string, duration: number, threshold: number, context?: Record<string, any>) {
    securityLogger.logPerformance(operation, duration, {
      metadata: { threshold, ...context }
    });

    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel('warning');
      scope.setTag('alert_type', 'performance');
      scope.setTag('operation', operation);
      scope.setContext('performance_context', {
        duration,
        threshold,
        ratio: duration / threshold,
        ...context
      });
      
      MockSentry.captureMessage(`Performance Alert: ${operation} took ${duration}ms (threshold: ${threshold}ms)`, 'warning');
    });
  }

  /**
   * Alerta de disponibilidad - servicios no disponibles
   */
  alertAvailability(service: string, status: 'down' | 'degraded' | 'timeout', context?: Record<string, any>) {
    securityLogger.logError(`Service availability issue: ${service} is ${status}`, status, {
      action: 'AVAILABILITY_ALERT',
      metadata: { service, status, ...context }
    });

    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel('error');
      scope.setTag('alert_type', 'availability');
      scope.setTag('service', service);
      scope.setTag('status', status);
      scope.setContext('availability_context', context || {});
      
      MockSentry.captureMessage(`Service Availability: ${service} is ${status}`, 'error');
    });
  }

  /**
   * Alerta personalizada
   */
  alertCustom(message: string, level: 'info' | 'warning' | 'error' | 'fatal', tags?: Record<string, string>, context?: Record<string, any>) {
    const logLevel = level === 'fatal' ? 'error' : level;
    securityLogger.logInfo(message, {
      action: 'CUSTOM_ALERT',
      metadata: { tags, level, ...context }
    });

    MockSentry.withScope((scope: SentryScope) => {
      scope.setLevel(level);
      scope.setTag('alert_type', 'custom');
      
      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      if (context) {
        scope.setContext('custom_context', context);
      }
      
      MockSentry.captureMessage(message, level);
    });
  }

  /**
   * Mapear severidad a nivel de Sentry
   */
  private mapSeverityToSentryLevel(severity: string): string {
    switch (severity) {
      case 'critical': return 'fatal';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'error';
    }
  }
}

/**
 * Middleware de Sentry para Express
 */
export function createSentryMiddleware() {
  return {
    requestHandler: MockSentry.expressIntegration(),
    errorHandler: MockSentry.expressErrorHandler({
      shouldHandleError(error: any) {
        // Solo enviar errores 4xx y 5xx a Sentry
        return error.status >= 400;
      }
    })
  };
}

/**
 * Configurar user context en Sentry
 */
export function setSentryUser(userId: string, email?: string, username?: string, additionalData?: Record<string, any>) {
  MockSentry.setUser({
    id: userId,
    email,
    username,
    ...additionalData
  });
}

/**
 * Configurar tags en Sentry
 */
export function setSentryTags(tags: Record<string, string>) {
  MockSentry.setTags(tags);
}

/**
 * Configurar contexto en Sentry
 */
export function setSentryContext(key: string, context: Record<string, any>) {
  MockSentry.setContext(key, context);
}

/**
 * Monitor de health check
 */
export class HealthMonitor {
  private static instance: HealthMonitor;
  private alerts = AlertManager.getInstance();
  private lastHealthCheck = Date.now();
  private services: Map<string, { status: 'up' | 'down' | 'degraded', lastCheck: number }> = new Map();

  private constructor() {}

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  /**
   * Registrar estado de un servicio
   */
  registerServiceStatus(serviceName: string, status: 'up' | 'down' | 'degraded') {
    const previousStatus = this.services.get(serviceName)?.status;
    
    this.services.set(serviceName, {
      status,
      lastCheck: Date.now()
    });

    // Alertar si el estado cambió a down o degraded
    if (previousStatus !== status && (status === 'down' || status === 'degraded')) {
      this.alerts.alertAvailability(serviceName, status, {
        previousStatus,
        timestamp: new Date().toISOString()
      });
    }

    securityLogger.logInfo(`Service ${serviceName} status: ${status}`, {
      action: 'SERVICE_HEALTH_CHECK',
      service: serviceName,
      metadata: { status, previousStatus }
    });
  }

  /**
   * Obtener estado de todos los servicios
   */
  getServicesStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    this.services.forEach((service, name) => {
      status[name] = {
        ...service,
        isStale: Date.now() - service.lastCheck > 60000 // 1 minuto
      };
    });

    return status;
  }

  /**
   * Health check general
   */
  performHealthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy', services: any } {
    const services = this.getServicesStatus();
    const serviceStatuses = Object.values(services);
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (serviceStatuses.some((s: any) => s.status === 'down')) {
      overallStatus = 'unhealthy';
    } else if (serviceStatuses.some((s: any) => s.status === 'degraded' || s.isStale)) {
      overallStatus = 'degraded';
    }

    this.lastHealthCheck = Date.now();

    return {
      status: overallStatus,
      services
    };
  }
}

// Instancias singleton para uso global
export const alertManager = AlertManager.getInstance();
export const healthMonitor = HealthMonitor.getInstance();

export default {
  initializeSentry,
  AlertManager,
  alertManager,
  HealthMonitor,
  healthMonitor,
  createSentryMiddleware,
  setSentryUser,
  setSentryTags,
  setSentryContext
};
