import winston from 'winston';

// Configuración del logger para Invoice Service
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, service = 'invoice-service', ...meta }) => {
      const logObject: any = {
        timestamp,
        level,
        service,
        message
      };
      
      if (stack) {
        logObject.stack = stack;
      }
      
      if (Object.keys(meta).length > 0) {
        logObject.meta = meta;
      }
      
      return JSON.stringify(logObject);
    })
  ),
  defaultMeta: { service: 'invoice-service' },
  transports: []
});

// Console transport
logger.add(new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

// File transport para producción
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: process.env.LOG_FILE || 'logs/invoice-service.log',
    level: process.env.LOG_LEVEL || 'info',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true
  }));

  // Error log file
  logger.add(new winston.transports.File({
    filename: 'logs/invoice-service-error.log',
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true
  }));
}

// Utility functions for structured logging
export const logInvoiceCreated = (invoiceId: string, userId?: string) => {
  logger.info('Invoice created', {
    invoiceId,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const logInvoiceUpdated = (invoiceId: string, userId?: string) => {
  logger.info('Invoice updated', {
    invoiceId,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const logPDFGenerated = (invoiceId: string, userId?: string) => {
  logger.info('PDF generated', {
    invoiceId,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const logInvoiceSent = (invoiceId: string, recipient: string, userId?: string) => {
  logger.info('Invoice sent', {
    invoiceId,
    recipient,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const logSecurityEvent = (event: string, userId?: string, details?: any) => {
  logger.warn('Security event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logError = (error: Error, context?: any) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};
