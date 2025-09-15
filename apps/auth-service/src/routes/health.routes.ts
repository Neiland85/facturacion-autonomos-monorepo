import express from "express";
import Redis from "ioredis";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado del servicio de autenticación
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Auth Service is running"
 *                 service:
 *                   type: string
 *                   example: "auth-service"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 docs:
 *                   type: object
 *                   properties:
 *                     swagger:
 *                       type: string
 *                       example: "/api-docs"
 *                     json:
 *                       type: string
 *                       example: "/swagger.json"
 */
router.get("/", async (req: express.Request, res: express.Response) => {
  const checks = {
    redis: false,
    database: false,
    overall: false,
  };

  try {
    // Verificar Redis
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      });

      await redis.ping();
      checks.redis = true;
      await redis.quit();
    } catch (error) {
      console.warn("Redis health check failed:", error);
    }

    // Verificar base de datos (simulado por ahora)
    // TODO: Implementar verificación real de Prisma
    checks.database = true;

    checks.overall = checks.redis && checks.database;

    const statusCode = checks.overall ? 200 : 503;
    const status = checks.overall ? "healthy" : "unhealthy";

    res.status(statusCode).json({
      success: checks.overall,
      status,
      message: checks.overall
        ? "Auth Service is healthy"
        : "Auth Service has issues",
      service: "auth-service",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      checks: {
        redis: checks.redis ? "up" : "down",
        database: checks.database ? "up" : "down",
      },
      docs: {
        swagger: "/api-docs",
        json: "/swagger.json",
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      message: "Auth Service health check failed",
      service: "auth-service",
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "Internal error",
    });
  }
});

// Health check simple (sin dependencias)
router.get("/ping", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "pong",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  });
});

export default router;
