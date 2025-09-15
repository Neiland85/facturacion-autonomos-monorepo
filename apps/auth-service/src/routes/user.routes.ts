import express from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', authenticateToken, asyncHandler(async (req: any, res: express.Response) => {
  // TODO: Implementar lógica para obtener perfil del usuario
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role || 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nuevo nombre del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo correo electrónico
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Email ya está en uso
 */
router.put('/profile', authenticateToken, asyncHandler(async (req: any, res: express.Response) => {
  // TODO: Implementar lógica para actualizar perfil
  const { name, email } = req.body;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: req.user?.id,
      email: email || req.user?.email,
      name: name || req.user?.name,
      role: req.user?.role || 'user',
      isActive: true,
      createdAt: req.user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
}));

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
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
 *                 description: Contraseña actual
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos o contraseña actual incorrecta
 *       401:
 *         description: No autorizado
 */
router.post('/change-password', authenticateToken, asyncHandler(async (req: any, res: express.Response) => {
  // TODO: Implementar lógica para cambiar contraseña
  const { currentPassword, newPassword } = req.body;

  // Validar que la nueva contraseña sea diferente
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password',
      error: 'INVALID_PASSWORD',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Password changed successfully',
    timestamp: new Date().toISOString()
  });
}));

export default router;