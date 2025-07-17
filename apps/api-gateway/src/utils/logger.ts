import winston from 'winston';
import { config } from '../config';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, service = 'api-gateway', ...meta }) => {
    const logObject = {
      timestamp,
      level,
      service,
      message,
      ...(stack && { stack }),
      ...(Object.keys(meta).length > 0 && { meta })
    };
    return JSON.stringify(logObject);
  })
);

// Configuración de transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// File transport para producción
if (config.nodeEnv === 'production') {
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      level: config.logging.level,
      format: customFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  defaultMeta: { service: 'api-gateway' },
  transports,
  // No salir en caso de error
  exitOnError: false
});

// Stream para Morgan
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Funciones de conveniencia
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    requestId: req.id
  });
};

export const logError = (error: Error, req?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.id
    })
  });
};

export const logServiceCall = (serviceName: string, method: string, url: string, duration: number, success: boolean) => {
  logger.info('Service Call', {
    service: serviceName,
    method,
    url,
    duration: `${duration}ms`,
    success
  });
};

export default logger;
