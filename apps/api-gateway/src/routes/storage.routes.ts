import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const storageRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/storage/upload:
   *   post:
   *     summary: Subir archivo
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/upload', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'POST',
        '/api/storage/upload',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage upload', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error subiendo archivo' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/files:
   *   get:
   *     summary: Listar archivos
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/files', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'GET',
        `/api/storage/files?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage files GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo archivos' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/files/{id}:
   *   get:
   *     summary: Descargar archivo
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/files/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'GET',
        `/api/storage/files/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage file download', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error descargando archivo' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/files/{id}:
   *   delete:
   *     summary: Eliminar archivo
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.delete('/files/:id', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'DELETE',
        `/api/storage/files/${req.params.id}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage file delete', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error eliminando archivo' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/backup:
   *   post:
   *     summary: Crear backup de datos
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/backup', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'POST',
        '/api/storage/backup',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage backup', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error creando backup' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/backups:
   *   get:
   *     summary: Listar backups disponibles
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/backups', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'GET',
        `/api/storage/backups?${new URLSearchParams(req.query as any).toString()}`,
        undefined,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage backups GET', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error obteniendo backups' });
    }
  });

  /**
   * @swagger
   * /api/v1/storage/restore:
   *   post:
   *     summary: Restaurar desde backup
   *     tags: [Almacenamiento]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/restore', authenticateToken, async (req, res) => {
    try {
      const result = await serviceRegistry.callService(
        'storage',
        'POST',
        '/api/storage/restore',
        req.body,
        {
          'Authorization': req.headers.authorization!
        }
      );
      res.status(result.status).json(result.data);
    } catch (error) {
      logger.error('Error en storage restore', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ error: 'Error restaurando backup' });
    }
  });

  return router;
};
