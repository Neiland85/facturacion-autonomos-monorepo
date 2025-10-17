import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
      return;
    }

    // Verify token
    const decoded = AuthService.verifyAccessToken(token);

    // Check if user exists and is active
    const user = await AuthService.findUserById(decoded.userId);
    if (!user?.isActive) {
      res.status(401).json({
        success: false,
        message: "Token inválido o usuario inactivo",
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "No autorizado",
      });
      return;
    }

    const user = await AuthService.findUserById(req.user.userId);
    if (!user?.emailVerified) {
      res.status(403).json({
        success: false,
        message:
          "Email no verificado. Por favor verifica tu email antes de continuar.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
