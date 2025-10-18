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

export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly baseEndpoint = '/api/subscriptions';

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient.get<ApiResponse<SubscriptionPlan[]>>(
      `${this.baseEndpoint}/plans`
    );
  }

  async getUserSubscription(): Promise<ApiResponse<Subscription>> {
    return apiClient.get<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/current`
    );
  }

  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<ApiResponse<Subscription>> {
    const idempotencyKey = uuidv4();
    return apiClient.postWithHeaders<ApiResponse<Subscription>>(
      this.baseEndpoint,
      request,
      {
        'Idempotency-Key': idempotencyKey,
      }
    );
  }

  async cancelSubscription(
    subscriptionId: string,
    request?: CancelSubscriptionRequest
  ): Promise<ApiResponse<Subscription>> {
    return apiClient.post<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/${subscriptionId}/cancel`,
      request ?? {}
    );
  }

  async reactivateSubscription(
    subscriptionId: string,
    request?: ReactivateSubscriptionRequest
  ): Promise<ApiResponse<Subscription>> {
    return apiClient.post<ApiResponse<Subscription>>(
      `${this.baseEndpoint}/${subscriptionId}/reactivate`,
      request ?? {}
    );
  }
}

export const subscriptionService = SubscriptionService.getInstance();
