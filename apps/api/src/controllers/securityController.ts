import { Request, Response } from 'express';
import { generate2FASecret, getQRCode, verify2FACode } from '../modules/security/2fa';
import { generateWebAuthnRegistrationOptions, verifyWebAuthnRegistration } from '../modules/security/webauthn';

// 2FA Endpoints
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const secret = generate2FASecret();
    const qrCode = await getQRCode(secret.base32, req.body.label);
    res.json({ secret: secret.base32, qrCode });
  } catch (error) {
    console.error('Error al configurar 2FA:', error);
    res.status(500).json({ error: 'Error al configurar 2FA.' });
  }
};

export const verify2FA = (req: Request, res: Response) => {
  const { secret, token } = req.body;
  const isValid = verify2FACode(secret, token);
  if (isValid) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Código 2FA inválido.' });
  }
};

// WebAuthn Endpoints
export const setupWebAuthn = (req: Request, res: Response) => {
  const options = generateWebAuthnRegistrationOptions(req.body.userId, req.body.username);
  res.json(options);
};

export const verifyWebAuthn = (req: Request, res: Response) => {
  try {
    const { response, expectedChallenge } = req.body;
    const verification = verifyWebAuthnRegistration(response, expectedChallenge);
    res.json(verification);
  } catch (error) {
    console.error('Error al verificar WebAuthn:', error);
    res.status(500).json({ error: 'Error al verificar WebAuthn.' });
  }
};
