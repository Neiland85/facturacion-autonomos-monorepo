"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logSecurityEvent = exports.logPasswordReset = exports.logUserRegistration = exports.logAuthAttempt = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, service = 'auth-service', ...meta }) => {
        const logObject = {
            timestamp,
            level,
            service,
            message
        };
        if (stack) {
            logObject.stack = stack;
        }
        if (Object.keys(meta).length > 0) {
            logObject.meta = meta;
        }
        return JSON.stringify(logObject);
    })),
    defaultMeta: { service: 'auth-service' },
    transports: []
});
exports.logger.add(new winston_1.default.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
}));
if (process.env.NODE_ENV === 'production') {
    exports.logger.add(new winston_1.default.transports.File({
        filename: process.env.LOG_FILE || 'logs/auth-service.log',
        level: process.env.LOG_LEVEL || 'info',
        maxsize: 10485760,
        maxFiles: 5,
        tailable: true
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/auth-service-error.log',
        level: 'error',
        maxsize: 10485760,
        maxFiles: 5,
        tailable: true
    }));
}
const logAuthAttempt = (email, success, ip) => {
    exports.logger.info('Authentication attempt', {
        email,
        success,
        ip,
        timestamp: new Date().toISOString()
    });
};
exports.logAuthAttempt = logAuthAttempt;
const logUserRegistration = (email, ip) => {
    exports.logger.info('User registration', {
        email,
        ip,
        timestamp: new Date().toISOString()
    });
};
exports.logUserRegistration = logUserRegistration;
const logPasswordReset = (email, ip) => {
    exports.logger.warn('Password reset requested', {
        email,
        ip,
        timestamp: new Date().toISOString()
    });
};
exports.logPasswordReset = logPasswordReset;
const logSecurityEvent = (event, userId, details) => {
    exports.logger.warn('Security event', {
        event,
        userId,
        details,
        timestamp: new Date().toISOString()
    });
};
exports.logSecurityEvent = logSecurityEvent;
const logError = (error, context) => {
    exports.logger.error('Application error', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
exports.logError = logError;
//# sourceMappingURL=logger.js.map