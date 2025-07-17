"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.healthRoutes = router;
router.get('/', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'auth-service',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        }
    };
    logger_1.logger.info('Health check performed', { healthData });
    res.status(200).json(healthData);
});
router.get('/ready', async (req, res) => {
    try {
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Readiness check failed', { error });
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=health.routes.js.map