"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const storageRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.post('/upload', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'POST', '/api/storage/upload', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage upload', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error subiendo archivo' });
        }
    });
    router.get('/files', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'GET', `/api/storage/files?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage files GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo archivos' });
        }
    });
    router.get('/files/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'GET', `/api/storage/files/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage file download', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error descargando archivo' });
        }
    });
    router.delete('/files/:id', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'DELETE', `/api/storage/files/${req.params.id}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage file delete', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error eliminando archivo' });
        }
    });
    router.post('/backup', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'POST', '/api/storage/backup', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage backup', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error creando backup' });
        }
    });
    router.get('/backups', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'GET', `/api/storage/backups?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage backups GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo backups' });
        }
    });
    router.post('/restore', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('storage', 'POST', '/api/storage/restore', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en storage restore', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error restaurando backup' });
        }
    });
    return router;
};
exports.storageRoutes = storageRoutes;
//# sourceMappingURL=storage.routes.js.map