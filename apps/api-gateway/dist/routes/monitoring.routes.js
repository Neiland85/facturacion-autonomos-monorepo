"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const monitoringRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.get('/health', async (req, res) => {
        try {
            const allHealth = serviceRegistry.getAllHealthStatus();
            const healthArray = Array.from(allHealth.entries()).map(([name, health]) => ({
                service: name,
                ...health
            }));
            const overallStatus = healthArray.every(h => h.status === 'healthy') ? 'healthy' :
                healthArray.some(h => h.status === 'unhealthy') ? 'unhealthy' : 'degraded';
            res.json({
                overall: overallStatus,
                timestamp: new Date().toISOString(),
                services: healthArray
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo health status', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo estado de servicios' });
        }
    });
    router.get('/circuit-breakers', (req, res) => {
        try {
            const stats = circuitBreaker.getAllStats();
            res.json({
                timestamp: new Date().toISOString(),
                circuitBreakers: stats
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo circuit breaker stats', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo estadísticas de circuit breakers' });
        }
    });
    router.get('/services', (req, res) => {
        try {
            const services = serviceRegistry.getAllServices();
            const serviceArray = Array.from(services.entries()).map(([name, config]) => ({
                name,
                url: config.url,
                timeout: config.timeout,
                retries: config.retries
            }));
            res.json({
                timestamp: new Date().toISOString(),
                count: serviceArray.length,
                services: serviceArray
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo servicios', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo lista de servicios' });
        }
    });
    router.get('/health/:serviceName', async (req, res) => {
        try {
            const { serviceName } = req.params;
            const health = await serviceRegistry.checkServiceHealth(serviceName);
            res.json({
                service: serviceName,
                timestamp: new Date().toISOString(),
                ...health
            });
        }
        catch (error) {
            logger_1.logger.error(`Error checking health for ${req.params.serviceName}`, {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(404).json({ error: `Servicio ${req.params.serviceName} no encontrado` });
        }
    });
    router.post('/circuit-breakers/:serviceName/force-open', (req, res) => {
        try {
            const { serviceName } = req.params;
            circuitBreaker.forceOpen(serviceName);
            res.json({
                message: `Circuit breaker forzado a abierto para ${serviceName}`,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error(`Error forcing circuit breaker open for ${req.params.serviceName}`, {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({ error: 'Error forzando circuit breaker' });
        }
    });
    router.post('/circuit-breakers/:serviceName/force-close', (req, res) => {
        try {
            const { serviceName } = req.params;
            circuitBreaker.forceClose(serviceName);
            res.json({
                message: `Circuit breaker forzado a cerrado para ${serviceName}`,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error(`Error forcing circuit breaker close for ${req.params.serviceName}`, {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            res.status(500).json({ error: 'Error forzando circuit breaker' });
        }
    });
    return router;
};
exports.monitoringRoutes = monitoringRoutes;
//# sourceMappingURL=monitoring.routes.js.map