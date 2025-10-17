"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.authValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation schemas for authentication endpoints
exports.authValidation = {
    // Register validation
    register: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "El email debe tener un formato válido",
            "any.required": "El email es obligatorio",
        }),
        password: joi_1.default.string()
            .min(8)
            .max(100)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
            "string.min": "La contraseña debe tener al menos 8 caracteres",
            "string.max": "La contraseña no puede tener más de 100 caracteres",
            "string.pattern.base": "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número",
            "any.required": "La contraseña es obligatoria",
        }),
        firstName: joi_1.default.string().min(2).max(50).required().messages({
            "string.min": "El nombre debe tener al menos 2 caracteres",
            "string.max": "El nombre no puede tener más de 50 caracteres",
            "any.required": "El nombre es obligatorio",
        }),
        lastName: joi_1.default.string().min(2).max(50).required().messages({
            "string.min": "Los apellidos deben tener al menos 2 caracteres",
            "string.max": "Los apellidos no pueden tener más de 50 caracteres",
            "any.required": "Los apellidos son obligatorios",
        }),
    }),
    // Login validation
    login: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "El email debe tener un formato válido",
            "any.required": "El email es obligatorio",
        }),
        password: joi_1.default.string().required().messages({
            "any.required": "La contraseña es obligatoria",
        }),
    }),
    // Refresh token validation
    refresh: joi_1.default.object({
        refreshToken: joi_1.default.string().required().messages({
            "any.required": "El refresh token es obligatorio",
        }),
    }),
    // Forgot password validation
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "El email debe tener un formato válido",
            "any.required": "El email es obligatorio",
        }),
    }),
    // Reset password validation
    resetPassword: joi_1.default.object({
        token: joi_1.default.string().required().messages({
            "any.required": "El token de reset es obligatorio",
        }),
        password: joi_1.default.string()
            .min(8)
            .max(100)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
            "string.min": "La contraseña debe tener al menos 8 caracteres",
            "string.max": "La contraseña no puede tener más de 100 caracteres",
            "string.pattern.base": "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número",
            "any.required": "La contraseña es obligatoria",
        }),
    }),
    // Email verification validation
    verifyEmail: joi_1.default.object({
        token: joi_1.default.string().required().messages({
            "any.required": "El token de verificación es obligatorio",
        }),
    }),
};
// Middleware to validate request body
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            return res.status(400).json({
                success: false,
                message: "Datos de entrada inválidos",
                errors,
            });
        }
        next();
    };
};
exports.validateBody = validateBody;
