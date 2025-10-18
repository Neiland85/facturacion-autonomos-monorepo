"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Subscription Service is healthy',
        timestamp: new Date().toISOString(),
        service: 'subscription-service',
        version: '1.0.0'
    });
});
exports.default = router;
