import { Router } from 'express';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const monitoringRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/monitoring/health:
   *   get:
   *     summary: Estado de salud de todos los servicios
   *     tags: [Monitoreo]
   *     responses:
   *       200:
   *         description: Estado de todos los servicios
   */
  router.get('/health', async (req, res) => {
    try {
      const allHealth = serviceRegistry.getAllHealthStatus();
      const healthArray = Array.from(allHealth.entries()).map(([name, health]) => ({
        service: name,
        ...health
      }));

      const overallStatus = healthArray.every(h => h.status === 'healthy') ? 'healthy' :
                           healthArray.some(h => h.status === 'unhealthy') ? 'unhealthy' : 'degraded';

      res.json({
        overall: overallStatus,
        timestamp: new Date().toISOString(),
        services: healthArray
      });
    } catch (error) {
      logger.error('Error obteniendo health status', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo estado de servicios' });
    }
  });

  /**
   * @swagger
   * /api/v1/monitoring/circuit-breakers:
   *   get:
   *     summary: Estado de todos los circuit breakers
   *     tags: [Monitoreo]
   */
  router.get('/circuit-breakers', (req, res) => {
    try {
      const stats = circuitBreaker.getAllStats();
      res.json({
        timestamp: new Date().toISOString(),
        circuitBreakers: stats
      });
    } catch (error) {
      logger.error('Error obteniendo circuit breaker stats', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo estadísticas de circuit breakers' });
    }
  });

  /**
   * @swagger
   * /api/v1/monitoring/services:
   *   get:
   *     summary: Lista de todos los servicios registrados
   *     tags: [Monitoreo]
   */
  router.get('/services', (req, res) => {
    try {
      const services = serviceRegistry.getAllServices();
      const serviceArray = Array.from(services.entries()).map(([name, config]) => ({
        name,
        url: config.url,
        timeout: config.timeout,
        retries: config.retries
      }));

      res.json({
        timestamp: new Date().toISOString(),
        count: serviceArray.length,
        services: serviceArray
      });
    } catch (error) {
      logger.error('Error obteniendo servicios', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo lista de servicios' });
    }
  });

  /**
   * @swagger
   * /api/v1/monitoring/health/{serviceName}:
   *   get:
   *     summary: Estado de salud de un servicio específico
   *     tags: [Monitoreo]
   *     parameters:
   *       - in: path
   *         name: serviceName
   *         required: true
   *         schema:
   *           type: string
   */
  router.get('/health/:serviceName', async (req, res) => {
    try {
      const { serviceName } = req.params;
      const health = await serviceRegistry.checkServiceHealth(serviceName);
      
      res.json({
        service: serviceName,
        timestamp: new Date().toISOString(),
        ...health
      });
    } catch (error) {
      logger.error(`Error checking health for ${req.params.serviceName}`, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      res.status(404).json({ error: `Servicio ${req.params.serviceName} no encontrado` });
    }
  });

  /**
   * @swagger
   * /api/v1/monitoring/circuit-breakers/{serviceName}/force-open:
   *   post:
   *     summary: Forzar apertura de circuit breaker
   *     tags: [Monitoreo]
   *     parameters:
   *       - in: path
   *         name: serviceName
   *         required: true
   *         schema:
   *           type: string
   */
  router.post('/circuit-breakers/:serviceName/force-open', (req, res) => {
    try {
      const { serviceName } = req.params;
      circuitBreaker.forceOpen(serviceName);
      
      res.json({
        message: `Circuit breaker forzado a abierto para ${serviceName}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error forcing circuit breaker open for ${req.params.serviceName}`, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      res.status(500).json({ error: 'Error forzando circuit breaker' });
    }
  });

  /**
   * @swagger
   * /api/v1/monitoring/circuit-breakers/{serviceName}/force-close:
   *   post:
   *     summary: Forzar cierre de circuit breaker
   *     tags: [Monitoreo]
   *     parameters:
   *       - in: path
   *         name: serviceName
   *         required: true
   *         schema:
   *           type: string
   */
  router.post('/circuit-breakers/:serviceName/force-close', (req, res) => {
    try {
      const { serviceName } = req.params;
      circuitBreaker.forceClose(serviceName);
      
      res.json({
        message: `Circuit breaker forzado a cerrado para ${serviceName}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error forcing circuit breaker close for ${req.params.serviceName}`, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      res.status(500).json({ error: 'Error forzando circuit breaker' });
    }
  });

  return router;
};
