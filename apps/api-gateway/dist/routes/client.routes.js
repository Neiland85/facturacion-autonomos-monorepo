"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const clientRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('client', 'GET', `/api/clients?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en clients GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo clientes' });
        }
    });
    router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('client', 'POST', '/api/clients', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en clients POST', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error creando cliente' });
        }
    });
    router.get('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('client', 'GET', `/api/clients/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en client GET by ID', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo cliente' });
        }
    });
    router.put('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('client', 'PUT', `/api/clients/${req.params.id}`, req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en client PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error actualizando cliente' });
        }
    });
    router.delete('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('client', 'DELETE', `/api/clients/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en client DELETE', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error eliminando cliente' });
        }
    });
    return router;
};
exports.clientRoutes = clientRoutes;
//# sourceMappingURL=client.routes.js.map