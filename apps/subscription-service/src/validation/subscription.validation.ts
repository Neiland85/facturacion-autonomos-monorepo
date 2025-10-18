import { z } from 'zod';

/**
 * Schema for getting subscription by ID
 */
export const getSubscriptionByIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid subscription ID'),
  }),
});

/**
 * Schema for getting user subscriptions
 */
export const getUserSubscriptionsSchema = z.object({
  query: z.object({
    status: z.enum(['active', 'canceled', 'past_due', 'incomplete']).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }).optional(),
});

/**
 * Schema for getting payment methods
 */
export const getPaymentMethodsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid subscription ID'),
  }),
});

/**
 * Validate get subscription by ID
 */
export const validateGetSubscriptionById = (req: any, res: any, next: any) => {
  try {
    getSubscriptionByIdSchema.parse({
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    } else {
      next(error);
    }
  }
};

/**
 * Validate get user subscriptions
 */
export const validateGetUserSubscriptions = (req: any, res: any, next: any) => {
  try {
    getUserSubscriptionsSchema.parse({
      query: req.query,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    } else {
      next(error);
    }
  }
};

/**
 * Validate get payment methods
 */
export const validateGetPaymentMethods = (req: any, res: any, next: any) => {
  try {
    getPaymentMethodsSchema.parse({
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    } else {
      next(error);
    }
  }
};
