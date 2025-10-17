import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Service is healthy",
    timestamp: new Date().toISOString(),
    service: "invoice-service",
    version: "1.0.0",
  });
});

export default router;
EOF && cat > invoice.routes.ts << "EOF";
import { Router } from "express";

const router = Router();

// Placeholder invoice routes - to be implemented
router.post("/create", (req, res) => {
  res.json({
    success: false,
    message: "Invoice routes not yet implemented",
    endpoint: "/create",
  });
});

router.get("/:id", (req, res) => {
  res.json({
    success: false,
    message: "Invoice routes not yet implemented",
    endpoint: "/:id",
  });
});

import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servicio de facturas
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
 *                   example: "ok"
 *                 service:
 *                   type: string
 *                   example: "invoice-service"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "invoice-service",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;

router.put("/:id", (req, res) => {
  res.json({
    success: false,
    message: "Invoice routes not yet implemented",
    endpoint: "/:id",
  });
});

export default router;
