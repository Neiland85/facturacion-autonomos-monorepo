export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    // Log de entrada
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    // Log de respuesta cuando termine
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const statusColor = statusCode >= 400
            ? '\x1b[31m'
            : statusCode >= 300
                ? '\x1b[33m'
                : '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log(`[${new Date().toISOString()}] ${statusColor}${req.method} ${req.originalUrl} ${statusCode}${resetColor} - ${duration}ms`);
    });
    next();
};
//# sourceMappingURL=logger.middleware.js.map