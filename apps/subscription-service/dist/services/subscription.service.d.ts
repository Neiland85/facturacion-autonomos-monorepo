/**
 * @fileoverview Subscription service
 */
import { SubscriptionPlan, Subscription, CreateSubscriptionRequest, SubscriptionResponse, CancelSubscriptionRequest } from '../types/subscription.types';
export declare class SubscriptionService {
    private plans;
    /**
     * Get all available subscription plans
     */
    getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
    /**
     * Get a specific subscription plan by ID
     */
    getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null>;
    /**
     * Create a new subscription for a user
     */
    createSubscription(userId: string, request: CreateSubscriptionRequest, idempotencyKey?: string): Promise<SubscriptionResponse>;
    /**
     * Get user's current subscription
     */
    getUserSubscription(userId: string): Promise<Subscription | null>;
    /**
     * Cancel a user's subscription
     */
    cancelSubscription(userId: string, request?: CancelSubscriptionRequest): Promise<Subscription>;
    /**
     * Reactivate a canceled subscription
     */
    reactivateSubscription(userId: string): Promise<Subscription>;
    /**
     * Get all subscriptions for a user (subscription history)
     */
    getUserSubscriptions(userId: string): Promise<Subscription[]>;
}
export declare const subscriptionService: SubscriptionService;
//# sourceMappingURL=subscription.service.d.ts.map