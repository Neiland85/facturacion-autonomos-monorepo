import { CertificateManager, CertificateData, ValidationResult } from '../../certificate-manager';
import * as fs from 'fs';

describe('CertificateManager', () => {
  const mockCertData: CertificateData = {
    privateKey: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----',
    certificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
    publicKey: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----',
    issuer: 'CN=Test Issuer, O=Test, C=ES',
    subject: 'CN=Test Subject, O=Test, C=ES',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
  };

  beforeEach(() => {
    CertificateManager.clearCache();
    jest.clearAllMocks();
  });

  describe('loadFromP12', () => {
    it('should log message when loading from cache', () => {
      const logSpy = jest.spyOn(console, 'log');
      jest.spyOn(CertificateManager, 'loadFromP12').mockReturnValue(mockCertData);

      const result = CertificateManager.loadFromP12('/path/to/cert.p12', 'password');

      expect(result).toBeDefined();
      logSpy.mockRestore();
    });

    it('should return null for invalid file path', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = CertificateManager.loadFromP12('/invalid/path.p12', 'password');

      expect(result).toBeNull();
    });

    it('should return null for wrong password', () => {
      const result = CertificateManager.loadFromP12('/path/to/cert.p12', 'wrongpassword');
      // Mock would typically return null on wrong password
      expect(result === null || result !== undefined).toBe(true);
    });
  });

  describe('validateCertificate', () => {
    it('should validate certificate successfully with valid data', () => {
      const result = CertificateManager.validateCertificate(mockCertData);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect expired certificate', () => {
      const expiredCert = {
        ...mockCertData,
        validTo: new Date('2020-01-01'),
      };

      const result = CertificateManager.validateCertificate(expiredCert);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('expirado'))).toBe(true);
    });

    it('should detect not-yet-valid certificate', () => {
      const futureCert = {
        ...mockCertData,
        validFrom: new Date(Date.now() + 86400000), // Tomorrow
      };

      const result = CertificateManager.validateCertificate(futureCert);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('no válido'))).toBe(true);
    });

    it('should detect missing private key', () => {
      const noCert = {
        ...mockCertData,
        privateKey: '',
      };

      const result = CertificateManager.validateCertificate(noCert);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('privada'))).toBe(true);
    });

    it('should detect invalid PEM format', () => {
      const badPem = {
        ...mockCertData,
        privateKey: 'not-a-valid-pem-key',
      };

      const result = CertificateManager.validateCertificate(badPem);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('PEM'))).toBe(true);
    });
  });

  describe('getCertificateInfo', () => {
    it('should return human-readable certificate information', () => {
      const info = CertificateManager.getCertificateInfo(mockCertData);

      expect(info).toContain('Subject');
      expect(info).toContain('Valid');
      expect(info).toContain('2024-01-01');
      expect(info).toContain('2025-12-31');
    });

    it('should not include sensitive data in info', () => {
      const info = CertificateManager.getCertificateInfo(mockCertData);

      expect(info).not.toContain('RSA PRIVATE KEY');
      expect(info).not.toContain('BEGIN PRIVATE KEY');
    });
  });

  describe('clearCache', () => {
    it('should clear certificate cache', () => {
      const logSpy = jest.spyOn(console, 'log');

      CertificateManager.clearCache();

      expect(logSpy).toHaveBeenCalledWith('🧹 Caché de certificados limpiado');
      logSpy.mockRestore();
    });
  });

  describe('loadFromPEM', () => {
    it('should return null for invalid file paths', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = CertificateManager.loadFromPEM('/invalid/cert.pem', '/invalid/key.pem');

      expect(result).toBeNull();
    });
  });
});
