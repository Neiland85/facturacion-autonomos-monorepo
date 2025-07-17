import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const peppolRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/peppol/send:
   *   post:
   *     summary: Enviar factura vía PEPPOL
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/send', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'POST',
        '/api/peppol/send',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL send', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error enviando factura PEPPOL' });
    }
  });

  /**
   * @swagger
   * /api/v1/peppol/validate:
   *   post:
   *     summary: Validar factura UBL contra esquemas PEPPOL BIS 3.0
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/validate', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'POST',
        '/api/peppol/validate',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL validate', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error validando factura PEPPOL' });
    }
  });

  /**
   * @swagger
   * /api/v1/peppol/participants:
   *   get:
   *     summary: Buscar participantes en red PEPPOL
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/participants', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'GET',
        `/api/peppol/participants?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL participants', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error buscando participantes PEPPOL' });
    }
  });

  /**
   * @swagger
   * /api/v1/peppol/messages:
   *   get:
   *     summary: Obtener mensajes recibidos vía PEPPOL
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/messages', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'GET',
        `/api/peppol/messages?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL messages', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo mensajes PEPPOL' });
    }
  });

  /**
   * @swagger
   * /api/v1/peppol/status:
   *   get:
   *     summary: Consultar estado de conexión PEPPOL
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/status', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'GET',
        '/api/peppol/status',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL status', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error consultando estado PEPPOL' });
    }
  });

  /**
   * @swagger
   * /api/v1/peppol/convert:
   *   post:
   *     summary: Convertir factura a formato UBL
   *     tags: [PEPPOL]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/convert', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'peppol',
        'POST',
        '/api/peppol/convert',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en PEPPOL convert', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error convirtiendo a UBL' });
    }
  });

  return router;
};
