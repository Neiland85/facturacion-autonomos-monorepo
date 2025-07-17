"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const taxRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.post('/calculate', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('tax', 'POST', '/api/taxes/calculate', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en tax calculate', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error calculando impuestos' });
        }
    });
    router.get('/rates', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('tax', 'GET', '/api/taxes/rates', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en tax rates', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo tipos de IVA' });
        }
    });
    router.get('/periods', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('tax', 'GET', `/api/taxes/periods?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en tax periods', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo períodos fiscales' });
        }
    });
    router.get('/declarations', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('tax', 'GET', `/api/taxes/declarations?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en tax declarations GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo declaraciones' });
        }
    });
    router.post('/declarations', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('tax', 'POST', '/api/taxes/declarations', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en tax declarations POST', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error creando declaración' });
        }
    });
    return router;
};
exports.taxRoutes = taxRoutes;
//# sourceMappingURL=tax.routes.js.map