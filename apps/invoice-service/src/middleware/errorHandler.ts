import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

// Async wrapper to catch async errors
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as any;
  error.message = err.message;

  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new ValidationError(message);
  }

  // Mongoose cast errors
  if (error.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors as any).map((val: any) => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new UnauthorizedError(message);
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new UnauthorizedError(message);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Internal server error';
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
