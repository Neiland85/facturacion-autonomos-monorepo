import express from "express";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado del servicio de cálculo de impuestos
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
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 message:
 *                   type: string
 *                   example: "Tax Calculator Service is healthy"
 *                 service:
 *                   type: string
 *                   example: "tax-calculator"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", async (req: express.Request, res: express.Response) => {
  const checks = {
    database: false,
    aeat: false,
    overall: false,
  };

  try {
    // Verificar base de datos (simulado por ahora)
    // TODO: Implementar verificación real de Prisma
    checks.database = true;

    // Verificar configuración AEAT
    const aeatPublicKey = process.env.AEAT_PUBLIC_KEY;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    checks.aeat = !!(aeatPublicKey && webhookSecret);

    checks.overall = checks.database && checks.aeat;

    const statusCode = checks.overall ? 200 : 503;
    const status = checks.overall ? "healthy" : "unhealthy";

    res.status(statusCode).json({
      success: checks.overall,
      status,
      message: checks.overall
        ? "Tax Calculator Service is healthy"
        : "Tax Calculator Service has issues",
      service: "tax-calculator",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      checks: {
        database: checks.database ? "up" : "down",
        aeat: checks.aeat ? "configured" : "not configured",
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      message: "Tax Calculator Service health check failed",
      service: "tax-calculator",
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "Internal error",
    });
  }
});

// Health check simple
router.get("/ping", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "pong",
    service: "tax-calculator",
    timestamp: new Date().toISOString(),
  });
});

export default router;
