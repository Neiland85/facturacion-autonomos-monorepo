"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.validateChangePassword = exports.validateSetup2FA = exports.validateVerify2FA = exports.validateLogin = exports.validateRegister = exports.validateUserAgent = exports.validateIPWhitelist = exports.validatePayloadSize = exports.validateContentType = exports.validateHeaders = exports.sanitizeInput = exports.validate = exports.schemas = void 0;
const zod_1 = require("zod");
/**
 * Esquemas de validación con Zod
 */
exports.schemas = {
    register: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z
                .string()
                .email('Email inválido')
                .min(5, 'Email debe tener al menos 5 caracteres')
                .max(100, 'Email no puede exceder 100 caracteres'),
            password: zod_1.z
                .string()
                .min(8, 'La contraseña debe tener al menos 8 caracteres')
                .max(128, 'La contraseña no puede exceder 128 caracteres')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{};':"\\|,.<>?-])/, 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'),
            name: zod_1.z
                .string()
                .min(2, 'El nombre debe tener al menos 2 caracteres')
                .max(50, 'El nombre no puede exceder 50 caracteres')
                .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
        })
    }),
    login: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z
                .string()
                .email('Email inválido')
                .min(5, 'Email debe tener al menos 5 caracteres'),
            password: zod_1.z
                .string()
                .min(1, 'Contraseña requerida')
        })
    }),
    verify2FA: zod_1.z.object({
        body: zod_1.z.object({
            token: zod_1.z
                .string()
                .min(6, 'El código debe tener al menos 6 caracteres')
                .max(8, 'El código no puede exceder 8 caracteres')
                .regex(/^[A-F0-9]{8}$|^\d{6}$/, 'Formato de código inválido')
        })
    }),
    setup2FA: zod_1.z.object({
        body: zod_1.z.object({
            token: zod_1.z
                .string()
                .length(6, 'El código debe tener exactamente 6 dígitos')
                .regex(/^\d{6}$/, 'El código debe contener solo números')
        })
    }),
    changePassword: zod_1.z.object({
        body: zod_1.z.object({
            currentPassword: zod_1.z
                .string()
                .min(1, 'Contraseña actual requerida'),
            newPassword: zod_1.z
                .string()
                .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
                .max(128, 'La contraseña no puede exceder 128 caracteres')
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{};':"\\|,.<>?-])/, 'La nueva contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial')
        })
    }),
    refreshToken: zod_1.z.object({
        body: zod_1.z.object({
            refreshToken: zod_1.z
                .string()
                .optional() // Puede venir en cookie o body
        })
    })
};
/**
 * Middleware genérico de validación con Zod
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors
                });
                return;
            }
            console.error('Error de validación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};
exports.validate = validate;
/**
 * Middleware para sanitizar entrada
 */
const sanitizeInput = (req, res, next) => {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
                req.body[key] = value.trim();
            }
        }
    }
    // Sanitizar query params
    if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                req.query[key] = value.trim();
            }
        }
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
/**
 * Middleware para validar headers requeridos
 */
const validateHeaders = (requiredHeaders) => {
    return (req, res, next) => {
        const missingHeaders = requiredHeaders.filter(header => !req.headers[header.toLowerCase()]);
        if (missingHeaders.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Headers requeridos faltantes',
                missingHeaders
            });
            return;
        }
        next();
    };
};
exports.validateHeaders = validateHeaders;
/**
 * Middleware para validar Content-Type
 */
const validateContentType = (allowedTypes) => {
    return (req, res, next) => {
        const contentType = req.headers['content-type'];
        if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
            res.status(415).json({
                success: false,
                message: 'Tipo de contenido no soportado',
                allowedTypes
            });
            return;
        }
        next();
    };
};
exports.validateContentType = validateContentType;
/**
 * Middleware para limitar tamaño del payload
 */
const validatePayloadSize = (maxSizeKB) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSizeBytes = maxSizeKB * 1024;
        if (contentLength > maxSizeBytes) {
            res.status(413).json({
                success: false,
                message: `Payload demasiado grande. Máximo permitido: ${maxSizeKB}KB`
            });
            return;
        }
        next();
    };
};
exports.validatePayloadSize = validatePayloadSize;
/**
 * Middleware para validar IP whitelist (opcional)
 */
const validateIPWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || '';
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
            console.log(`IP bloqueada: ${clientIP}`);
            res.status(403).json({
                success: false,
                message: 'Acceso denegado desde esta IP'
            });
            return;
        }
        next();
    };
};
exports.validateIPWhitelist = validateIPWhitelist;
/**
 * Middleware para validar User-Agent (prevenir bots básicos)
 */
const validateUserAgent = (req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (!userAgent) {
        res.status(400).json({
            success: false,
            message: 'User-Agent requerido'
        });
        return;
    }
    // Lista básica de bots maliciosos
    const suspiciousAgents = [
        'curl',
        'wget',
        'python-requests',
        'bot',
        'crawler',
        'spider'
    ];
    const isSuspicious = suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent));
    if (isSuspicious) {
        console.log(`User-Agent sospechoso: ${userAgent}`);
        res.status(403).json({
            success: false,
            message: 'Acceso denegado'
        });
        return;
    }
    next();
};
exports.validateUserAgent = validateUserAgent;
/**
 * Validadores específicos exportados
 */
exports.validateRegister = (0, exports.validate)(exports.schemas.register);
exports.validateLogin = (0, exports.validate)(exports.schemas.login);
exports.validateVerify2FA = (0, exports.validate)(exports.schemas.verify2FA);
exports.validateSetup2FA = (0, exports.validate)(exports.schemas.setup2FA);
exports.validateChangePassword = (0, exports.validate)(exports.schemas.changePassword);
exports.validateRefreshToken = (0, exports.validate)(exports.schemas.refreshToken);
