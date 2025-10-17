"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware para verificar JWT desde Authorization header
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token de autorización requerido',
            });
            return;
        }
        // Verificar token (usando una clave simple para desarrollo)
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
        req.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role || 'user',
        };
        next();
    }
    catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado',
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map