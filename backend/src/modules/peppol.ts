import axios from 'axios';

export const sendToPEPPOL = async (ublDocument: string, accessPointUrl: string) => {
  try {
    const response = await axios.post(accessPointUrl, ublDocument, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar el documento a PEPPOL:', error);
    throw error;
  }
};
