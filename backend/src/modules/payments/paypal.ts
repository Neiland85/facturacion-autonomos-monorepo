import axios from 'axios';

const BASE_URL = 'https://api.paypal.com';

export const createPayPalPayment = async (accessToken: string, paymentData: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/v1/payments/payment`, paymentData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear un pago en PayPal:', error);
    throw error;
  }
};
