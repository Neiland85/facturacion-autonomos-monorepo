import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

// Interfaces
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

interface JWTPayload {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Middleware de autenticación JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token de acceso requerido',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    logger.warn('Token inválido', { token: token.substring(0, 20) + '...' });
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      error: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    (req as AuthenticatedRequest).user = decoded;
  } catch (error) {
    // Ignorar errores en autenticación opcional
    logger.debug('Token opcional inválido', { error: error instanceof Error ? error.message : 'Unknown error' });
  }

  next();
};

/**
 * Middleware de autorización por roles
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasRole = roles.some(role => authReq.user!.roles.includes(role));
    
    if (!hasRole) {
      logger.warn('Acceso denegado por rol', {
        userId: authReq.user!.id,
        requiredRoles: roles,
        userRoles: authReq.user!.roles
      });
      
      return res.status(403).json({
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles
      });
    }

    next();
  };
};

/**
 * Middleware de autorización por permisos
 */
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasPermission = permissions.some(permission => 
      authReq.user!.permissions.includes(permission)
    );
    
    if (!hasPermission) {
      logger.warn('Acceso denegado por permiso', {
        userId: authReq.user!.id,
        requiredPermissions: permissions,
        userPermissions: authReq.user!.permissions
      });
      
      return res.status(403).json({
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions
      });
    }

    next();
  };
};

/**
 * Middleware de validación de API Key (para integraciones externas)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API Key requerida',
      code: 'MISSING_API_KEY'
    });
  }

  // TODO: Implementar validación real de API Key contra base de datos
  // Por ahora validamos contra variable de entorno
  const validApiKey = process.env.VALID_API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    logger.warn('API Key inválida', { apiKey: apiKey.substring(0, 8) + '...' });
    return res.status(401).json({
      error: 'API Key inválida',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

export { AuthenticatedRequest };
