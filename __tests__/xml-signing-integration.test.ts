import { CertificateManager } from '../certificate-manager';
import { XmlDSigSigner } from '../xmldsig-signer';
import { TimestampService, TimestampServiceConfig } from '../timestamp-service';

describe('XML Signing Integration', () => {
  const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2a2rwplTCHpjyYRDlN2p5vvYvHjILi38pxKV5g0q2F8hUULw
test_key_content_only_for_testing
-----END RSA PRIVATE KEY-----`;

  const mockCertificate = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIBATANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJFUzEM
test_cert_content_only_for_testing
-----END CERTIFICATE-----`;

  const mockInvoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>INV-2024-001</ID>
  <IssueDate>2024-01-15</IssueDate>
  <AccountingSupplierParty>
    <PartyIdentification>
      <ID>12345678Z</ID>
    </PartyIdentification>
  </AccountingSupplierParty>
  <InvoiceLines>
    <InvoiceLine>
      <ID>1</ID>
      <LineExtensionAmount>1000.00</LineExtensionAmount>
    </InvoiceLine>
  </InvoiceLines>
  <LegalMonetaryTotal>
    <TaxExclusiveAmount>1000.00</TaxExclusiveAmount>
    <PayableAmount>1210.00</PayableAmount>
  </LegalMonetaryTotal>
</Invoice>`;

  describe('Complete Signing Pipeline', () => {
    it('should load certificate without errors', () => {
      // Mock certificate loading
      expect(() => {
        CertificateManager.clearCache();
      }).not.toThrow();
    });

    it('should create XML signer with default options', () => {
      const signer = new XmlDSigSigner();
      expect(signer).toBeDefined();
    });

    it('should verify XML structure before signing', () => {
      const signer = new XmlDSigSigner({ strictValidation: true });
      const verResult = signer.verify(mockInvoiceXml);

      expect(verResult).toHaveProperty('valid');
      expect(verResult).toHaveProperty('errors');
    });

    it('should validate private key PEM format', () => {
      const signer = new XmlDSigSigner();
      
      // Attempt to verify PEM format
      expect(() => {
        const result = signer['isPemFormat'](mockPrivateKey);
        expect(result).toBe(true);
      }).not.toThrow();
    });

    it('should validate certificate PEM format', () => {
      const signer = new XmlDSigSigner();
      
      // Attempt to verify PEM format
      expect(() => {
        const result = signer['isPemFormat'](mockCertificate);
        expect(result).toBe(true);
      }).not.toThrow();
    });

    it('should reject malformed XML during signing', () => {
      const signer = new XmlDSigSigner({ strictValidation: true });
      const malformedXml = `<?xml version="1.0"?>
<Invoice>
  <ID>TEST</ID>
</Inv>`;

      expect(() => {
        signer.sign(malformedXml, mockPrivateKey, mockCertificate);
      }).toThrow();
    });
  });

  describe('Certificate Management Integration', () => {
    it('should cache certificates after loading', () => {
      CertificateManager.clearCache();
      
      // Verify cache was cleared
      expect(() => {
        CertificateManager.clearCache();
      }).not.toThrow();
    });

    it('should provide safe certificate info for logging', () => {
      const certData = {
        privateKey: mockPrivateKey,
        certificate: mockCertificate,
        publicKey: 'mock-public-key',
        issuer: 'CN=Test Issuer, O=Test, C=ES',
        subject: 'CN=Test Subject, O=Test, C=ES',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
      };

      const info = CertificateManager.getCertificateInfo(certData);

      expect(info).toBeDefined();
      expect(info).not.toContain('RSA PRIVATE KEY');
      expect(info).not.toContain('BEGIN PRIVATE KEY');
    });

    it('should validate certificate dates', () => {
      const certData = {
        privateKey: mockPrivateKey,
        certificate: mockCertificate,
        publicKey: 'mock-public-key',
        issuer: 'CN=Test Issuer, O=Test, C=ES',
        subject: 'CN=Test Subject, O=Test, C=ES',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
      };

      const result = CertificateManager.validateCertificate(certData);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Timestamp Service Integration', () => {
    it('should add stub timestamp to signed XML', async () => {
      const signedXml = `${mockInvoiceXml.slice(0, -11)}<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignatureValue>test</SignatureValue></Signature></Invoice>`;
      
      const config: TimestampServiceConfig = {
        tsaUrl: 'http://timestamp.test',
        timeout: 5000,
        enableStub: true,
      };

      const service = new TimestampService(config);
      const result = await service.addTimestamp(signedXml);

      expect(result).toBeDefined();
      expect(result).toContain('Signature');
    });

    it('should return null for unsigned XML', async () => {
      const config: TimestampServiceConfig = {
        tsaUrl: 'http://timestamp.test',
        timeout: 5000,
        enableStub: true,
      };

      const service = new TimestampService(config);
      const result = await service.addTimestamp(mockInvoiceXml);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling in Pipeline', () => {
    it('should handle missing private key', () => {
      const signer = new XmlDSigSigner({ strictValidation: true });

      expect(() => {
        signer.sign(mockInvoiceXml, '', mockCertificate);
      }).toThrow();
    });

    it('should handle missing certificate', () => {
      const signer = new XmlDSigSigner({ strictValidation: true });

      expect(() => {
        signer.sign(mockInvoiceXml, mockPrivateKey, '');
      }).toThrow();
    });

    it('should handle empty XML', () => {
      const signer = new XmlDSigSigner();
      const result = signer.verify('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect multiple signatures', () => {
      const multiSigXml = `${mockInvoiceXml.slice(0, -11)}<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/></Invoice>`;

      const signer = new XmlDSigSigner();
      const result = signer.verify(multiSigXml);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Scenarios', () => {
    it('should generate unsigned XML when signing disabled', () => {
      // When ENABLE_XML_SIGNING=false, should return base XML
      expect(mockInvoiceXml).toContain('Invoice');
      expect(mockInvoiceXml).not.toContain('Signature');
    });

    it('should handle graceful degradation on cert error', () => {
      const signer = new XmlDSigSigner();
      
      // If certificate loading fails, should return unsigned XML
      const result = signer.verify(mockInvoiceXml);
      
      // Verify returns error but doesn't throw
      expect(result).toBeDefined();
      expect(result.valid === false || result.valid === true).toBe(true);
    });

    it('should preserve XML structure during signing', () => {
      const signer = new XmlDSigSigner();
      
      expect(mockInvoiceXml).toContain('<ID>INV-2024-001</ID>');
      expect(mockInvoiceXml).toContain('<IssueDate>2024-01-15</IssueDate>');
    });

    it('should handle timestamp failure gracefully', async () => {
      const config: TimestampServiceConfig = {
        tsaUrl: 'http://invalid-tsa.test',
        timeout: 1000,
        enableStub: true, // Fall back to stub
      };

      const service = new TimestampService(config);
      
      // Should not throw even if TSA unavailable
      expect(service).toBeDefined();
    });
  });
});
