import { generate2FASecret, verify2FACode } from '../../modules/security/2fa';

describe('2FA Module', () => {
  it('debería generar un secreto válido para 2FA', () => {
    const secret = generate2FASecret();
    expect(secret).toHaveProperty('base32');
    expect(secret).toHaveProperty('otpauth_url');
  });

  it('debería verificar correctamente un código TOTP válido', () => {
    const secret = generate2FASecret();
    const token = require('speakeasy').totp({
      secret: secret.base32,
      encoding: 'base32',
    });
    const isValid = verify2FACode(secret.base32, token);
    expect(isValid).toBe(true);
  });

  it('debería fallar para un código TOTP inválido', () => {
    const secret = generate2FASecret();
    const isValid = verify2FACode(secret.base32, '123456');
    expect(isValid).toBe(false);
  });
});
