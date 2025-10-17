/**
 * @fileoverview Subscription service types
 */
export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    maxInvoices: number;
    maxClients: number;
    isPopular?: boolean;
    stripePriceId?: string;
}
export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'past_due' | 'incomplete';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
    createdAt: Date;
    updatedAt: Date;
    plan: SubscriptionPlan;
}
export interface CreateSubscriptionRequest {
    planId: string;
    paymentMethodId?: string;
}
export interface SubscriptionResponse {
    subscription: Subscription;
    clientSecret?: string;
}
export interface CancelSubscriptionRequest {
    immediate?: boolean;
}
export interface ReactivateSubscriptionRequest {
}
//# sourceMappingURL=subscription.types.d.ts.map