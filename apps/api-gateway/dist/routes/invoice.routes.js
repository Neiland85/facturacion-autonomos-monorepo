"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const invoiceRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('invoice', 'GET', `/api/invoices?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en invoices GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo facturas' });
        }
    });
    router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('invoice', 'POST', '/api/invoices', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en invoices POST', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error creando factura' });
        }
    });
    router.get('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('invoice', 'GET', `/api/invoices/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en invoice GET by ID', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo factura' });
        }
    });
    router.put('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('invoice', 'PUT', `/api/invoices/${req.params.id}`, req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en invoice PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error actualizando factura' });
        }
    });
    router.delete('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('invoice', 'DELETE', `/api/invoices/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en invoice DELETE', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error eliminando factura' });
        }
    });
    return router;
};
exports.invoiceRoutes = invoiceRoutes;
//# sourceMappingURL=invoice.routes.js.map