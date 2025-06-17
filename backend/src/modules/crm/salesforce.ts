import axios from 'axios';

const BASE_URL = 'https://login.salesforce.com';

export const createSalesforceContact = async (accessToken: string, contactData: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/services/data/v52.0/sobjects/Contact`, contactData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear contacto en Salesforce:', error);
    throw error;
  }
};
