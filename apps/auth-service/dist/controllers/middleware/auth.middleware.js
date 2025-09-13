"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.optionalAuth = exports.requireOwnership = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const auth_service_1 = require("../services/auth.service");
const jwt_service_1 = require("../services/jwt.service");
const jwtService = new jwt_service_1.JWTService();
const authService = new auth_service_1.AuthService();
/**
 * Middleware para verificar JWT desde cookies HttpOnly
 */
const authenticateToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        if (!accessToken) {
            res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
            return;
        }
        // Verificar access token
        const payload = await jwtService.verifyAccessToken(accessToken);
        if (payload) {
            // Token válido - verificar que el usuario existe
            const user = await authService.findUserById(payload.userId);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }
            req.user = {
                id: payload.userId,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId
            };
            next();
            return;
        }
        // Access token inválido/expirado - intentar refresh
        if (refreshToken) {
            const newAccessToken = await jwtService.refreshAccessToken(refreshToken);
            if (newAccessToken) {
                // Establecer nuevo access token en cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000 // 15 minutos
                });
                // Verificar el nuevo token y continuar
                const newPayload = await jwtService.verifyAccessToken(newAccessToken);
                if (newPayload) {
                    const user = await authService.findUserById(newPayload.userId);
                    if (!user) {
                        res.status(401).json({
                            success: false,
                            message: 'Usuario no encontrado'
                        });
                        return;
                    }
                    req.user = {
                        id: newPayload.userId,
                        email: newPayload.email,
                        role: newPayload.role,
                        sessionId: newPayload.sessionId
                    };
                    next();
                    return;
                }
            }
        }
        // Tanto access como refresh token son inválidos
        res.status(401).json({
            success: false,
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        });
    }
    catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware para verificar roles específicos
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Permisos insuficientes'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware para verificar que el usuario es admin
 */
exports.requireAdmin = (0, exports.requireRole)(['ADMIN']);
/**
 * Middleware para verificar que el usuario es el propietario del recurso
 */
const requireOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
            return;
        }
        const resourceUserId = req.params[userIdParam];
        // Admin puede acceder a cualquier recurso
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        // Usuario normal solo puede acceder a sus propios recursos
        if (req.user.id !== resourceUserId) {
            res.status(403).json({
                success: false,
                message: 'Solo puedes acceder a tus propios recursos'
            });
            return;
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (accessToken) {
            const payload = await jwtService.verifyAccessToken(accessToken);
            if (payload) {
                const user = await authService.findUserById(payload.userId);
                if (user) {
                    req.user = {
                        id: payload.userId,
                        email: payload.email,
                        role: payload.role,
                        sessionId: payload.sessionId
                    };
                }
            }
        }
        next();
    }
    catch (error) {
        console.error('Error en autenticación opcional:', error);
        next(); // Continuar sin autenticación
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Middleware para limpiar cookies de autenticación
 */
const clearAuthCookies = (req, res, next) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    next();
};
exports.clearAuthCookies = clearAuthCookies;
