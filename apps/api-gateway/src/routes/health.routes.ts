import axios from "axios";
import express from "express";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado del API Gateway y servicios conectados
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API Gateway funcionando correctamente
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
 *                   example: "API Gateway is healthy"
 *                 service:
 *                   type: string
 *                   example: "api-gateway"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: "up"
 *                     invoice:
 *                       type: string
 *                       example: "up"
 *                     tax:
 *                       type: string
 *                       example: "up"
 */
router.get("/", async (req: express.Request, res: express.Response) => {
  const services = {
    auth: false,
    invoice: false,
    tax: false,
    overall: false,
  };

  try {
    // Verificar servicio de autenticación
    try {
      const authResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL || "http://localhost:3003"}/api/health`,
        { timeout: 5000 }
      );
      services.auth = authResponse.status === 200;
    } catch (error) {
      console.warn("Auth service health check failed:", error.message);
    }

    // Verificar servicio de facturas
    try {
      const invoiceResponse = await axios.get(
        `${process.env.INVOICE_SERVICE_URL || "http://localhost:3002"}/api/health`,
        { timeout: 5000 }
      );
      services.invoice = invoiceResponse.status === 200;
    } catch (error) {
      console.warn("Invoice service health check failed:", error.message);
    }

    // Verificar servicio de impuestos
    try {
      const taxResponse = await axios.get(
        `${process.env.TAX_CALCULATOR_URL || "http://localhost:3004"}/api/health`,
        { timeout: 5000 }
      );
      services.tax = taxResponse.status === 200;
    } catch (error) {
      console.warn(
        "Tax calculator service health check failed:",
        error.message
      );
    }

    services.overall = services.auth && services.invoice && services.tax;

    const statusCode = services.overall ? 200 : 503;
    const status = services.overall ? "healthy" : "degraded";

    res.status(statusCode).json({
      success: services.overall,
      status,
      message: services.overall
        ? "API Gateway is healthy"
        : "API Gateway is degraded - some services are down",
      service: "api-gateway",
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
      services: {
        auth: services.auth ? "up" : "down",
        invoice: services.invoice ? "up" : "down",
        tax: services.tax ? "up" : "down",
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      message: "API Gateway health check failed",
      service: "api-gateway",
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
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

// Health check detallado de servicios
router.get("/services", async (req: express.Request, res: express.Response) => {
  const serviceChecks = [];

  const services = [
    {
      name: "auth",
      url: process.env.AUTH_SERVICE_URL || "http://localhost:3003",
    },
    {
      name: "invoice",
      url: process.env.INVOICE_SERVICE_URL || "http://localhost:3002",
    },
    {
      name: "tax",
      url: process.env.TAX_CALCULATOR_URL || "http://localhost:3004",
    },
  ];

  for (const service of services) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${service.url}/api/health`, {
        timeout: 5000,
      });
      const responseTime = Date.now() - startTime;

      serviceChecks.push({
        name: service.name,
        url: service.url,
        status: "up",
        responseTime: `${responseTime}ms`,
        version: response.data?.version || "unknown",
      });
    } catch (error) {
      serviceChecks.push({
        name: service.name,
        url: service.url,
        status: "down",
        error: error.message,
      });
    }
  }

  res.json({
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    services: serviceChecks,
  });
});

export default router;
