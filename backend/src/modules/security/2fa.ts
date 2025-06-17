import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const generate2FASecret = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret;
};

export const getQRCode = async (secret: string, label: string) => {
  try {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label,
      issuer: 'FacturacionAutonomos',
    });
    const qrCode = await qrcode.toDataURL(otpauthUrl);
    return qrCode;
  } catch (error) {
    console.error('Error al generar el código QR:', error);
    throw error;
  }
};

export const verify2FACode = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });
};
