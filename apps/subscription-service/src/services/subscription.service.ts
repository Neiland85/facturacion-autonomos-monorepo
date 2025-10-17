/**
 * @fileoverview Subscription service
 */

import {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  CancelSubscriptionRequest,
} from '../types/subscription.types';

export class SubscriptionService {
  private plans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfecto para freelancers que empiezan',
      price: 9.99,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Hasta 50 facturas al mes',
        'Hasta 20 clientes',
        'Soporte básico',
        'Facturación básica',
      ],
      maxInvoices: 50,
      maxClients: 20,
      stripePriceId: 'price_starter_monthly',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Para profesionales con más demanda',
      price: 19.99,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Hasta 200 facturas al mes',
        'Hasta 100 clientes',
        'Soporte prioritario',
        'Facturación avanzada',
        'Recordatorios automáticos',
        'Reportes avanzados',
      ],
      maxInvoices: 200,
      maxClients: 100,
      isPopular: true,
      stripePriceId: 'price_professional_monthly',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Para empresas con grandes volúmenes',
      price: 49.99,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Facturas ilimitadas',
        'Clientes ilimitados',
        'Soporte 24/7',
        'API completa',
        'Integraciones avanzadas',
        'Equipo de cuenta dedicado',
      ],
      maxInvoices: -1, // Unlimited
      maxClients: -1, // Unlimited
      stripePriceId: 'price_enterprise_monthly',
    },
  ];

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // In a real implementation, this would fetch from database
    return this.plans;
  }

  /**
   * Get a specific subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    return this.plans.find(plan => plan.id === planId) || null;
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(
    userId: string,
    request: CreateSubscriptionRequest,
    idempotencyKey?: string
  ): Promise<SubscriptionResponse> {
    const plan = await this.getSubscriptionPlan(request.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // In a real implementation, this would:
    // 1. Check if user already has an active subscription
    // 2. Create Stripe subscription
    // 3. Save to database
    // 4. Handle idempotency

    const now = new Date();
    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId: request.planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: `stripe_sub_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      plan,
    };

    return {
      subscription,
      clientSecret: 'pi_test_secret_' + Date.now(), // Mock client secret
    };
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    // In a real implementation, this would fetch from database
    // For now, return null (no active subscription)
    return null;
  }

  /**
   * Cancel a user's subscription
   */
  async cancelSubscription(
    userId: string,
    request: CancelSubscriptionRequest = {}
  ): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // In a real implementation, this would:
    // 1. Cancel Stripe subscription
    // 2. Update database

    subscription.status = request.immediate ? 'canceled' : 'active';
    subscription.cancelAtPeriodEnd = !request.immediate;
    subscription.updatedAt = new Date();

    return subscription;
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      throw new Error('No subscription found for user');
    }

    if (
      subscription.status !== 'canceled' &&
      subscription.status !== 'past_due'
    ) {
      throw new Error('Subscription is not in a state that can be reactivated');
    }

    // In a real implementation, this would:
    // 1. Reactivate Stripe subscription
    // 2. Update database

    subscription.status = 'active';
    subscription.cancelAtPeriodEnd = false;
    subscription.updatedAt = new Date();

    return subscription;
  }

  /**
   * Get all subscriptions for a user (subscription history)
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    // In a real implementation, this would query the database
    // For now, return mock data based on current subscription
    const currentSubscription = await this.getUserSubscription(userId);

    if (!currentSubscription) {
      return [];
    }

    // Mock subscription history - in reality this would come from database
    const subscriptions: Subscription[] = [currentSubscription];

    // Add some historical subscriptions for demo purposes
    if (currentSubscription.plan.id === 'professional') {
      subscriptions.push({
        ...currentSubscription,
        id: 'sub_hist_001',
        plan: this.plans.find(p => p.id === 'starter')!,
        status: 'canceled',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-06-01'),
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      });
    }

    return subscriptions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const subscriptionService = new SubscriptionService();
