"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServiceCall = exports.logError = exports.logRequest = exports.loggerStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, service = 'api-gateway', ...meta }) => {
    const logObject = {
        timestamp,
        level,
        service,
        message,
        ...(stack && { stack }),
        ...(Object.keys(meta).length > 0 && { meta })
    };
    return JSON.stringify(logObject);
}));
const transports = [
    new winston_1.default.transports.Console({
        level: config_1.config.logging.level,
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    })
];
if (config_1.config.nodeEnv === 'production') {
    transports.push(new winston_1.default.transports.File({
        filename: config_1.config.logging.file,
        level: config_1.config.logging.level,
        format: customFormat,
        maxsize: 10485760,
        maxFiles: 5,
        tailable: true
    }));
}
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    format: customFormat,
    defaultMeta: { service: 'api-gateway' },
    transports,
    exitOnError: false
});
exports.loggerStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
const logRequest = (req, res, responseTime) => {
    exports.logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id,
        requestId: req.id
    });
};
exports.logRequest = logRequest;
const logError = (error, req) => {
    exports.logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        ...(req && {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id,
            requestId: req.id
        })
    });
};
exports.logError = logError;
const logServiceCall = (serviceName, method, url, duration, success) => {
    exports.logger.info('Service Call', {
        service: serviceName,
        method,
        url,
        duration: `${duration}ms`,
        success
    });
};
exports.logServiceCall = logServiceCall;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map