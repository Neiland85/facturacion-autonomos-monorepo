"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.errorHandler = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.CustomError = void 0;
const logger_1 = require("../utils/logger");
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends CustomError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomError {
    constructor(message = 'Not authorized') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends CustomError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    logger_1.logger.error('Error handled by middleware', {
        error: message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    if (!error.isOperational) {
        statusCode = 500;
        message = 'Something went wrong!';
    }
    res.status(statusCode).json({
        status: error.status || 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            error: error
        })
    });
};
exports.errorHandler = errorHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=errorHandler.js.map