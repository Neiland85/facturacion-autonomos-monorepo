/**
 * @fileoverview Subscription controller
 */
import { Request, Response } from 'express';
export declare class SubscriptionController {
    /**
     * Get all available subscription plans
     */
    getPlans: (req: Request, res: Response) => Promise<void>;
    /**
     * Get user's current subscription
     */
    getUserSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * Get all user's subscriptions (history)
     */
    getUserSubscriptions: (req: Request, res: Response) => Promise<void>;
    /**
     * Create a new subscription
     */
    createSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * Cancel user's subscription
     */
    cancelSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * Reactivate user's subscription
     */
    reactivateSubscription: (req: Request, res: Response) => Promise<void>;
}
export declare const subscriptionController: SubscriptionController;
//# sourceMappingURL=subscription.controller.d.ts.map