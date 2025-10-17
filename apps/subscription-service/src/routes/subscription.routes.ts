/**
 * @fileoverview Subscription routes
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Public routes (no authentication required)
router.get('/plans', subscriptionController.getPlans);

// Protected routes (authentication required)
router.use(authMiddleware);

// User's subscription routes
router.get('/current', subscriptionController.getUserSubscription);
router.get('/user', subscriptionController.getUserSubscriptions);

// Subscription management routes
router.post('/', subscriptionController.createSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/reactivate', subscriptionController.reactivateSubscription);

export default router;
