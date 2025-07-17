"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const notificationRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.get('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'GET', `/api/notifications?${new URLSearchParams(req.query).toString()}`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en notifications GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo notificaciones' });
        }
    });
    router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'POST', '/api/notifications', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en notifications POST', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error creando notificación' });
        }
    });
    router.put('/:id/read', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'PUT', `/api/notifications/${req.params.id}/read`, undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en notification mark as read', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error marcando notificación como leída' });
        }
    });
    router.put('/mark-all-read', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'PUT', '/api/notifications/mark-all-read', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en mark all notifications as read', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error marcando todas las notificaciones como leídas' });
        }
    });
    router.get('/preferences', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'GET', '/api/notifications/preferences', undefined, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en notification preferences GET', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error obteniendo preferencias' });
        }
    });
    router.put('/preferences', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'PUT', '/api/notifications/preferences', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en notification preferences PUT', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error actualizando preferencias' });
        }
    });
    router.post('/send-email', auth_middleware_1.authenticateToken, async (req, res) => {
        try {
            const result = await serviceRegistry.callService('notification', 'POST', '/api/notifications/send-email', req.body, {
                'Authorization': req.headers.authorization
            });
            res.status(result.status).json(result.data);
        }
        catch (error) {
            logger_1.logger.error('Error en send email notification', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({ error: 'Error enviando email' });
        }
    });
    return router;
};
exports.notificationRoutes = notificationRoutes;
//# sourceMappingURL=notification.routes.js.map