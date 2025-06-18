import axios from 'axios';

const BASE_URL = 'https://api.hubapi.com';

export const createHubSpotContact = async (accessToken: string, contactData: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/contacts/v1/contact`, contactData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear contacto en HubSpot:', error);
    throw error;
  }
};
