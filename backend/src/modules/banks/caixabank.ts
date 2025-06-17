import axios from 'axios';

const BASE_URL = 'https://api.caixabank.com';

export const getCaixaBankAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas de CaixaBank:', error);
    throw error;
  }
};
