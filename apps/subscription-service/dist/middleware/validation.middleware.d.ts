import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
/**
 * Middleware de validación usando Joi
 */
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Esquemas de validación para suscripciones
 */
export declare const subscriptionSchemas: {
    createSubscription: Joi.ObjectSchema<any>;
    cancelSubscription: Joi.ObjectSchema<any>;
    planId: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.middleware.d.ts.map