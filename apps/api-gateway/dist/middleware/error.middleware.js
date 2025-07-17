"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.id,
        timestamp: new Date().toISOString()
    });
    const statusCode = error.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        error: true,
        message: statusCode === 500 && !isDevelopment
            ? 'Error interno del servidor'
            : error.message,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    };
    if (isDevelopment) {
        errorResponse.stack = error.stack;
        errorResponse.details = {
            statusCode: error.statusCode,
            isOperational: error.isOperational,
            name: error.name
        };
    }
    if (req.id) {
        errorResponse.requestId = req.id;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const error = {
        error: true,
        message: 'Endpoint no encontrado',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        suggestions: [
            'Verificar la URL',
            'Consultar la documentación en /docs',
            'Verificar el método HTTP'
        ]
    };
    logger_1.logger.warn('404 - Endpoint no encontrado', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    res.status(404).json(error);
};
exports.notFoundHandler = notFoundHandler;
const createAppError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createAppError = createAppError;
//# sourceMappingURL=error.middleware.js.map