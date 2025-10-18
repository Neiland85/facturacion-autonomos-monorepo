import request from 'supertest';
import Stripe from 'stripe';
import { app } from '../src/index'; // Adjust path as needed
import { prisma } from '@facturacion/database';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn((body, signature, secret) => {
        // Mock successful verification for valid signatures
        if (signature === 'valid_signature' && secret) {
          return JSON.parse(body.toString());
        }
        throw new Error('Invalid signature');
      }),
    },
  }));
});

describe('Webhook Deduplication', () => {
  const testWebhookId = 'evt_test_webhook_123';

  beforeAll(async () => {
    // Set environment variables for tests
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

    // Clean up test data
    await prisma.webhookNotificacion.deleteMany({
      where: { webhookId: testWebhookId },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.webhookNotificacion.deleteMany({
      where: { webhookId: testWebhookId },
    });
  });

  describe('POST /webhooks/stripe', () => {
    const stripePayload = {
      id: testWebhookId,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_payment',
          status: 'succeeded',
        },
      },
    };

    it('should process webhook on first attempt with valid signature', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(stripePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify webhook was recorded
      const webhook = await prisma.webhookNotificacion.findUnique({
        where: { webhookId: testWebhookId },
      });
      expect(webhook).toBeTruthy();
      expect(webhook?.estado).toBe('PROCESADO');
    });

    it('should return 200 OK on duplicate webhook', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(stripePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify only one webhook record exists
      const webhooks = await prisma.webhookNotificacion.findMany({
        where: { webhookId: testWebhookId },
      });
      expect(webhooks).toHaveLength(1);
    });

    it('should reject webhook with invalid signature', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send(stripePayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid webhook signature');
    });

    it('should reject webhook without signature header', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .send(stripePayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('signature');
    });

    it('should handle missing stripe-signature header gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .send(stripePayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject webhook with malformed signature', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'malformed_sig_no_timestamp')
        .send(stripePayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle expired timestamp in signature', async () => {
      // Signature format: t=timestamp,v1=signature
      const expiredSignature = `t=${Math.floor(Date.now() / 1000) - 600},v1=test_sig`;
      
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', expiredSignature)
        .send(stripePayload);

      // This should fail signature verification
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle different webhook types', async () => {
      const cancelPayload = {
        id: 'evt_test_cancel_456',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_subscription',
          },
        },
      };

      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(cancelPayload);

      expect(response.status).toBe(200);

      // Verify webhook was recorded
      const webhook = await prisma.webhookNotificacion.findUnique({
        where: { webhookId: 'evt_test_cancel_456' },
      });
      expect(webhook).toBeTruthy();
      expect(webhook?.tipoNotificacion).toBe('customer.subscription.deleted');
    });
  });

  describe('POST /webhooks/aeat', () => {
    const aeatPayload = {
      numeroJustificante: 'AEAT_TEST_789',
      estado: 'ACEPTADA',
      modelo: '303',
      ejercicio: 2024,
      periodo: '1T',
    };

    it('should process AEAT webhook on first attempt', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/aeat')
        .send(aeatPayload);

      expect(response.status).toBe(200);

      // Verify webhook was recorded
      const webhook = await prisma.webhookNotificacion.findUnique({
        where: { webhookId: 'AEAT_TEST_789' },
      });
      expect(webhook).toBeTruthy();
      expect(webhook?.origen).toBe('AEAT');
    });

    it('should deduplicate AEAT webhooks', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/aeat')
        .send(aeatPayload);

      expect(response.status).toBe(200);

      // Verify only one webhook record exists
      const webhooks = await prisma.webhookNotificacion.findMany({
        where: { webhookId: 'AEAT_TEST_789' },
      });
      expect(webhooks).toHaveLength(1);
    });

    it('should not require signature for AEAT webhooks', async () => {
      const aeatPayload2 = {
        numeroJustificante: 'AEAT_TEST_999',
        estado: 'ACEPTADA',
        modelo: '303',
      };

      const response = await request(app)
        .post('/api/v1/webhooks/aeat')
        .send(aeatPayload2);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
