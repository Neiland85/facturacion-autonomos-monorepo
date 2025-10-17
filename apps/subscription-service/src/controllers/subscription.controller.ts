/**
 * @fileoverview Subscription controller
 */

import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import {
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '../types/subscription.types';

export class SubscriptionController {
  /**
   * Get all available subscription plans
   */
  getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Getting subscription plans...');
      const plans = await subscriptionService.getSubscriptionPlans();
      console.log('Plans retrieved:', plans.length);

      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
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
  getUserSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const subscription =
        await subscriptionService.getUserSubscription(userId);

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
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
  getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const subscriptions =
        await subscriptionService.getUserSubscriptions(userId);

      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
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
  createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const request: CreateSubscriptionRequest = req.body;
      const idempotencyKey = req.headers['idempotency-key'] as string;

      const result = await subscriptionService.createSubscription(
        userId,
        request,
        idempotencyKey
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Error al crear suscripción',
      });
    }
  };

  /**
   * Cancel user's subscription
   */
  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const request: CancelSubscriptionRequest = req.body;

      const subscription = await subscriptionService.cancelSubscription(
        userId,
        request
      );

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error al cancelar suscripción',
      });
    }
  };

  /**
   * Reactivate user's subscription
   */
  reactivateSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const subscription =
        await subscriptionService.reactivateSubscription(userId);

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error al reactivar suscripción',
      });
    }
  };
}

export const subscriptionController = new SubscriptionController();
