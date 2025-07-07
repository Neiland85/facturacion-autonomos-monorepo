import express from 'express';
import request from 'supertest';
import { webhookRoutes } from '../src/routes/webhook.routes';

// Mock del servicio webhook processor
jest.mock('../src/services/webhook-processor.service', () => ({
  WebhookProcessorService: jest.fn().mockImplementation(() => ({
    processWebhook: jest.fn().mockResolvedValue({
      success: true,
      webhookId: 'webhook-123',
      message: 'Webhook procesado correctamente',
      errors: [],
    }),
    getWebhookStatus: jest.fn().mockResolvedValue(null),
    retryWebhook: jest.fn().mockResolvedValue({
      success: false,
      webhookId: 'webhook-123',
      message: 'Webhook ya fue procesado correctamente',
      errors: ['Webhook ya fue procesado correctamente'],
    }),
    listWebhooks: jest.fn().mockResolvedValue({
      webhooks: [],
      total: 0,
    }),
  })),
}));

// Mock de los middlewares
jest.mock('../src/middleware/webhook-ip-whitelist.middleware', () => ({
  WebhookIPWhitelistMiddleware: jest.fn().mockImplementation(() => ({
    checkIPWhitelist: jest.fn((req, res, next) => next()),
  })),
}));

jest.mock('../src/middleware/webhook-rate-limit.middleware', () => ({
  WebhookRateLimitMiddleware: jest.fn().mockImplementation(() => ({
    limitWebhookRequests: jest.fn((req, res, next) => next()),
  })),
}));

const app = express();
app.use(express.json());
app.use('/api/webhooks', webhookRoutes);

describe('Webhook Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/webhooks/aeat', () => {
    it('debería aceptar un webhook con datos válidos', async () => {
      const mockPayload = {
        modeloId: 'test-modelo-123',
        estado: 'ACEPTADO',
        timestamp: '2024-01-01T00:00:00Z',
        numeroJustificante: 'J123456789',
        observaciones: 'Presentación aceptada correctamente',
      };

      const mockHeaders = {
        'x-aeat-signature': 'valid-signature',
        'x-aeat-timestamp': '1640995200',
        'content-type': 'application/json',
      };

      const response = await request(app)
        .post('/api/webhooks/aeat')
        .set(mockHeaders)
        .send(mockPayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('debería retornar success para webhook', async () => {
      const mockPayload = {
        modeloId: 'test-modelo-123',
        estado: 'ACEPTADO',
      };

      const response = await request(app).post('/api/webhooks/aeat').send(mockPayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/webhooks/aeat/:webhookId/status', () => {
    it('debería aceptar solicitudes de estado con UUID válido', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app).get(`/api/webhooks/aeat/${validUUID}/status`);

      expect(response.status).toBe(404); // Mock devuelve null
    });

    it('debería rechazar solicitudes con UUID inválido', async () => {
      const invalidUUID = 'invalid-uuid';

      const response = await request(app).get(`/api/webhooks/aeat/${invalidUUID}/status`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID de webhook inválido');
    });
  });

  describe('POST /api/webhooks/aeat/:webhookId/retry', () => {
    it('debería aceptar solicitudes de reintento con UUID válido', async () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(app).post(`/api/webhooks/aeat/${validUUID}/retry`);

      expect(response.status).toBe(400); // Mock devuelve error
    });

    it('debería rechazar solicitudes de reintento con UUID inválido', async () => {
      const invalidUUID = 'invalid-uuid';

      const response = await request(app).post(`/api/webhooks/aeat/${invalidUUID}/retry`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('ID de webhook inválido');
    });
  });

  describe('GET /api/webhooks/aeat', () => {
    it('debería listar webhooks con parámetros por defecto', async () => {
      const response = await request(app).get('/api/webhooks/aeat');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('debería aceptar parámetros de paginación válidos', async () => {
      const response = await request(app)
        .get('/api/webhooks/aeat')
        .query({ page: '2', limit: '20' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(20);
    });

    it('debería aceptar filtros de estado válidos', async () => {
      const response = await request(app).get('/api/webhooks/aeat').query({ estado: 'PROCESADO' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('debería rechazar filtros de estado inválidos', async () => {
      const response = await request(app)
        .get('/api/webhooks/aeat')
        .query({ estado: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Parámetros de consulta inválidos');
    });
  });
});
