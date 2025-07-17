import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const aeatRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/aeat/sii/facturas-emitidas:
   *   post:
   *     summary: Enviar facturas emitidas al SII
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/sii/facturas-emitidas', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'POST',
        '/api/aeat/sii/facturas-emitidas',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT SII facturas emitidas', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error enviando facturas al SII' });
    }
  });

  /**
   * @swagger
   * /api/v1/aeat/sii/facturas-recibidas:
   *   post:
   *     summary: Enviar facturas recibidas al SII
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/sii/facturas-recibidas', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'POST',
        '/api/aeat/sii/facturas-recibidas',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT SII facturas recibidas', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error enviando facturas recibidas al SII' });
    }
  });

  /**
   * @swagger
   * /api/v1/aeat/sii/status:
   *   get:
   *     summary: Consultar estado de conexión con SII
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/sii/status', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'GET',
        '/api/aeat/sii/status',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT SII status', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error consultando estado del SII' });
    }
  });

  /**
   * @swagger
   * /api/v1/aeat/certificates:
   *   get:
   *     summary: Obtener lista de certificados disponibles
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/certificates', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'GET',
        '/api/aeat/certificates',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT certificates', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo certificados' });
    }
  });

  /**
   * @swagger
   * /api/v1/aeat/certificates:
   *   post:
   *     summary: Subir nuevo certificado
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/certificates', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'POST',
        '/api/aeat/certificates',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT certificates POST', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error subiendo certificado' });
    }
  });

  /**
   * @swagger
   * /api/v1/aeat/validate-nif:
   *   post:
   *     summary: Validar NIF/CIF contra bases de datos de AEAT
   *     tags: [AEAT]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/validate-nif', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'aeat',
        'POST',
        '/api/aeat/validate-nif',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en AEAT validate NIF', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error validando NIF' });
    }
  });

  return router;
};
