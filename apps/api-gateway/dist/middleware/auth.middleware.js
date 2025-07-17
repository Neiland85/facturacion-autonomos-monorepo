"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = exports.requirePermission = exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Token de acceso requerido',
            code: 'MISSING_TOKEN'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.logger.warn('Token inválido', { token: token.substring(0, 20) + '...' });
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
    }
    catch (error) {
        logger_1.logger.debug('Token opcional inválido', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireRole = (...roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                error: 'Autenticación requerida',
                code: 'AUTH_REQUIRED'
            });
        }
        const hasRole = roles.some(role => authReq.user.roles.includes(role));
        if (!hasRole) {
            logger_1.logger.warn('Acceso denegado por rol', {
                userId: authReq.user.id,
                requiredRoles: roles,
                userRoles: authReq.user.roles
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
exports.requireRole = requireRole;
const requirePermission = (...permissions) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                error: 'Autenticación requerida',
                code: 'AUTH_REQUIRED'
            });
        }
        const hasPermission = permissions.some(permission => authReq.user.permissions.includes(permission));
        if (!hasPermission) {
            logger_1.logger.warn('Acceso denegado por permiso', {
                userId: authReq.user.id,
                requiredPermissions: permissions,
                userPermissions: authReq.user.permissions
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
exports.requirePermission = requirePermission;
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({
            error: 'API Key requerida',
            code: 'MISSING_API_KEY'
        });
    }
    const validApiKey = process.env.VALID_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
        logger_1.logger.warn('API Key inválida', { apiKey: apiKey.substring(0, 8) + '...' });
        return res.status(401).json({
            error: 'API Key inválida',
            code: 'INVALID_API_KEY'
        });
    }
    next();
};
exports.validateApiKey = validateApiKey;
//# sourceMappingURL=auth.middleware.js.map