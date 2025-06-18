import { createPayPalPayment } from '../../modules/payments/paypal';

describe('PayPal Module', () => {
  it('debería crear un pago correctamente', async () => {
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

    const mockAccessToken = 'test-access-token';

    const response = await createPayPalPayment(mockAccessToken, mockPaymentData);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('state', 'created');
  });
});
