/**
 * 🔍 SISTEMA DE LOGGING CENTRALIZADO Y STRUCTURED LOGS
 * 
 * Sistema completo de logging para monitoreo de seguridad, accesos, errores y transacciones
 */

import winston from 'winston';

/**
 * Niveles de log personalizados
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  security: 2,
  audit: 3,
  info: 4,
  http: 5,
  debug: 6
};

/**
 * Colores para cada nivel
 */
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  security: 'magenta',
  audit: 'cyan',
  info: 'green',
  http: 'blue',
  debug: 'white'
};

winston.addColors(LOG_COLORS);

/**
 * Formatters personalizados
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      service: process.env.SERVICE_NAME || 'facturacion-autonomos',
      environment: process.env.NODE_ENV || 'development',
      ...meta
    };
    return JSON.stringify(logEntry);
  })
);

/**
 * Configuración de transports
 */
const createTransports = () => {
  const transports: winston.transport[] = [];

  // Console transport para desarrollo
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
          })
        )
      })
    );
  }

  // File transports
  transports.push(
    // Logs generales
    new winston.transports.File({
      filename: 'logs/application.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 30,
      format: customFormat,
      level: 'info'
    }),

    // Logs de error
    new winston.transports.File({
      filename: 'logs/error.log',
      maxsize: 100 * 1024 * 1024,
      maxFiles: 30,
      format: customFormat,
      level: 'error'
    }),

    // Logs de seguridad
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 100 * 1024 * 1024,
      maxFiles: 90,
      format: customFormat,
      level: 'security'
    }),

    // Logs de auditoría
    new winston.transports.File({
      filename: 'logs/audit.log',
      maxsize: 100 * 1024 * 1024,
      maxFiles: 365,
      format: customFormat,
      level: 'audit'
    })
  );

  return transports;
};

/**
 * Logger principal
 */
export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: createTransports(),
  exitOnError: false
});

/**
 * Tipos para structured logging
 */
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: Error | string;
  stack?: string;
  correlationId?: string;
  service?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Clase principal de logging
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = logger;
  }

  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Log de acceso HTTP
   */
  logAccess(req: any, res: any, responseTime: number, context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      requestId: req.headers?.['x-request-id'] || this.generateRequestId(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: this.getClientIP(req),
      userAgent: req.headers?.['user-agent'],
      userId: req.user?.id,
      sessionId: req.sessionID,
      correlationId: req.headers?.['x-correlation-id'],
      ...context
    };

    this.logger.log('http', 'HTTP Request', logData);
  }

  /**
   * Log de errores
   */
  logError(message: string, error: Error | string, context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    };

    this.logger.error(message, logData);
  }

  /**
   * Log de eventos de seguridad
   */
  logSecurity(event: string, context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action: event,
      timestamp: new Date().toISOString(),
      ...context
    };

    this.logger.log('security', `Security Event: ${event}`, logData);
  }

  /**
   * Log de auditoría para compliance
   */
  logAudit(action: string, resource: string, context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action,
      resource,
      timestamp: new Date().toISOString(),
      ...context
    };

    this.logger.log('audit', `Audit: ${action} on ${resource}`, logData);
  }

  /**
   * Log de transacciones SII
   */
  logSIITransaction(operation: string, status: 'success' | 'error' | 'pending', context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action: `SII_${operation}`,
      resource: 'SII_API',
      service: 'sii-integration',
      metadata: {
        operation,
        status,
        ...context.metadata
      },
      ...context
    };

    const level = status === 'error' ? 'error' : 'audit';
    this.logger.log(level, `SII Transaction: ${operation} - ${status}`, logData);
  }

  /**
   * Log de autenticación
   */
  logAuth(event: 'login' | 'logout' | 'failed_login' | 'password_reset', context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action: `AUTH_${event.toUpperCase()}`,
      ...context
    };

    const level = event === 'failed_login' ? 'security' : 'audit';
    this.logger.log(level, `Authentication: ${event}`, logData);
  }

  /**
   * Log de violaciones de seguridad
   */
  logSecurityViolation(type: string, severity: 'low' | 'medium' | 'high' | 'critical', context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action: 'SECURITY_VIOLATION',
      metadata: {
        violationType: type,
        severity,
        ...context.metadata
      },
      ...context
    };

    this.logger.log('security', `Security Violation: ${type} (${severity})`, logData);
  }

  /**
   * Log de rendimiento
   */
  logPerformance(operation: string, duration: number, context: Partial<LogContext> = {}) {
    const logData: LogContext = {
      action: 'PERFORMANCE_METRIC',
      metadata: {
        operation,
        duration,
        ...context.metadata
      },
      ...context
    };

    this.logger.info(`Performance: ${operation} took ${duration}ms`, logData);
  }

  /**
   * Log de información general
   */
  logInfo(message: string, context: Partial<LogContext> = {}) {
    this.logger.info(message, context);
  }

  /**
   * Log de debug
   */
  logDebug(message: string, context: Partial<LogContext> = {}) {
    this.logger.debug(message, context);
  }

  /**
   * Log de advertencias
   */
  logWarn(message: string, context: Partial<LogContext> = {}) {
    this.logger.warn(message, context);
  }

  /**
   * Obtener IP del cliente
   */
  private getClientIP(req: any): string {
    return (
      req.headers?.['x-forwarded-for'] ||
      req.headers?.['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Generar ID único para request
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Middleware de logging para Express
 */
export function createLoggingMiddleware() {
  const securityLogger = SecurityLogger.getInstance();

  return (req: any, res: any, next: Function) => {
    const startTime = Date.now();
    const requestId = req.headers?.['x-request-id'] || securityLogger['generateRequestId']();
    
    // Agregar request ID al header
    if (req.headers) {
      req.headers['x-request-id'] = requestId;
    }
    if (res.setHeader) {
      res.setHeader('X-Request-ID', requestId);
    }

    // Log del inicio de la request
    securityLogger.logDebug('Request started', {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: securityLogger['getClientIP'](req),
      userAgent: req.headers?.['user-agent']
    });

    // Override del end para capturar la respuesta
    if (res.end) {
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const responseTime = Date.now() - startTime;
        
        // Log del acceso
        securityLogger.logAccess(req, res, responseTime, {
          requestId
        });

        // Llamar al end original
        originalEnd.call(res, chunk, encoding);
      };
    }

    next();
  };
}

/**
 * Funciones de utilidad para logging específico
 */
export const LoggingUtils = {
  /**
   * Log de inicio de aplicación
   */
  logApplicationStart(service: string, port: number, environment: string) {
    const securityLogger = SecurityLogger.getInstance();
    securityLogger.logInfo(`🚀 ${service} started`, {
      service,
      action: 'APPLICATION_START',
      metadata: {
        port,
        environment,
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
      }
    });
  },

  /**
   * Log de cierre de aplicación
   */
  logApplicationShutdown(service: string, reason: string) {
    const securityLogger = SecurityLogger.getInstance();
    securityLogger.logInfo(`🛑 ${service} shutting down`, {
      service,
      action: 'APPLICATION_SHUTDOWN',
      metadata: {
        reason,
        uptime: process.uptime()
      }
    });
  },

  /**
   * Log de conexión a base de datos
   */
  logDatabaseConnection(status: 'connected' | 'disconnected' | 'error', details?: any) {
    const securityLogger = SecurityLogger.getInstance();
    const level = status === 'error' ? 'error' : 'info';
    
    securityLogger.logger.log(level, `Database ${status}`, {
      action: `DATABASE_${status.toUpperCase()}`,
      metadata: details
    });
  },

  /**
   * Log de operaciones CRUD
   */
  logCRUDOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    resource: string,
    success: boolean,
    context: Partial<LogContext> = {}
  ) {
    const securityLogger = SecurityLogger.getInstance();
    const level = success ? 'audit' : 'error';
    
    securityLogger.logger.log(level, `${operation} ${resource}`, {
      action: `CRUD_${operation}`,
      resource,
      metadata: {
        success,
        ...context.metadata
      },
      ...context
    });
  }
};

// Instancia singleton para uso global
export const securityLogger = SecurityLogger.getInstance();

export default {
  SecurityLogger,
  securityLogger,
  createLoggingMiddleware,
  LoggingUtils,
  logger
};
