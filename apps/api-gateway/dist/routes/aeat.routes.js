"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aeatRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const aeatRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.post('/sii/facturas-emitidas', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'POST', '/api/aeat/sii/facturas-emitidas', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT SII facturas emitidas', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error enviando facturas al SII' });
        }
    });
    router.post('/sii/facturas-recibidas', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'POST', '/api/aeat/sii/facturas-recibidas', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT SII facturas recibidas', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error enviando facturas recibidas al SII' });
        }
    });
    router.get('/sii/status', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'GET', '/api/aeat/sii/status', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT SII status', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error consultando estado del SII' });
        }
    });
    router.get('/certificates', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'GET', '/api/aeat/certificates', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT certificates', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo certificados' });
        }
    });
    router.post('/certificates', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'POST', '/api/aeat/certificates', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT certificates POST', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error subiendo certificado' });
        }
    });
    router.post('/validate-nif', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('aeat', 'POST', '/api/aeat/validate-nif', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en AEAT validate NIF', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error validando NIF' });
        }
    });
    return router;
};
exports.aeatRoutes = aeatRoutes;
//# sourceMappingURL=aeat.routes.js.map