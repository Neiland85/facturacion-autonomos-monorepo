import { Router } from 'express';

const router = Router();

// Placeholder webhook routes - to be implemented with Stripe
router.post('/stripe', (req, res) => {
  res.json({
    success: false,
    message: 'Stripe webhook routes not yet implemented',
    endpoint: '/stripe'
  });
});

export default router;
