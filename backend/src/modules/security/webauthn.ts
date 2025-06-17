import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

export const generateWebAuthnRegistrationOptions = (userId: string, username: string) => {
  return generateRegistrationOptions({
    rpName: 'FacturacionAutonomos',
    rpID: 'localhost', // Cambiar al dominio real en producción
    userID: userId,
    userName: username,
    attestationType: 'indirect',
    authenticatorSelection: {
      userVerification: 'preferred',
    },
  });
};

export const verifyWebAuthnRegistration = (response: any, expectedChallenge: string) => {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: 'http://localhost', // Cambiar al dominio real en producción
    expectedRPID: 'localhost',
  });
};

export const generateWebAuthnAuthenticationOptions = () => {
  return generateAuthenticationOptions({
    rpID: 'localhost', // Cambiar al dominio real en producción
    userVerification: 'preferred',
  });
};

export const verifyWebAuthnAuthentication = (response: any, expectedChallenge: string) => {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: 'http://localhost', // Cambiar al dominio real en producción
    expectedRPID: 'localhost',
  });
};
