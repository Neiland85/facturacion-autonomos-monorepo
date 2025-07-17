import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from './errorHandler';

/**
 * Middleware to validate request using express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));
    
    throw new ValidationError(
      `Validation failed: ${errorMessages.map(e => e.message).join(', ')}`
    );
  }
  
  next();
};
