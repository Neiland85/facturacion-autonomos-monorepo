import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Definir el tipo de usuario autenticado
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
}

// Extender Request para incluir user tipado
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT de la cookie o header Authorization
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

    // Intentar obtener token de la cookie primero
    let token = req.cookies?.accessToken;

    // Si no hay token en cookie, intentar del header Authorization
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
      });
      return;
    }

    // Verificar token con opciones de seguridad
    const decoded = jwt.verify(
      token,
      jwtSecret,
      {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'facturacion-autonomos',
        audience: process.env.JWT_AUDIENCE || 'facturacion-autonomos'
      }
    ) as jwt.JwtPayload;

    // Validar campos requeridos del token
    if (!decoded.id || !decoded.email) {
      res.status(401).json({
        success: false,
        error: 'Token JWT inválido: campos requeridos faltantes',
      });
      return;
    }

    // Validar rol si es requerido
    const validRoles = ['user', 'admin', 'premium'];
    if (decoded.role && !validRoles.includes(decoded.role)) {
      res.status(403).json({
        success: false,
        error: 'Rol de usuario no válido',
      });
      return;
    }

    // Inyectar usuario en request
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
