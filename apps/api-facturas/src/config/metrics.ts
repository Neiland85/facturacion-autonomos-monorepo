import { collectDefaultMetrics, Registry, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Crear un registro personalizado para las métricas
export const register = new Registry();

// Recopilar métricas predeterminadas (CPU, memoria, etc.)
collectDefaultMetrics({ register });

// Métricas personalizadas para HTTP
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const activeConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Número de conexiones activas',
  registers: [register]
});

// Métricas de negocio
export const invoicesCreated = new Counter({
  name: 'invoices_created_total',
  help: 'Total de facturas creadas',
  labelNames: ['type', 'status'],
  registers: [register]
});

export const invoiceProcessingDuration = new Histogram({
  name: 'invoice_processing_duration_seconds',
  help: 'Duración del procesamiento de facturas en segundos',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

export const invoiceErrors = new Counter({
  name: 'invoice_errors_total',
  help: 'Total de errores en el procesamiento de facturas',
  labelNames: ['error_type', 'operation'],
  registers: [register]
});

// Middleware para medir métricas HTTP
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Incrementar conexiones activas
  activeConnections.inc();
  
  // Interceptar el final de la respuesta
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Registrar métricas
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
    httpRequestTotal.labels(method, route, statusCode).inc();
    
    // Decrementar conexiones activas
    activeConnections.dec();
  });
  
  next();
};