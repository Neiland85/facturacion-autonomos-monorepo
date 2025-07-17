import { NextFunction, Request, Response } from 'express';
export interface AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
}
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare class ValidationError extends CustomError {
    constructor(message: string);
}
export declare class AuthenticationError extends CustomError {
    constructor(message?: string);
}
export declare class AuthorizationError extends CustomError {
    constructor(message?: string);
}
export declare class NotFoundError extends CustomError {
    constructor(message?: string);
}
export declare class ConflictError extends CustomError {
    constructor(message: string);
}
export declare class InternalServerError extends CustomError {
    constructor(message?: string);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map