import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const clientRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/clients:
   *   get:
   *     summary: Obtener lista de clientes
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'client',
        'GET',
        `/api/clients?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en clients GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo clientes' });
    }
  });

  /**
   * @swagger
   * /api/v1/clients:
   *   post:
   *     summary: Crear nuevo cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'client',
        'POST',
        '/api/clients',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en clients POST', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error creando cliente' });
    }
  });

  /**
   * @swagger
   * /api/v1/clients/{id}:
   *   get:
   *     summary: Obtener cliente por ID
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'client',
        'GET',
        `/api/clients/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en client GET by ID', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo cliente' });
    }
  });

  /**
   * @swagger
   * /api/v1/clients/{id}:
   *   put:
   *     summary: Actualizar cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'client',
        'PUT',
        `/api/clients/${req.params.id}`,
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en client PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error actualizando cliente' });
    }
  });

  /**
   * @swagger
   * /api/v1/clients/{id}:
   *   delete:
   *     summary: Eliminar cliente
   *     tags: [Clientes]
   *     security:
   *       - bearerAuth: []
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'client',
        'DELETE',
        `/api/clients/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en client DELETE', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error eliminando cliente' });
    }
  });

  return router;
};
