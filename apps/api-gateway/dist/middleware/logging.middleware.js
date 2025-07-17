"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.id = requestId;
    logger_1.logger.info('HTTP Request Start', {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger_1.logger.info('HTTP Request End', {
            requestId,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length'),
            timestamp: new Date().toISOString()
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logging.middleware.js.map