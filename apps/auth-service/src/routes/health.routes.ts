import express from 'express';

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
router.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Auth Service is running',
    service: 'auth-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    docs: {
      swagger: '/api-docs',
      json: '/swagger.json'
    }
  });
});

export default router;