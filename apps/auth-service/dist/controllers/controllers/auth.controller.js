"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const auth_service_1 = require("../services/auth.service");
const jwt_service_1 = require("../services/jwt.service");
const two_factor_service_1 = require("../services/two-factor.service");
class AuthController {
    authService;
    jwtService;
    twoFactorService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
        this.jwtService = new jwt_service_1.JWTService();
        this.twoFactorService = new two_factor_service_1.TwoFactorService();
    }
    /**
     * Registrar nuevo usuario
     */
    register = async (req, res) => {
        try {
            const { email, password, name } = req.body;
            // Verificar si el usuario ya existe
            const existingUser = await this.authService.findUserByEmail(email);
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    error: 'El usuario ya existe',
                    code: 'USER_EXISTS'
                });
                return;
            }
            // Crear usuario
            const user = await this.authService.createUser({
                email,
                password,
                name
            });
            // Configurar sesión
            req.session.userId = user.id;
            req.session.isAuthenticated = true;
            // Generar JWT y almacenar en cookie httpOnly
            const accessToken = this.jwtService.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            const refreshToken = this.jwtService.generateRefreshToken(user.id);
            // Almacenar refresh token en Redis
            await this.jwtService.storeRefreshToken(user.id, refreshToken);
            // Configurar cookies seguras
            this.setSecureCookies(res, accessToken, refreshToken);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    twoFactorEnabled: false
                }
            });
        }
        catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    };
    /**
     * Iniciar sesión con protección contra ataques de fuerza bruta
     */
    login = async (req, res) => {
        try {
            const { email, password, remember = false } = req.body;
            const clientIP = req.ip || req.connection.remoteAddress;
            // Verificar intentos de login por IP
            const attempts = req.session.loginAttempts || 0;
            const lastAttempt = req.session.lastLoginAttempt || 0;
            const now = Date.now();
            // Rate limiting por sesión (adicional al middleware global)
            if (attempts >= 3 && (now - lastAttempt) < 15 * 60 * 1000) { // 15 minutos
                res.status(429).json({
                    success: false,
                    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
                    code: 'TOO_MANY_ATTEMPTS',
                    retryAfter: Math.ceil((15 * 60 * 1000 - (now - lastAttempt)) / 1000)
                });
                return;
            }
            // Buscar usuario
            const user = await this.authService.findUserByEmail(email);
            if (!user) {
                this.handleFailedLogin(req);
                res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas',
                    code: 'INVALID_CREDENTIALS'
                });
                return;
            }
            // Verificar contraseña
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                this.handleFailedLogin(req);
                res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas',
                    code: 'INVALID_CREDENTIALS'
                });
                return;
            }
            // Verificar si requiere 2FA
            if (user.twoFactorEnabled) {
                req.session.userId = user.id;
                req.session.twoFactorPending = true;
                res.json({
                    success: true,
                    message: 'Se requiere verificación de dos factores',
                    requiresTwoFactor: true
                });
                return;
            }
            // Login exitoso - limpiar intentos fallidos
            this.handleSuccessfulLogin(req, user, remember);
            // Generar tokens JWT
            const accessToken = this.jwtService.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            const refreshToken = this.jwtService.generateRefreshToken(user.id);
            // Almacenar refresh token
            await this.jwtService.storeRefreshToken(user.id, refreshToken);
            // Configurar cookies seguras
            this.setSecureCookies(res, accessToken, refreshToken, remember);
            res.json({
                success: true,
                message: 'Login exitoso',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled
                },
                requiresTwoFactor: false
            });
        }
        catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    };
    /**
     * Cerrar sesión de forma segura
     */
    logout = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            // Invalidar refresh token en Redis si existe
            if (refreshToken) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    await this.jwtService.revokeRefreshToken(decoded.userId);
                }
                catch (error) {
                    console.error('Error invalidating refresh token:', error);
                }
            }
            // Destruir sesión
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
            });
            // Limpiar cookies
            this.clearSecureCookies(res);
            res.json({
                success: true,
                message: 'Logout exitoso'
            });
        }
        catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Renovar token de acceso
     */
    refresh = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    error: 'Refresh token requerido',
                    code: 'MISSING_REFRESH_TOKEN'
                });
                return;
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                // Verificar que el token existe en Redis
                const isValidRefreshToken = await this.jwtService.verifyRefreshToken(decoded.userId, refreshToken);
                if (!isValidRefreshToken) {
                    res.status(401).json({
                        success: false,
                        error: 'Refresh token inválido',
                        code: 'INVALID_REFRESH_TOKEN'
                    });
                    return;
                }
                // Buscar usuario
                const user = await this.authService.findUserById(decoded.userId);
                if (!user) {
                    res.status(401).json({
                        success: false,
                        error: 'Usuario no encontrado',
                        code: 'USER_NOT_FOUND'
                    });
                    return;
                }
                // Generar nuevo access token
                const accessToken = this.jwtService.generateAccessToken({
                    userId: user.id,
                    email: user.email,
                    role: user.role
                });
                // Actualizar cookie
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000, // 15 minutos
                    domain: process.env.COOKIE_DOMAIN
                });
                res.json({
                    success: true,
                    message: 'Token renovado exitosamente'
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    error: 'Refresh token inválido',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }
        }
        catch (error) {
            console.error('Error en refresh:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Obtener información del usuario actual
     */
    me = async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado'
                });
                return;
            }
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled
                }
            });
        }
        catch (error) {
            console.error('Error en me:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Configurar autenticación de dos factores
     */
    setup2FA = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'No autenticado' });
                return;
            }
            const secret = await this.twoFactorService.generateSecret(userId);
            const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
            res.json({
                success: true,
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32
            });
        }
        catch (error) {
            console.error('Error en setup2FA:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Verificar código 2FA
     */
    verify2FA = async (req, res) => {
        try {
            const { token } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'No autenticado' });
                return;
            }
            const isValid = await this.twoFactorService.verifyToken(userId, token);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    error: 'Código 2FA inválido',
                    code: 'INVALID_2FA_TOKEN'
                });
                return;
            }
            // Habilitar 2FA para el usuario
            await this.authService.enable2FA(userId);
            res.json({
                success: true,
                message: 'Autenticación de dos factores habilitada exitosamente'
            });
        }
        catch (error) {
            console.error('Error en verify2FA:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Deshabilitar 2FA
     */
    disable2FA = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'No autenticado' });
                return;
            }
            await this.authService.disable2FA(userId);
            res.json({
                success: true,
                message: 'Autenticación de dos factores deshabilitada'
            });
        }
        catch (error) {
            console.error('Error en disable2FA:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Cambiar contraseña
     */
    changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'No autenticado' });
                return;
            }
            const user = await this.authService.findUserById(userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            // Verificar contraseña actual
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                res.status(400).json({
                    success: false,
                    error: 'Contraseña actual incorrecta',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
                return;
            }
            // Cambiar contraseña
            await this.authService.changePassword(userId, newPassword);
            // Regenerar sesión por seguridad
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Error regenerating session after password change:', err);
                }
            });
            res.json({
                success: true,
                message: 'Contraseña cambiada exitosamente'
            });
        }
        catch (error) {
            console.error('Error en changePassword:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    };
    /**
     * Configurar cookies seguras con JWT
     */
    setSecureCookies(res, accessToken, refreshToken, remember = false) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            domain: process.env.COOKIE_DOMAIN
        };
        // Access token (15 minutos)
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000
        });
        // Refresh token (7 días o 30 días si remember=true)
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
        });
    }
    /**
     * Limpiar cookies de forma segura
     */
    clearSecureCookies(res) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            domain: process.env.COOKIE_DOMAIN
        };
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
    }
    /**
     * Manejar intento de login fallido
     */
    handleFailedLogin(req) {
        req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
        req.session.lastLoginAttempt = Date.now();
    }
    /**
     * Manejar login exitoso
     */
    handleSuccessfulLogin(req, user, remember) {
        req.session.userId = user.id;
        req.session.isAuthenticated = true;
        req.session.loginAttempts = 0;
        req.session.lastLoginAttempt = undefined;
        req.session.twoFactorPending = false;
        // Extender sesión si remember=true
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
        }
    }
}
exports.AuthController = AuthController;
