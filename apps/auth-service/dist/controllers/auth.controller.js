"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const users = [];
const refreshTokens = new Set();
class AuthController {
    async register(req, res) {
        const { email, password, firstName, lastName, companyName, phone } = req.body;
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            throw new errorHandler_1.ConflictError('User with this email already exists');
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            companyName,
            phone,
            role: 'user',
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(newUser);
        const { accessToken, refreshToken } = this.generateTokens(newUser);
        refreshTokens.add(refreshToken);
        (0, logger_1.logUserRegistration)(email, req.ip);
        const userResponse = this.excludePassword(newUser);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 24 * 60 * 60
                }
            }
        });
    }
    async login(req, res) {
        const { email, password, rememberMe = false } = req.body;
        const user = users.find(u => u.email === email);
        if (!user) {
            (0, logger_1.logAuthAttempt)(email, false, req.ip);
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            (0, logger_1.logAuthAttempt)(email, false, req.ip);
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        user.lastLoginAt = new Date();
        user.updatedAt = new Date();
        const { accessToken, refreshToken } = this.generateTokens(user, rememberMe);
        refreshTokens.add(refreshToken);
        (0, logger_1.logAuthAttempt)(email, true, req.ip);
        const userResponse = this.excludePassword(user);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60
                }
            }
        });
    }
    async refreshToken(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken || !refreshTokens.has(refreshToken)) {
            throw new errorHandler_1.AuthenticationError('Invalid refresh token');
        }
        try {
            const jwtSecret = process.env.JWT_REFRESH_SECRET;
            if (!jwtSecret) {
                throw new errorHandler_1.AuthenticationError('JWT refresh secret not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtSecret);
            const user = users.find(u => u.id === decoded.userId);
            if (!user) {
                refreshTokens.delete(refreshToken);
                throw new errorHandler_1.AuthenticationError('User not found');
            }
            refreshTokens.delete(refreshToken);
            const tokens = this.generateTokens(user);
            refreshTokens.add(tokens.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    tokens: {
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: 24 * 60 * 60
                    }
                }
            });
        }
        catch (error) {
            refreshTokens.delete(refreshToken);
            throw new errorHandler_1.AuthenticationError('Invalid refresh token');
        }
    }
    async logout(req, res) {
        const authHeader = req.headers.authorization;
        const refreshToken = req.body.refreshToken;
        if (refreshToken) {
            refreshTokens.delete(refreshToken);
        }
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
    async forgotPassword(req, res) {
        const { email } = req.body;
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User with this email does not exist');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'password_reset' }, jwtSecret, { expiresIn: '1h' });
        (0, logger_1.logPasswordReset)(email, req.ip);
        logger_1.logger.info('Password reset token generated', {
            email,
            resetToken,
            expiresIn: '1 hour'
        });
        res.status(200).json({
            success: true,
            message: 'Password reset instructions sent to your email',
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    }
    async resetPassword(req, res) {
        const { token, password } = req.body;
        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new errorHandler_1.ValidationError('JWT secret not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (decoded.type !== 'password_reset') {
                throw new errorHandler_1.ValidationError('Invalid token type');
            }
            const user = users.find(u => u.id === decoded.userId);
            if (!user) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashedPassword;
            user.updatedAt = new Date();
            logger_1.logger.info('Password reset successful', { userId: user.id, email: user.email });
            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_1.ValidationError('Invalid or expired reset token');
            }
            throw error;
        }
    }
    async verifyEmail(req, res) {
        const { token } = req.body;
        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new errorHandler_1.ValidationError('JWT secret not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (decoded.type !== 'email_verification') {
                throw new errorHandler_1.ValidationError('Invalid token type');
            }
            const user = users.find(u => u.id === decoded.userId);
            if (!user) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            user.isEmailVerified = true;
            user.updatedAt = new Date();
            logger_1.logger.info('Email verified successfully', { userId: user.id, email: user.email });
            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_1.ValidationError('Invalid or expired verification token');
            }
            throw error;
        }
    }
    generateTokens(user, rememberMe = false) {
        const jwtSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtSecret || !jwtRefreshSecret) {
            throw new Error('JWT secrets not configured');
        }
        const accessTokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        const refreshTokenPayload = {
            userId: user.id,
            type: 'refresh'
        };
        const accessToken = jsonwebtoken_1.default.sign(accessTokenPayload, jwtSecret, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign(refreshTokenPayload, jwtRefreshSecret, { expiresIn: rememberMe ? '30d' : '7d' });
        return { accessToken, refreshToken };
    }
    excludePassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map