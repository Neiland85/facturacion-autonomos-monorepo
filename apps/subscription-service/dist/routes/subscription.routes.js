"use strict";
/**
 * @fileoverview Subscription routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.get('/plans', subscription_controller_1.subscriptionController.getPlans);
// Protected routes (authentication required)
router.use(auth_middleware_1.authMiddleware);
// User's subscription routes
router.get('/current', subscription_controller_1.subscriptionController.getUserSubscription);
router.get('/user', subscription_controller_1.subscriptionController.getUserSubscriptions);
// Subscription management routes
router.post('/', subscription_controller_1.subscriptionController.createSubscription);
router.post('/cancel', subscription_controller_1.subscriptionController.cancelSubscription);
router.post('/reactivate', subscription_controller_1.subscriptionController.reactivateSubscription);
exports.default = router;
//# sourceMappingURL=subscription.routes.js.map