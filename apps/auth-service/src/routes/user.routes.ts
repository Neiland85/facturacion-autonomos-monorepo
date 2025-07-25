import express from 'express';
import { authenticateToken, requireAdmin, requireOwnership } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { schemas, validate } from '../middleware/validation.middleware';
import { AuthService } from '../services/auth.service';
import { TwoFactorService } from '../services/two-factor.service';

const router = express.Router();
const authService = new AuthService();
const twoFactorService = new TwoFactorService();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *         twoFactorEnabled:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */
router.get('/me', authenticateToken, asyncHandler(async (req: any, res) => {
  try {
    const user = await authService.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar datos sensibles
    const { password, twoFactorSecret, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Error obteniendo perfil usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}));

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar información del usuario actual
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
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
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.put('/me', 
  authenticateToken,
  validate(schemas.updateProfile),
  asyncHandler(async (req: any, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      // Verificar si el email ya está en uso por otro usuario
      if (email && email !== req.user.email) {
        const existingUser = await authService.findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }

      // Actualizar usuario
      const updatedUser = await authService.updateUser(userId, { name, email });

      const { password, twoFactorSecret, ...safeUser } = updatedUser;

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: safeUser
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  })
);

/**
 * @swagger
 * /api/users/me/sessions:
 *   get:
 *     summary: Obtener sesiones activas del usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones activas
 */
router.get('/me/sessions', authenticateToken, asyncHandler(async (req: any, res) => {
  try {
    const sessions = await authService.getUserActiveSessions(req.user.id);
    
    res.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        ip: session.ip,
        userAgent: session.userAgent,
        isCurrent: session.id === req.sessionID
      }))
    });
  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}));

/**
 * @swagger
 * /api/users/me/sessions/{sessionId}:
 *   delete:
 *     summary: Cerrar sesión específica
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *       404:
 *         description: Sesión no encontrada
 */
router.delete('/me/sessions/:sessionId', 
  authenticateToken, 
  asyncHandler(async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const success = await authService.revokeUserSession(userId, sessionId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  })
);

/**
 * @swagger
 * /api/users/me/2fa/status:
 *   get:
 *     summary: Obtener estado de 2FA del usuario
 *     tags: [Users, 2FA]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Estado de 2FA
 */
router.get('/me/2fa/status', authenticateToken, asyncHandler(async (req: any, res) => {
  try {
    const status = await twoFactorService.get2FAStatus(req.user.id);
    
    res.json({
      success: true,
      twoFactor: status
    });
  } catch (error) {
    console.error('Error obteniendo estado 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}));

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Obtener usuario por ID (Solo admin o propietario)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información del usuario
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:userId', 
  authenticateToken,
  requireOwnership('userId'),
  asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await authService.findUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const { password, twoFactorSecret, ...safeUser } = user;

      res.json({
        success: true,
        user: safeUser
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  })
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios (Solo admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Sin permisos de administrador
 */
router.get('/', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      
      const result = await authService.listUsers(page, limit);

      res.json({
        success: true,
        users: result.users.map(user => {
          const { password, twoFactorSecret, ...safeUser } = user;
          return safeUser;
        }),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error listando usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  })
);

export { router as userRoutes };
