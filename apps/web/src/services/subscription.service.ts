import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
  ReactivateSubscriptionRequest,
} from '@/types/subscription.types';

/**
 * Service for managing user subscriptions
 * Implements singleton pattern for consistent state management
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly baseEndpoint = '/api/subscriptions';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get all available subscription plans
   * @returns Promise containing array of subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(
      `${this.baseEndpoint}/plans`
    );
    return response.data;
  }

  /**
   * Get the current user's subscription
   * @returns Promise containing the user's subscription
   */
  async getUserSubscription(): Promise<Subscription> {
    const response = await apiClient.get<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/user`
    );
    return response.data;
  }

  /**
   * Get a specific subscription by ID
   * @param id - Subscription ID
   * @returns Promise containing the subscription
   */
  async getSubscription(id: string): Promise<Subscription> {
    const response = await apiClient.get<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Create a new subscription with idempotency key
   * @param request - Subscription creation request
   * @returns Promise containing the created subscription
   */
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<Subscription> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.post<ApiResponse<Subscription>>(
      this.baseEndpoint,
      request,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data;
  }

  /**
   * Cancel a subscription using PUT method
   * @param subscriptionId - Subscription ID to cancel
   * @param request - Optional cancellation request data
   * @returns Promise containing the cancelled subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    request?: CancelSubscriptionRequest
  ): Promise<Subscription> {
    const response = await apiClient.put<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/${subscriptionId}/cancel`,
      request || {}
    );
    return response.data;
  }

  /**
   * Reactivate a cancelled subscription using PUT method
   * @param subscriptionId - Subscription ID to reactivate
   * @param request - Optional reactivation request data
   * @returns Promise containing the reactivated subscription
   */
  async reactivateSubscription(
    subscriptionId: string,
    request?: ReactivateSubscriptionRequest
  ): Promise<Subscription> {
    const response = await apiClient.put<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/${subscriptionId}/reactivate`,
      request || {}
    );
    return response.data;
  }
}

/**
 * Singleton instance of SubscriptionService
 */
export const subscriptionService = SubscriptionService.getInstance();
