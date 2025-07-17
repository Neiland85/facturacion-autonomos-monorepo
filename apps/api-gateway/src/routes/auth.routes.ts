import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
import { logger } from '../utils/logger';

export const authRoutes = (
  serviceRegistry: ServiceRegistry,
  circuitBreaker: CircuitBreakerManager
) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                 accessToken:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   */
  router.post('/login', createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      logger.error('Error en proxy auth/login', { error: err.message });
      res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
    }
  }));

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Registrar nuevo usuario
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *               name:
   *                 type: string
   *               company:
   *                 type: string
   */
  router.post('/register', createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      logger.error('Error en proxy auth/register', { error: err.message });
      res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
    }
  }));

  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Renovar token de acceso
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   */
  router.post('/refresh', createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody
  }));

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     summary: Cerrar sesión
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/logout', authenticateToken, createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody
  }));

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     summary: Obtener información del usuario actual
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   */
  router.get('/me', authenticateToken, createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    }
  }));

  /**
   * @swagger
   * /api/v1/auth/profile:
   *   put:
   *     summary: Actualizar perfil de usuario
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   */
  router.put('/profile', authenticateToken, createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody
  }));

  /**
   * @swagger
   * /api/v1/auth/password/change:
   *   post:
   *     summary: Cambiar contraseña
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   */
  router.post('/password/change', authenticateToken, createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody
  }));

  /**
   * @swagger
   * /api/v1/auth/password/reset:
   *   post:
   *     summary: Solicitar reset de contraseña
   *     tags: [Autenticación]
   */
  router.post('/password/reset', createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody
  }));

  // Ruta catch-all para otras rutas de auth
  router.use('*', createProxyMiddleware({
    target: serviceRegistry.getService('auth')?.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '/api/auth'
    },
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      logger.error('Error en proxy auth general', { error: err.message });
      res.status(500).json({ error: 'Error de comunicación con servicio de autenticación' });
    }
  }));

  return router;
};
