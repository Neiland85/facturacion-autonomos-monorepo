import express from "express";
const router = express.Router();
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado del servicio de facturas
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
 *                   example: "Invoice Service is healthy"
 *                 service:
 *                   type: string
 *                   example: "invoice-service"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "up"
 *                     fileSystem:
 *                       type: string
 *                       example: "up"
 */
router.get("/", async (req, res) => {
    const checks = {
        database: false,
        fileSystem: false,
        overall: false,
    };
    try {
        // Verificar base de datos (simulado por ahora)
        // TODO: Implementar verificación real de Prisma
        checks.database = true;
        // Verificar sistema de archivos
        try {
            const fs = require("fs").promises;
            const uploadPath = process.env.UPLOAD_PATH || "./uploads";
            // Crear directorio si no existe
            await fs.mkdir(uploadPath, { recursive: true });
            // Verificar permisos de escritura
            const testFile = `${uploadPath}/.health-check`;
            await fs.writeFile(testFile, "test");
            await fs.unlink(testFile);
            checks.fileSystem = true;
        }
        catch (error) {
            console.warn("File system health check failed:", error);
        }
        checks.overall = checks.database && checks.fileSystem;
        const statusCode = checks.overall ? 200 : 503;
        const status = checks.overall ? "healthy" : "unhealthy";
        res.status(statusCode).json({
            success: checks.overall,
            status,
            message: checks.overall
                ? "Invoice Service is healthy"
                : "Invoice Service has issues",
            service: "invoice-service",
            version: process.env.npm_package_version || "1.0.0",
            timestamp: new Date().toISOString(),
            checks: {
                database: checks.database ? "up" : "down",
                fileSystem: checks.fileSystem ? "up" : "down",
            },
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            status: "error",
            message: "Invoice Service health check failed",
            service: "invoice-service",
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === "development"
                ? error.message
                : "Internal error",
        });
    }
});
// Health check simple
router.get("/ping", (req, res) => {
    res.json({
        success: true,
        message: "pong",
        service: "invoice-service",
        timestamp: new Date().toISOString(),
    });
});
export default router;
//# sourceMappingURL=health.routes.js.map