import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const invoiceRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/invoices:
   *   get:
   *     summary: Obtener lista de facturas
   *     tags: [Facturas]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Elementos por página
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'invoice',
        'GET',
        `/api/invoices?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en invoices GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo facturas' });
    }
  });

  /**
   * @swagger
   * /api/v1/invoices:
   *   post:
   *     summary: Crear nueva factura
   *     tags: [Facturas]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'invoice',
        'POST',
        '/api/invoices',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en invoices POST', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error creando factura' });
    }
  });

  /**
   * @swagger
   * /api/v1/invoices/{id}:
   *   get:
   *     summary: Obtener factura por ID
   *     tags: [Facturas]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'invoice',
        'GET',
        `/api/invoices/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en invoice GET by ID', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo factura' });
    }
  });

  /**
   * @swagger
   * /api/v1/invoices/{id}:
   *   put:
   *     summary: Actualizar factura
   *     tags: [Facturas]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'invoice',
        'PUT',
        `/api/invoices/${req.params.id}`,
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en invoice PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error actualizando factura' });
    }
  });

  /**
   * @swagger
   * /api/v1/invoices/{id}:
   *   delete:
   *     summary: Eliminar factura
   *     tags: [Facturas]
   *     security:
   *       - bearerAuth: []
   */
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'invoice',
        'DELETE',
        `/api/invoices/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en invoice DELETE', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error eliminando factura' });
    }
  });

  return router;
};
