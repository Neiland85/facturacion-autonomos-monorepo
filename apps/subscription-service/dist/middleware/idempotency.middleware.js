"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("@facturacion/database");
const database_2 = require("@facturacion/database");
/**
 * Middleware to handle idempotency for API requests
 * Uses Idempotency-Key header as per RFC 8471
 */
const idempotencyMiddleware = (options = {}) => {
    const { ttlSeconds = parseInt(process.env.IDEMPOTENCY_CACHE_TTL_SECONDS || "3600"), skipCache = false, enabled = process.env.IDEMPOTENCY_ENABLED !== "false", } = options;
    return async (req, res, next) => {
        // Skip if idempotency is disabled
        if (!enabled) {
            return next();
        }
        // Only apply to POST, PUT, PATCH methods
        if (!["POST", "PUT", "PATCH"].includes(req.method)) {
            return next();
        }
        try {
            // Extract idempotency key from header
            const idempotencyKey = req.headers["idempotency-key"];
            if (!idempotencyKey) {
                // Idempotency key is optional, continue without it
                return next();
            }
            // Validate key format (should be reasonable length)
            if (idempotencyKey.length > 255) {
                res.status(400).json({
                    success: false,
                    message: "Idempotency-Key header too long",
                });
                return;
            }
            // Calculate request hash for validation
            const requestBody = JSON.stringify(req.body || {});
            const requestHash = crypto_1.default
                .createHash("sha256")
                .update(requestBody)
                .digest("hex");
            // Attach to request for later use
            req.idempotencyKey = idempotencyKey;
            req.requestHash = requestHash;
            // Check Redis cache first (fast path)
            if (!skipCache) {
                const cached = await (0, database_1.getIdempotencyKey)(idempotencyKey);
                if (cached) {
                    // Validate request hash matches
                    if (cached.requestHash !== requestHash) {
                        res.status(409).json({
                            success: false,
                            message: "Idempotency key exists with different request",
                        });
                        return;
                    }
                    // Return cached response
                    res.status(cached.statusCode || 200).json(cached.response);
                    return;
                }
            }
            // Check database for longer-term storage
            const stored = await (0, database_1.getIdempotentResult)(database_2.prisma, idempotencyKey, requestHash);
            if (stored) {
                // Return stored response
                res.status(stored.statusCode).json(stored.data);
                return;
            }
            // Store original response methods
            const originalJson = res.json.bind(res);
            const originalStatus = res.status.bind(res);
            let responseData = null;
            let responseStatus = 200;
            // Override res.json to capture response
            res.json = (data) => {
                responseData = data;
                return originalJson(data);
            };
            // Override res.status to capture status code
            res.status = (code) => {
                responseStatus = code;
                return originalStatus(code);
            };
            // Override res.end to save idempotency data after response
            const originalEnd = res.end.bind(res);
            res.end = async (chunk, encoding) => {
                // Save to database and cache after successful response
                if (responseData && res.statusCode < 400) {
                    try {
                        // Save to database (24 hours)
                        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                        await database_2.prisma.idempotencyKey.create({
                            data: {
                                key: idempotencyKey,
                                requestHash,
                                response: responseData,
                                statusCode: responseStatus,
                                expiresAt,
                            },
                        });
                        // Cache in Redis (1 hour)
                        if (!skipCache) {
                            await (0, database_1.setIdempotencyKey)(idempotencyKey, { response: responseData, statusCode: responseStatus, requestHash }, ttlSeconds);
                        }
                    }
                    catch (error) {
                        console.warn("Failed to save idempotency data:", error);
                        // Don't fail the request if idempotency storage fails
                    }
                }
                // Call original end
                return originalEnd(chunk, encoding);
            };
            next();
        }
        catch (error) {
            console.error("Idempotency middleware error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    };
};
exports.idempotencyMiddleware = idempotencyMiddleware;
