import { Request, Response } from "express";
import { AuthService, AuthUser } from "../services/auth.service";
import { authValidation } from "../validation/auth.validation";
import { withTransaction, isUniqueConstraintError } from "@facturacion/database";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Use transaction to prevent race conditions
      const result = await withTransaction(AuthService.getPrisma(), async (tx) => {
        try {
          // Attempt to create user directly (no pre-check to avoid race conditions)
          const user = await AuthService.createUserWithTx(tx, {
            email,
            password,
            name: `${firstName} ${lastName}`.trim(),
          });

          // Generate tokens
          const accessToken = AuthService.generateAccessToken({
            userId: user.id,
            email: user.email,
          });

          const refreshToken = AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email,
          });

          // Store refresh token
          await AuthService.updateRefreshTokenWithTx(tx, user.id, refreshToken);

          return {
            user,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          // Handle unique constraint violation
          if (isUniqueConstraintError(error)) {
            throw new Error("USER_EXISTS");
          }
          throw error;
        }
      });

      res.status(201).json({
        success: true,
        message:
          "Usuario registrado exitosamente. Por favor verifica tu email.",
        data: result,
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.message === "USER_EXISTS") {
        res.status(409).json({
          success: false,
          message: "Ya existe un usuario con este email",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await AuthService.findUserByEmail(email);
      if (!user?.password) {
        res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: "Cuenta desactivada",
        });
        return;
      }

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
        return;
      }

      // Update last login
      await AuthService.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = AuthService.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = AuthService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token
      await AuthService.updateRefreshToken(user.id, refreshToken);

      const userResponse: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      };

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token es requerido",
        });
        return;
      }

      // Verify refresh token
      const decoded = AuthService.verifyRefreshToken(refreshToken);

      // Find user and check if refresh token matches
      const user = await AuthService.findUserByEmail(decoded.email);
      if (!user || user.refreshToken !== refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token inválido",
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: "Cuenta desactivada",
        });
        return;
      }

      // Generate new access token
      const accessToken = AuthService.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: "Token refrescado exitosamente",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(401).json({
        success: false,
        message: "Refresh token inválido o expirado",
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Find user by refresh token and clear it
        const user = await AuthService.findUserByEmail(
          AuthService.verifyRefreshToken(refreshToken).email
        );

        if (user) {
          await AuthService.updateRefreshToken(user.id, null);
        }
      }

      res.json({
        success: true,
        message: "Logout exitoso",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Get current user profile
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      // User should be attached by auth middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "No autorizado",
        });
        return;
      }

      const user = await AuthService.findUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const success = await AuthService.initiatePasswordReset(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message:
          "Si el email existe, recibirás instrucciones para resetear tu contraseña",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      const success = await AuthService.resetPassword(token, password);

      if (!success) {
        res.status(400).json({
          success: false,
          message: "Token inválido o expirado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Contraseña reseteada exitosamente",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      const success = await AuthService.verifyEmail(token);

      if (!success) {
        res.status(400).json({
          success: false,
          message: "Token de verificación inválido o expirado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Email verificado exitosamente",
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}
