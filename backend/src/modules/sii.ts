import axios from 'axios';

export const sendToSII = async (invoiceData: any) => {
  try {
    const response = await axios.post('https://www2.agenciatributaria.gob.es/sii-ws/altaFactura', invoiceData, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar la factura al SII:', error);
    throw error;
  }
};
