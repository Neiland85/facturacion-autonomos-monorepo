import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  FATAL: 4;
}

export const LogLevels: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Logger centralizado para Auth Service
 * Proporciona logging estructurado, rotación de logs y diferentes niveles
 */
export class Logger {
  private static instance: Logger;
  private logLevel: number;
  private logStream?: WriteStream;
  private logToFile: boolean;
  private logDir: string;

  private constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logDir = process.env.LOG_DIR || './logs';
    
    if (this.logToFile) {
      this.initializeFileLogging();
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevelFromEnv(): number {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LogLevels[envLevel as keyof LogLevel] ?? LogLevels.INFO;
  }

  private initializeFileLogging(): void {
    try {
      const logFile = join(this.logDir, `auth-service-${new Date().toISOString().split('T')[0]}.log`);
      this.logStream = createWriteStream(logFile, { flags: 'a' });
      
      this.logStream.on('error', (error) => {
        console.error('Error escribiendo al archivo de log:', error);
        this.logToFile = false;
      });
    } catch (error) {
      console.error('Error inicializando logging a archivo:', error);
      this.logToFile = false;
    }
  }

  private formatLogEntry(level: keyof LogLevel, message: string, data?: any, context?: {
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeLogData(data),
      requestId: context?.requestId,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
    };
  }

  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'jwt', 'session', 'cookie', 'authorization', 'apikey'
    ];

    const sanitizeRecursive = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeRecursive(item));
      }

      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const keyLower = key.toLowerCase();
          if (sensitiveFields.some(field => keyLower.includes(field))) {
            result[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            result[key] = sanitizeRecursive(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }

      return obj;
    };

    return sanitizeRecursive(sanitized);
  }

  private writeLog(logEntry: LogEntry): void {
    const logString = JSON.stringify(logEntry);
    
    // Log a consola con colores
    this.writeToConsole(logEntry);
    
    // Log a archivo si está habilitado
    if (this.logToFile && this.logStream) {
      this.logStream.write(logString + '\n');
    }
  }

  private writeToConsole(logEntry: LogEntry): void {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[logEntry.level] || '';
    
    const contextInfo = [
      logEntry.requestId ? `[${logEntry.requestId}]` : '',
      logEntry.userId ? `[User:${logEntry.userId}]` : '',
    ].filter(Boolean).join(' ');
    
    const prefix = `${color}[${logEntry.timestamp}] [${logEntry.level}]${reset} ${contextInfo}`;
    const message = `${prefix} ${logEntry.message}`;
    
    if (logEntry.data) {
      console.log(message, logEntry.data);
    } else {
      console.log(message);
    }
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LogLevels[level] >= this.logLevel;
  }

  public debug(message: string, data?: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    if (this.shouldLog('DEBUG')) {
      const logEntry = this.formatLogEntry('DEBUG', message, data, context);
      this.writeLog(logEntry);
    }
  }

  public info(message: string, data?: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    if (this.shouldLog('INFO')) {
      const logEntry = this.formatLogEntry('INFO', message, data, context);
      this.writeLog(logEntry);
    }
  }

  public warn(message: string, data?: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    if (this.shouldLog('WARN')) {
      const logEntry = this.formatLogEntry('WARN', message, data, context);
      this.writeLog(logEntry);
    }
  }

  public error(message: string, data?: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    if (this.shouldLog('ERROR')) {
      const logEntry = this.formatLogEntry('ERROR', message, data, context);
      this.writeLog(logEntry);
    }
  }

  public fatal(message: string, data?: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    if (this.shouldLog('FATAL')) {
      const logEntry = this.formatLogEntry('FATAL', message, data, context);
      this.writeLog(logEntry);
    }
  }

  // Métodos específicos para auth service
  public authSuccess(action: string, email: string, context?: { requestId?: string; ip?: string; userAgent?: string }): void {
    this.info(`AUTH SUCCESS: ${action}`, { email }, context);
  }

  public authFailure(action: string, email: string, reason: string, context?: { requestId?: string; ip?: string; userAgent?: string }): void {
    this.warn(`AUTH FAILURE: ${action}`, { email, reason }, context);
  }

  public securityEvent(event: string, details: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    this.warn(`SECURITY EVENT: ${event}`, details, context);
  }

  public suspiciousActivity(activity: string, details: any, context?: { requestId?: string; userId?: string; ip?: string; userAgent?: string }): void {
    this.error(`SUSPICIOUS ACTIVITY: ${activity}`, details, context);
  }

  // Cerrar streams al finalizar
  public close(): void {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

// Instancia singleton del logger
export const logger = Logger.getInstance();

// Helper functions para compatibilidad
export const logDebug = (message: string, data?: any, context?: any) => logger.debug(message, data, context);
export const logInfo = (message: string, data?: any, context?: any) => logger.info(message, data, context);
export const logWarn = (message: string, data?: any, context?: any) => logger.warn(message, data, context);
export const logError = (message: string, data?: any, context?: any) => logger.error(message, data, context);
export const logFatal = (message: string, data?: any, context?: any) => logger.fatal(message, data, context);

// Cleanup al cerrar el proceso
process.on('SIGTERM', () => {
  logger.close();
});

process.on('SIGINT', () => {
  logger.close();
});

process.on('exit', () => {
  logger.close();
});
