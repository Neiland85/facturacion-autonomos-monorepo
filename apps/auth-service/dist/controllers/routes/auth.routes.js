"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const async_handler_middleware_1 = require("../middleware/async-handler.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = express_1.default.Router();
exports.authRoutes = router;
const authController = new auth_controller_1.AuthController();
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
router.post('/register', validation_middleware_1.validateRegister, (0, async_handler_middleware_1.asyncHandler)(authController.register));
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
router.post('/login', validation_middleware_1.validateLogin, (0, async_handler_middleware_1.asyncHandler)(authController.login));
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
router.post('/logout', (0, async_handler_middleware_1.asyncHandler)(authController.logout));
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
router.post('/refresh', validation_middleware_1.validateRefresh, (0, async_handler_middleware_1.asyncHandler)(authController.refresh));
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
router.get('/me', auth_middleware_1.authenticateToken, (0, async_handler_middleware_1.asyncHandler)(authController.me));
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
router.post('/2fa/setup', auth_middleware_1.authenticateToken, (0, async_handler_middleware_1.asyncHandler)(authController.setup2FA));
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
router.post('/2fa/verify', auth_middleware_1.authenticateToken, (0, async_handler_middleware_1.asyncHandler)(authController.verify2FA));
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
router.post('/2fa/disable', auth_middleware_1.authenticateToken, (0, async_handler_middleware_1.asyncHandler)(authController.disable2FA));
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
router.post('/change-password', auth_middleware_1.authenticateToken, (0, async_handler_middleware_1.asyncHandler)(authController.changePassword));
