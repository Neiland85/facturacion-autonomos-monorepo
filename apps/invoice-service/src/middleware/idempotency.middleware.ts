import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

// Configurar Redis para idempotencia
const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  password: process.env.REDIS_PASSWORD,
});

/**
 * Middleware para implementar idempotencia en operaciones críticas
 * Previene duplicación de requests usando un ID de idempotencia
 */
export const idempotent = (ttlSeconds: number = 300) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string;

      if (!idempotencyKey) {
        res.status(400).json({
          success: false,
          error: 'Idempotency-Key header is required for this operation',
          code: 'MISSING_IDEMPOTENCY_KEY',
        });
        return;
      }

      // Validar formato del key (debe ser un UUID o similar)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idempotencyKey)) {
        res.status(400).json({
          success: false,
          error: 'Invalid Idempotency-Key format. Must be a valid UUID.',
          code: 'INVALID_IDEMPOTENCY_KEY',
        });
        return;
      }

      const cacheKey = `idempotency:${req.user?.id ?? 'anonymous'}:${req.path}:${idempotencyKey}`;

      // Verificar si ya existe una respuesta cacheada
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse) {
        const parsedResponse = JSON.parse(cachedResponse);
        res.status(parsedResponse.statusCode).json(parsedResponse.body);
        return;
      }

      // Almacenar función para capturar la respuesta
      const originalJson = res.json;
      res.json = function (body: any) {
        // Cachear la respuesta
        const responseToCache = {
          statusCode: res.statusCode,
          body,
          timestamp: Date.now(),
        };

        redis.setex(cacheKey, ttlSeconds, JSON.stringify(responseToCache));

        // Llamar al método original
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      next(error);
    }
  };
};

/**
 * Limpiar keys de idempotencia expiradas (mantenimiento)
 */
export const cleanupExpiredIdempotencyKeys = async (): Promise<void> => {
  try {
    // Este método podría ejecutarse periódicamente para limpiar keys expiradas
    // En Redis, las keys con TTL se eliminan automáticamente
    const keys = await redis.keys('idempotency:*');
    console.log(`Found ${keys.length} idempotency keys`);
  } catch (error) {
    console.error('Error cleaning up idempotency keys:', error);
  }
};
