import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Interface for authenticated user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
}

/**
 * Extend Express Request to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header (Bearer token)
 * This service uses only Bearer token authentication (no cookies)
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      console.error('JWT_ACCESS_SECRET environment variable is not configured');
      res.status(500).json({
        success: false,
        error: 'Configuración de autenticación faltante',
      });
      return;
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token with security options
    const decoded = jwt.verify(
      token,
      jwtSecret,
      {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'facturacion-autonomos',
        audience: process.env.JWT_AUDIENCE || 'facturacion-autonomos'
      }
    ) as jwt.JwtPayload;

    // Validate required fields
    if (!decoded.id || !decoded.email) {
      res.status(401).json({
        success: false,
        error: 'Token JWT inválido: campos requeridos faltantes',
      });
      return;
    }

    // Validate role if present
    const validRoles = ['user', 'admin', 'premium'];
    if (decoded.role && !validRoles.includes(decoded.role)) {
      res.status(403).json({
        success: false,
        error: 'Rol de usuario no válido',
      });
      return;
    }

    // Inject user into request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error de autenticación',
    });
  }
};
