import axios from 'axios';

const BASE_URL = 'https://api.bbva.com';

export const getBBVAAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas de BBVA:', error);
    throw error;
  }
};
