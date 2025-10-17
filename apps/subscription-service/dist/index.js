"use strict";
/**
 * @fileoverview Simple subscription service entry point
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3004;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'subscription-service' });
});
// Simple test route
app.get('/test', (req, res) => {
    res.json({ message: 'Test route works' });
});
// API routes
app.use('/api/subscriptions', subscription_routes_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Subscription service running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map