import axios from 'axios';

const BASE_URL = 'https://api.santander.com';

export const getSantanderAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener cuentas de Santander:', error);
    throw error;
  }
};
