import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../config/logger';

export const validate = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', {
          path: req.path,
          errors: error.errors,
          body: req.body,
        });
        
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      logger.error('Unexpected validation error', { error });
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  };
};

export const validateQuery = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Query validation error', {
          path: req.path,
          errors: error.errors,
          query: req.query,
        });
        
        return res.status(400).json({
          error: 'Query validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      logger.error('Unexpected query validation error', { error });
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  };
};

export const validateParams = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Params validation error', {
          path: req.path,
          errors: error.errors,
          params: req.params,
        });
        
        return res.status(400).json({
          error: 'Params validation error',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      logger.error('Unexpected params validation error', { error });
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  };
};