/**
 * @fileoverview Simple subscription service entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subscriptionRoutes from './routes/subscription.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'OK', service: 'subscription-service' });
});

// Simple test route
app.get('/test', (req: any, res: any) => {
  res.json({ message: 'Test route works' });
});

// API routes
console.log('Setting up API routes...');
app.use('/api/subscriptions', subscriptionRoutes);
console.log('API routes configured');

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Subscription service running on port ${PORT}`);
});

export default app;
