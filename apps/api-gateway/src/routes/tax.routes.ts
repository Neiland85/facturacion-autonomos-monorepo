import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const taxRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/taxes/calculate:
   *   post:
   *     summary: Calcular impuestos
   *     tags: [Impuestos]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/calculate', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'tax',
        'POST',
        '/api/taxes/calculate',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en tax calculate', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error calculando impuestos' });
    }
  });

  /**
   * @swagger
   * /api/v1/taxes/rates:
   *   get:
   *     summary: Obtener tipos de IVA actuales
   *     tags: [Impuestos]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/rates', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'tax',
        'GET',
        '/api/taxes/rates',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en tax rates', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo tipos de IVA' });
    }
  });

  /**
   * @swagger
   * /api/v1/taxes/periods:
   *   get:
   *     summary: Obtener períodos fiscales disponibles
   *     tags: [Impuestos]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/periods', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'tax',
        'GET',
        `/api/taxes/periods?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en tax periods', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo períodos fiscales' });
    }
  });

  /**
   * @swagger
   * /api/v1/taxes/declarations:
   *   get:
   *     summary: Obtener declaraciones fiscales
   *     tags: [Impuestos]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/declarations', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'tax',
        'GET',
        `/api/taxes/declarations?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en tax declarations GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo declaraciones' });
    }
  });

  /**
   * @swagger
   * /api/v1/taxes/declarations:
   *   post:
   *     summary: Crear nueva declaración fiscal
   *     tags: [Impuestos]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/declarations', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'tax',
        'POST',
        '/api/taxes/declarations',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en tax declarations POST', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error creando declaración' });
    }
  });

  return router;
};
