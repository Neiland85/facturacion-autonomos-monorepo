"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionSchemas = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Middleware de validación usando Joi
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: errors,
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
/**
 * Esquemas de validación para suscripciones
 */
exports.subscriptionSchemas = {
    createSubscription: joi_1.default.object({
        body: joi_1.default.object({
            planId: joi_1.default.string().required().messages({
                'string.empty': 'El ID del plan es requerido',
                'any.required': 'El ID del plan es requerido',
            }),
            paymentMethodId: joi_1.default.string().optional(),
        }),
    }),
    cancelSubscription: joi_1.default.object({
        body: joi_1.default.object({
            immediate: joi_1.default.boolean().optional().default(false),
        }),
    }),
    planId: joi_1.default.object({
        params: joi_1.default.object({
            planId: joi_1.default.string().required().messages({
                'string.empty': 'El ID del plan es requerido',
                'any.required': 'El ID del plan es requerido',
            }),
        }),
    }),
};
//# sourceMappingURL=validation.middleware.js.map