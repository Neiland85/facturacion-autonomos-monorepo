import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware de validación usando Joi
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * Esquemas de validación para suscripciones
 */
export const subscriptionSchemas = {
  createSubscription: Joi.object({
    body: Joi.object({
      planId: Joi.string().required().messages({
        'string.empty': 'El ID del plan es requerido',
        'any.required': 'El ID del plan es requerido',
      }),
      paymentMethodId: Joi.string().optional(),
    }),
  }),

  cancelSubscription: Joi.object({
    body: Joi.object({
      immediate: Joi.boolean().optional().default(false),
    }),
  }),

  planId: Joi.object({
    params: Joi.object({
      planId: Joi.string().required().messages({
        'string.empty': 'El ID del plan es requerido',
        'any.required': 'El ID del plan es requerido',
      }),
    }),
  }),
};
