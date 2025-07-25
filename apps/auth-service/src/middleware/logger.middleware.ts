import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface LogEntry {
  requestId: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  userId?: string;
  timestamp: string;
  error?: string;
}

/**
 * Middleware de logging personalizado para Auth Service
 * Proporciona logging estructurado y correlación de requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  // Agregar requestId al request para poder usarlo en otros middlewares
  (req as any).requestId = requestId;

  const logEntry: LogEntry = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id
  };

  // Log del request entrante
  console.log(`📥 [${requestId}] ${req.method} ${req.url}`, {
    ip: logEntry.ip,
    userAgent: logEntry.userAgent,
    body: req.method !== 'GET' ? sanitizeLogData(req.body) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userId: req.user?.id
  });

  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    logEntry.statusCode = res.statusCode;
    logEntry.responseTime = responseTime;

    // Log de respuesta con diferentes niveles según status
    const logLevel = getLogLevel(res.statusCode);
    const logMessage = `📤 [${requestId}] ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`;

    if (logLevel === 'error') {
      console.error(logMessage, {
        ...logEntry,
        responseData: sanitizeLogData(data)
      });
    } else if (logLevel === 'warn') {
      console.warn(logMessage, logEntry);
    } else {
      console.log(logMessage, logEntry);
    }

    // Métricas para monitoreo (en producción se enviarían a servicio de métricas)
    logMetrics(logEntry);

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware específico para logging de autenticación
 */
export const authLogger = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const logData = {
      requestId: (req as any).requestId,
      action: getAuthAction(req.path),
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: res.statusCode < 400,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    };

    if (logData.success) {
      console.log(`🔐 AUTH SUCCESS: ${logData.action}`, {
        email: logData.email,
        ip: logData.ip,
        requestId: logData.requestId
      });
    } else {
      console.warn(`🚫 AUTH FAILED: ${logData.action}`, {
        email: logData.email,
        ip: logData.ip,
        statusCode: logData.statusCode,
        requestId: logData.requestId
      });
      
      // Log adicional para intentos sospechosos
      if (shouldFlagSuspiciousActivity(req, res)) {
        console.error(`🚨 SUSPICIOUS AUTH ACTIVITY`, {
          ...logData,
          userAgent: logData.userAgent,
          body: sanitizeLogData(req.body)
        });
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware para logging de errores de seguridad
 */
export const securityLogger = (event: string, req: Request, details?: any): void => {
  console.warn(`🛡️ SECURITY EVENT: ${event}`, {
    requestId: (req as any).requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    details
  });
};

/**
 * Determinar el nivel de log según status code
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Obtener la acción de autenticación desde la ruta
 */
function getAuthAction(path: string): string {
  if (path.includes('/login')) return 'LOGIN';
  if (path.includes('/register')) return 'REGISTER';
  if (path.includes('/logout')) return 'LOGOUT';
  if (path.includes('/refresh')) return 'REFRESH_TOKEN';
  if (path.includes('/2fa')) return 'TWO_FACTOR';
  if (path.includes('/password')) return 'CHANGE_PASSWORD';
  return 'UNKNOWN_AUTH_ACTION';
}

/**
 * Detectar actividad sospechosa
 */
function shouldFlagSuspiciousActivity(req: Request, res: Response): boolean {
  // Múltiples intentos fallidos desde la misma IP
  if (res.statusCode === 401 && req.path.includes('/login')) {
    return true;
  }
  
  // Intentos de acceso a endpoints no existentes
  if (res.statusCode === 404) {
    return true;
  }
  
  // Requests con User-Agent sospechoso
  const userAgent = req.get('User-Agent')?.toLowerCase() || '';
  const suspiciousUAs = ['curl', 'wget', 'python', 'bot', 'crawler', 'scanner'];
  if (suspiciousUAs.some(ua => userAgent.includes(ua))) {
    return true;
  }
  
  return false;
}

/**
 * Sanitizar datos sensibles para logging
 */
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Registrar métricas para monitoreo
 */
function logMetrics(logEntry: LogEntry): void {
  // En producción, estas métricas se enviarían a servicios como Prometheus, DataDog, etc.
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo de métricas que serían útiles:
    // - Tiempo de respuesta por endpoint
    // - Códigos de estado por endpoint
    // - Requests por minuto
    // - Errores por tipo
    // - Actividad de autenticación
    
    console.debug('📊 METRICS:', {
      endpoint: `${logEntry.method} ${logEntry.url}`,
      responseTime: logEntry.responseTime,
      statusCode: logEntry.statusCode,
      timestamp: logEntry.timestamp
    });
  }
}

/**
 * Crear logger contextual para operaciones específicas
 */
export const createContextLogger = (context: string, requestId?: string) => {
  return {
    info: (message: string, data?: any) => {
      console.log(`ℹ️ [${context}${requestId ? ` - ${requestId}` : ''}] ${message}`, data);
    },
    warn: (message: string, data?: any) => {
      console.warn(`⚠️ [${context}${requestId ? ` - ${requestId}` : ''}] ${message}`, data);
    },
    error: (message: string, data?: any) => {
      console.error(`❌ [${context}${requestId ? ` - ${requestId}` : ''}] ${message}`, data);
    },
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`🐛 [${context}${requestId ? ` - ${requestId}` : ''}] ${message}`, data);
      }
    }
  };
};
