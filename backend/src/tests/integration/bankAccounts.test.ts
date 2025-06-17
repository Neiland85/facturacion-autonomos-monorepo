import request from 'supertest';
import app from '../../app';

describe('GET /api/bank-accounts', () => {
  it('debería devolver cuentas bancarias para un banco válido', async () => {
    const response = await request(app)
      .post('/api/bank-accounts')
      .send({ bank: 'santander', accessToken: 'test-token' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accounts');
  });

  it('debería devolver un error para un banco no soportado', async () => {
    const response = await request(app)
      .post('/api/bank-accounts')
      .send({ bank: 'unknown', accessToken: 'test-token' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Banco no soportado.');
  });
});
