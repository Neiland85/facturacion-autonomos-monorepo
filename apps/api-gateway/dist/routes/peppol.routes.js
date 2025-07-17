"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peppolRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const peppolRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.post('/send', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'POST', '/api/peppol/send', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL send', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error enviando factura PEPPOL' });
        }
    });
    router.post('/validate', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'POST', '/api/peppol/validate', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL validate', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error validando factura PEPPOL' });
        }
    });
    router.get('/participants', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'GET', `/api/peppol/participants?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL participants', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error buscando participantes PEPPOL' });
        }
    });
    router.get('/messages', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'GET', `/api/peppol/messages?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL messages', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo mensajes PEPPOL' });
        }
    });
    router.get('/status', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'GET', '/api/peppol/status', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL status', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error consultando estado PEPPOL' });
        }
    });
    router.post('/convert', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('peppol', 'POST', '/api/peppol/convert', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en PEPPOL convert', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error convirtiendo a UBL' });
        }
    });
    return router;
};
exports.peppolRoutes = peppolRoutes;
//# sourceMappingURL=peppol.routes.js.map