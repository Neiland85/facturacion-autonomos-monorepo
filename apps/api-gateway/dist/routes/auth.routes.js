"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const authRoutes = (serviceRegistry, circuitBreaker) => {
    const router = (0, express_1.Router)();
    router.post('/login', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody,
        onError: (err, req, res) => {
            logger_1.logger.error('Error en proxy auth/login', { error: err.message });
            res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
        }
    }));
    router.post('/register', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody,
        onError: (err, req, res) => {
            logger_1.logger.error('Error en proxy auth/register', { error: err.message });
            res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
        }
    }));
    router.post('/refresh', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody
    }));
    router.post('/logout', auth_middleware_1.authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody
    }));
    router.get('/me', auth_middleware_1.authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        }
    }));
    router.put('/profile', auth_middleware_1.authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody
    }));
    router.post('/password/change', auth_middleware_1.authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody
    }));
    router.post('/password/reset', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody
    }));
    router.use('*', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: serviceRegistry.getService('auth')?.url,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1/auth': '/api/auth'
        },
        onProxyReq: http_proxy_middleware_1.fixRequestBody,
        onError: (err, req, res) => {
            logger_1.logger.error('Error en proxy auth general', { error: err.message });
            res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
        }
    }));
    return router;
};
exports.authRoutes = authRoutes;
//# sourceMappingURL=auth.routes.js.map