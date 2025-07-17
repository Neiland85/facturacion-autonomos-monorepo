import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const notificationRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/notifications:
   *   get:
   *     summary: Obtener notificaciones del usuario
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'GET',
        `/api/notifications?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en notifications GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo notificaciones' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications:
   *   post:
   *     summary: Crear nueva notificación
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'POST',
        '/api/notifications',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en notifications POST', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error creando notificación' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications/{id}/read:
   *   put:
   *     summary: Marcar notificación como leída
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'PUT',
        `/api/notifications/${req.params.id}/read`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en notification mark as read', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error marcando notificación como leída' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications/mark-all-read:
   *   put:
   *     summary: Marcar todas las notificaciones como leídas
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/mark-all-read', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'PUT',
        '/api/notifications/mark-all-read',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en mark all notifications as read', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error marcando todas las notificaciones como leídas' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications/preferences:
   *   get:
   *     summary: Obtener preferencias de notificación
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/preferences', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'GET',
        '/api/notifications/preferences',
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en notification preferences GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo preferencias' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications/preferences:
   *   put:
   *     summary: Actualizar preferencias de notificación
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/preferences', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'PUT',
        '/api/notifications/preferences',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en notification preferences PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error actualizando preferencias' });
    }
  });

  /**
   * @swagger
   * /api/v1/notifications/send-email:
   *   post:
   *     summary: Enviar notificación por email
   *     tags: [Notificaciones]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/send-email', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'notification',
        'POST',
        '/api/notifications/send-email',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en send email notification', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error enviando email' });
    }
  });

  return router;
};
