"use strict";
/**
 * @fileoverview Subscription controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionController = exports.SubscriptionController = void 0;
const subscription_service_1 = require("../services/subscription.service");
class SubscriptionController {
    /**
     * Get all available subscription plans
     */
    getPlans = async (req, res) => {
        try {
            console.log('Getting subscription plans...');
            const plans = await subscription_service_1.subscriptionService.getSubscriptionPlans();
            console.log('Plans retrieved:', plans.length);
            res.json({
                success: true,
                data: plans,
            });
        }
        catch (error) {
            console.error('Error getting subscription plans:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    };
    /**
     * Get user's current subscription
     */
    getUserSubscription = async (req, res) => {
        try {
            const userId = req.user.id;
            const subscription = await subscription_service_1.subscriptionService.getUserSubscription(userId);
            res.json({
                success: true,
                data: subscription,
            });
        }
        catch (error) {
            console.error('Error getting user subscription:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    };
    /**
     * Get all user's subscriptions (history)
     */
    getUserSubscriptions = async (req, res) => {
        try {
            const userId = req.user.id;
            const subscriptions = await subscription_service_1.subscriptionService.getUserSubscriptions(userId);
            res.json({
                success: true,
                data: subscriptions,
            });
        }
        catch (error) {
            console.error('Error getting user subscriptions:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    };
    /**
     * Create a new subscription
     */
    createSubscription = async (req, res) => {
        try {
            const userId = req.user.id;
            const request = req.body;
            const idempotencyKey = req.headers['idempotency-key'];
            const result = await subscription_service_1.subscriptionService.createSubscription(userId, request, idempotencyKey);
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Error creating subscription:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear suscripción',
            });
        }
    };
    /**
     * Cancel user's subscription
     */
    cancelSubscription = async (req, res) => {
        try {
            const userId = req.user.id;
            const request = req.body;
            const subscription = await subscription_service_1.subscriptionService.cancelSubscription(userId, request);
            res.json({
                success: true,
                data: subscription,
            });
        }
        catch (error) {
            console.error('Error canceling subscription:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Error al cancelar suscripción',
            });
        }
    };
    /**
     * Reactivate user's subscription
     */
    reactivateSubscription = async (req, res) => {
        try {
            const userId = req.user.id;
            const subscription = await subscription_service_1.subscriptionService.reactivateSubscription(userId);
            res.json({
                success: true,
                data: subscription,
            });
        }
        catch (error) {
            console.error('Error reactivating subscription:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Error al reactivar suscripción',
            });
        }
    };
}
exports.SubscriptionController = SubscriptionController;
exports.subscriptionController = new SubscriptionController();
//# sourceMappingURL=subscription.controller.js.map