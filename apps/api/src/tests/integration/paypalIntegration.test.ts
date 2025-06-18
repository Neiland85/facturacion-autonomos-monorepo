import { createPayPalPayment } from '../../modules/payments/paypal';

describe('PayPal Integration', () => {
  it('debería crear un pago en PayPal correctamente', async () => {
    const mockAccessToken = 'mock-access-token';
    const mockPaymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      transactions: [
        {
          amount: {
            total: '10.00',
            currency: 'USD',
          },
          description: 'Pago de prueba',
        },
      ],
      redirect_urls: {
        return_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      },
    };

    const response = await createPayPalPayment(mockAccessToken, mockPaymentData);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('state', 'created');
  });
});
