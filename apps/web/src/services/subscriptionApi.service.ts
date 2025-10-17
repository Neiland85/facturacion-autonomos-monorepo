/**
 * @fileoverview Subscription API service
 * @deprecated This service is deprecated. Use subscriptionService from './subscription.service' instead.
 * This file will be removed in a future version.
 * Handles all subscription-related API calls from the frontend
 */

import {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '../types/subscription.types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL ?? 'http://localhost:3004';

class SubscriptionApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ?? `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get all available subscription plans
   * @deprecated Use subscriptionService.getSubscriptionPlans() instead
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    console.warn(
      'subscriptionApiService.getSubscriptionPlans() is deprecated. Use subscriptionService.getSubscriptionPlans() instead.'
    );
    return this.request<SubscriptionPlan[]>('/api/subscriptions/plans');
  }

  /**
   * Get user's current subscription
   * @deprecated Use subscriptionService.getUserSubscription() instead
   */
  async getUserSubscription(): Promise<Subscription | null> {
    console.warn(
      'subscriptionApiService.getUserSubscription() is deprecated. Use subscriptionService.getUserSubscription() instead.'
    );
    return this.request<Subscription | null>('/api/subscriptions/current');
  }

  /**
   * Create a new subscription
   * @deprecated Use subscriptionService.createSubscription() instead
   */
  async createSubscription(
    request: CreateSubscriptionRequest,
    idempotencyKey?: string
  ): Promise<Subscription> {
    console.warn(
      'subscriptionApiService.createSubscription() is deprecated. Use subscriptionService.createSubscription() instead.'
    );
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    return this.request<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(request),
      headers,
    });
  }

  /**
   * Cancel user's subscription
   * @deprecated Use subscriptionService.cancelSubscription() instead
   */
  async cancelSubscription(
    request: CancelSubscriptionRequest
  ): Promise<Subscription> {
    console.warn(
      'subscriptionApiService.cancelSubscription() is deprecated. Use subscriptionService.cancelSubscription() instead.'
    );
    return this.request<Subscription>('/api/subscriptions/cancel', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Reactivate user's subscription
   * @deprecated Use subscriptionService.reactivateSubscription() instead
   */
  async reactivateSubscription(): Promise<Subscription> {
    console.warn(
      'subscriptionApiService.reactivateSubscription() is deprecated. Use subscriptionService.reactivateSubscription() instead.'
    );
    return this.request<Subscription>('/api/subscriptions/reactivate', {
      method: 'POST',
    });
  }
}

export const subscriptionApiService = new SubscriptionApiService();
