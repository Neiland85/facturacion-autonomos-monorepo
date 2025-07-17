import { Express } from 'express';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { aeatRoutes } from './aeat.routes';
import { authRoutes } from './auth.routes';
import { clientRoutes } from './client.routes';
import { invoiceRoutes } from './invoice.routes';
import { monitoringRoutes } from './monitoring.routes';
import { notificationRoutes } from './notification.routes';
import { peppolRoutes } from './peppol.routes';
import { storageRoutes } from './storage.routes';
import { taxRoutes } from './tax.routes';

/**
 * Configurar todas las rutas del API Gateway
 */
export const setupRoutes = (
  app: Express,
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
): void => {
  
  // Rutas de autenticación
  app.use('/api/v1/auth', authRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de facturas
  app.use('/api/v1/invoices', invoiceRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de clientes
  app.use('/api/v1/clients', clientRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de cálculos fiscales
  app.use('/api/v1/tax', taxRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de integración AEAT
  app.use('/api/v1/aeat', aeatRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de PEPPOL
  app.use('/api/v1/peppol', peppolRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de notificaciones
  app.use('/api/v1/notifications', notificationRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de almacenamiento
  app.use('/api/v1/storage', storageRoutes(serviceRegistry, circuitBreaker));
  
  // Rutas de monitoreo y métricas
  app.use('/api/v1/monitoring', monitoringRoutes(serviceRegistry, circuitBreaker));
};
