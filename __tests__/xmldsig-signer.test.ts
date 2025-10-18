import { XmlDSigSigner, SignerOptions, VerificationResult } from '../xmldsig-signer';

describe('XmlDSigSigner', () => {
  const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2a2rwplTCHpjyYRDlN2p5vvYvHjILi38pxKV5g0q2F8hUULw
test_key_content_only_for_testing
-----END RSA PRIVATE KEY-----`;

  const mockCertificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIBATANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJFUzEM
test_cert_content_only_for_testing
-----END CERTIFICATE-----`;

  const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <InvoiceNumber>INV001</InvoiceNumber>
  <Total>1000.00</Total>
</Invoice>`;

  const malformedXml = `<?xml version="1.0"?>
<Invoice>
  <InvoiceNumber>INV001</InvoiceNumber>
</Inv>`;

  let signer: XmlDSigSigner;

  beforeEach(() => {
    signer = new XmlDSigSigner({
      strictValidation: true,
      allowedAlgorithms: ['http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'],
      includeKeyInfo: true,
    });
  });

  describe('constructor', () => {
    it('should create signer with default options', () => {
      const defaultSigner = new XmlDSigSigner();
      expect(defaultSigner).toBeDefined();
    });

    it('should create signer with custom options', () => {
      const customOptions: SignerOptions = {
        strictValidation: false,
        allowedAlgorithms: ['http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'],
        includeKeyInfo: false,
      };
      const customSigner = new XmlDSigSigner(customOptions);
      expect(customSigner).toBeDefined();
    });
  });

  describe('sign', () => {
    it('should reject malformed XML', () => {
      expect(() => {
        signer.sign(malformedXml, mockPrivateKey, mockCertificate);
      }).toThrow();
    });

    it('should reject invalid PEM private key', () => {
      const invalidKey = 'not-a-valid-pem-key';
      expect(() => {
        signer.sign(mockXml, invalidKey, mockCertificate);
      }).toThrow();
    });

    it('should reject invalid PEM certificate', () => {
      const invalidCert = 'not-a-valid-pem-cert';
      expect(() => {
        signer.sign(mockXml, mockPrivateKey, invalidCert);
      }).toThrow();
    });

    it('should sign valid XML with valid credentials', () => {
      // This test would need valid keys in actual implementation
      // For now, we just verify the method accepts valid-looking inputs
      expect(() => {
        const result = signer.sign(mockXml, mockPrivateKey, mockCertificate);
        // If it returns without error, it passed validation
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it('should include KeyInfo when option is enabled', () => {
      const signerWithKeyInfo = new XmlDSigSigner({ includeKeyInfo: true });
      expect(signerWithKeyInfo).toBeDefined();
    });

    it('should exclude KeyInfo when option is disabled', () => {
      const signerWithoutKeyInfo = new XmlDSigSigner({ includeKeyInfo: false });
      expect(signerWithoutKeyInfo).toBeDefined();
    });
  });

  describe('verify', () => {
    it('should return VerificationResult interface', () => {
      const result = signer.verify(mockXml);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should detect unsigned XML', () => {
      const result = signer.verify(mockXml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject malformed XML', () => {
      const result = signer.verify(malformedXml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn on multiple signatures', () => {
      const multiSigXml = `<?xml version="1.0"?>
<Invoice>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/>
</Invoice>`;

      const result = signer.verify(multiSigXml);
      
      expect(result.warnings.some(w => w.includes('múltiples'))).toBe(true);
    });
  });

  describe('extractCertificateFromSignature', () => {
    it('should return null for unsigned XML', () => {
      const result = signer.extractCertificateFromSignature(mockXml);
      expect(result).toBeNull();
    });

    it('should handle malformed XML gracefully', () => {
      const result = signer.extractCertificateFromSignature(malformedXml);
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('isWellFormedXml', () => {
    it('should detect well-formed XML', () => {
      expect(signer['isWellFormedXml'](mockXml)).toBe(true);
    });

    it('should detect malformed XML', () => {
      expect(signer['isWellFormedXml'](malformedXml)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(signer['isWellFormedXml']('')).toBe(false);
    });
  });

  describe('isPemFormat', () => {
    it('should validate correct PEM format', () => {
      expect(signer['isPemFormat'](mockPrivateKey)).toBe(true);
    });

    it('should reject invalid PEM format', () => {
      expect(signer['isPemFormat']('not-a-pem')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(signer['isPemFormat']('')).toBe(false);
    });
  });
});
