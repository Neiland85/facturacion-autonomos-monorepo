import axios from 'axios';

const BASE_URL = 'https://api.bancosabadell.com';

export const getSabadellAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas de Banco Sabadell:', error);
    throw error;
  }
};
