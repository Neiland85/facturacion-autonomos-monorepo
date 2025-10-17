import request from 'supertest';
import { app } from '../src/index'; // Adjust path as needed
import { prisma } from '@facturacion/database';
import { redisClient } from '@facturacion/database';

describe('Idempotency Middleware', () => {
  const testUser = {
    email: 'test-idempotency@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await redisClient.quit();
  });

  describe('POST /auth/register', () => {
    it('should create user on first request', async () => {
      const idempotencyKey = 'test-key-123';

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Idempotency-Key', idempotencyKey)
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should return cached response on duplicate request', async () => {
      const idempotencyKey = 'test-key-123';

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Idempotency-Key', idempotencyKey)
        .send(testUser);

      expect(response.status).toBe(409); // Should return conflict for duplicate user
    });

    it('should process request without Idempotency-Key', async () => {
      const uniqueUser = {
        ...testUser,
        email: 'test-no-key@example.com',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(uniqueUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should validate request hash consistency', async () => {
      const idempotencyKey = 'test-hash-key';

      // First request
      const response1 = await request(app)
        .post('/api/v1/auth/register')
        .set('Idempotency-Key', idempotencyKey)
        .send({
          ...testUser,
          email: 'hash-test-1@example.com',
        });

      expect(response1.status).toBe(201);

      // Second request with different body but same key
      const response2 = await request(app)
        .post('/api/v1/auth/register')
        .set('Idempotency-Key', idempotencyKey)
        .send({
          ...testUser,
          email: 'hash-test-2@example.com', // Different email
        });

      expect(response2.status).toBe(409); // Should detect hash mismatch
    });
  });
});