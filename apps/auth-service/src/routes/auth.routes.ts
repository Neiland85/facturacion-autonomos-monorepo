import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  authenticateToken,
  requireEmailVerification,
} from "../middleware/auth.middleware";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware";
import { validateBody, authValidation } from "../validation/auth.validation";

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Usuario ya existe
 */
router.post(
  "/register",
  idempotencyMiddleware(),
  validateBody(authValidation.register),
  AuthController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", validateBody(authValidation.login), AuthController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *       401:
 *         description: Refresh token inválido
 */
router.post(
  "/refresh",
  validateBody(authValidation.refresh),
  AuthController.refresh
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post("/logout", AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */
router.get("/me", authenticateToken, AuthController.me);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email enviado si el usuario existe
 */
router.post(
  "/forgot-password",
  validateBody(authValidation.forgotPassword),
  AuthController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Resetear contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
 *       400:
 *         description: Token inválido
 */
router.post(
  "/reset-password",
  idempotencyMiddleware(),
  validateBody(authValidation.resetPassword),
  AuthController.resetPassword
);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verificar email
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: Token inválido
 */
router.post(
  "/verify-email",
  validateBody(authValidation.verifyEmail),
  AuthController.verifyEmail
);

export default router;
