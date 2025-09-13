import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateLogin, validateRefreshToken, validateRegister, } from '../middleware/validation.middleware';
const router = express.Router();
const authController = new AuthController();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
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
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         headers:
 *           Set-Cookie:
 *             description: Session cookie con httpOnly y secure
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.post('/register', validateRegister, asyncHandler(authController.register));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
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
 *               remember:
 *                 type: boolean
 *                 description: Extender duración de sesión
 *     responses:
 *       200:
 *         description: Login exitoso
 *         headers:
 *           Set-Cookie:
 *             description: JWT token en cookie httpOnly, secure, sameSite=strict
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 requiresTwoFactor:
 *                   type: boolean
 */
router.post('/login', validateLogin, asyncHandler(authController.login));
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie limpiada
 *             schema:
 *               type: string
 */
router.post('/logout', asyncHandler(authController.logout));
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token renovado
 *         headers:
 *           Set-Cookie:
 *             description: Nuevo JWT token
 */
router.post('/refresh', validateRefreshToken, asyncHandler(authController.refresh));
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 */
router.get('/me', authenticateToken, asyncHandler(authController.me));
/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Configurar autenticación de dos factores
 *     tags: [Auth, 2FA]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: QR code para configurar 2FA
 */
router.post('/2fa/setup', authenticateToken, asyncHandler(authController.setup2FA));
/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Verificar código 2FA
 *     tags: [Auth, 2FA]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *     responses:
 *       200:
 *         description: 2FA verificado exitosamente
 */
router.post('/2fa/verify', authenticateToken, asyncHandler(authController.verify2FA));
/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Deshabilitar autenticación de dos factores
 *     tags: [Auth, 2FA]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 2FA deshabilitado
 */
router.post('/2fa/disable', authenticateToken, asyncHandler(authController.disable2FA));
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 */
router.post('/change-password', authenticateToken, asyncHandler(authController.changePassword));
export { router as authRoutes };
//# sourceMappingURL=auth.routes.js.map