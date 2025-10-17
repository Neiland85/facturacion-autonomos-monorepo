import request from 'supertest';
import { app } from '../src/index'; // Adjust path as needed
import { prisma } from '@facturacion/database';

describe('Webhook Deduplication', () => {
  const testWebhookId = 'evt_test_webhook_123';

  beforeAll(async () => {
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

    it('should process webhook on first attempt', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/stripe')
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
        .send(stripePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify only one webhook record exists
      const webhooks = await prisma.webhookNotificacion.findMany({
        where: { webhookId: testWebhookId },
      });
      expect(webhooks).toHaveLength(1);
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
  });
});