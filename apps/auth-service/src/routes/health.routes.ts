import express from 'express';
import { redis } from '../index';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del Auth Service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: auth-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         connected:
 *                           type: boolean
 *       503:
 *         description: Servicio no disponible
 */
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      dependencies: {
        redis: {
          status: 'unknown',
          connected: false
        }
      }
    };

    // Verificar Redis
    try {
      await redis.ping();
      healthCheck.dependencies.redis = {
        status: 'ok',
        connected: true
      };
    } catch (error) {
      healthCheck.dependencies.redis = {
        status: 'error',
        connected: false
      };
      healthCheck.status = 'degraded';
    }

    const statusCode = healthCheck.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      error: 'Internal health check error'
    });
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Health check detallado con métricas
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Información detallada del servicio
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailed = {
      service: 'auth-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: {
        seconds: process.uptime(),
        human: formatUptime(process.uptime())
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },
      features: {
        httpOnlyCookies: true,
        secureCookies: process.env.NODE_ENV === 'production',
        sameSiteCookies: true,
        twoFactorAuth: true,
        rateLimiting: true,
        sessionStore: 'redis',
        cors: true,
        helmet: true
      },
      dependencies: {
        redis: await checkRedisHealth()
      }
    };

    res.json(detailed);

  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'error',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      error: 'Internal health check error'
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe para Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio listo para recibir tráfico
 *       503:
 *         description: Servicio no está listo
 */
router.get('/ready', async (req, res) => {
  try {
    // Verificar dependencias críticas
    const checks = await Promise.allSettled([
      redis.ping(),
      // Aquí podrías agregar más checks: DB, external APIs, etc.
    ]);

    const allPassed = checks.every(check => check.status === 'fulfilled');

    if (allPassed) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        checks: checks.map((check, index) => ({
          name: ['redis'][index],
          status: check.status,
          error: check.status === 'rejected' ? check.reason.message : undefined
        }))
      });
    }

  } catch (error) {
    res.status(503).json({
      status: 'not-ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe para Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio está vivo
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

// Funciones auxiliares
async function checkRedisHealth() {
  try {
    const start = Date.now();
    await redis.ping();
    const responseTime = Date.now() - start;
    
    const info = await redis.info('server');
    const redisVersion = info.match(/redis_version:(.+)\r\n/)?.[1] || 'unknown';
    
    return {
      status: 'ok',
      connected: true,
      responseTime: `${responseTime}ms`,
      version: redisVersion,
      mode: redis.options.enableOfflineQueue ? 'online' : 'offline'
    };
  } catch (error) {
    return {
      status: 'error',
      connected: false,
      error: error.message
    };
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
}

export { router as healthRoutes };
