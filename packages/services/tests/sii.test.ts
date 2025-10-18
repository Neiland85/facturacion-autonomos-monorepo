import { SIIService, createSIIService, SIISubmissionResult } from '../src/aeat/sii.service';
import { CertificateManager } from '../../../certificate-manager';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../certificate-manager');

const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock invoice data
const mockInvoice = {
  id: 'inv-123',
  invoiceNumber: 'FAC-2024-001',
  invoiceDate: new Date('2024-01-15'),
  userId: 'user-123',
  clientId: 'client-123',
  companyId: 'company-123',
  status: 'DRAFT',
  netAmount: 1000,
  taxAmount: 210,
  totalAmount: 1210,
  siiSent: false,
  siiReference: null,
  siiSentAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  client: {
    id: 'client-123',
    name: 'Cliente SA',
    nif: '87654321B',
    email: 'cliente@example.com',
    phone: '612345678',
    address: 'Calle Principal 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  company: {
    id: 'company-123',
    name: 'Mi Empresa SL',
    nif: '12345678A',
    email: 'empresa@example.com',
    phone: '911234567',
    address: 'Calle Empresa 456',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  lines: [
    {
      id: 'line-1',
      invoiceId: 'inv-123',
      description: 'Servicio profesional',
      quantity: 1,
      unitPrice: 1000,
      netAmount: 1000,
      taxRate: 21,
      taxAmount: 210,
      totalAmount: 1210,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

// Mock AEAT response
const mockAEATResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <sii:SuministroLRFacturasEmitidas xmlns:sii="http://www.agenciatributaria.es/wlpl/SiiStd/Aduanas/Tipos/espDatos/v1.0">
      <sii:RegistroLRFacturasEmitidas>
        <sii:CSV>ABC1234567890XYZ</sii:CSV>
        <sii:Estado>Correcto</sii:Estado>
      </sii:RegistroLRFacturasEmitidas>
    </sii:SuministroLRFacturasEmitidas>
  </soap:Body>
</soap:Envelope>`;

describe('SIIService', () => {
  let siiService: SIIService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock certificate loading
    (CertificateManager.loadFromP12 as jest.Mock).mockReturnValue({
      privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----',
      certificate: '-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----',
      publicKey: '-----BEGIN PUBLIC KEY-----\nMOCK_PUBLIC_KEY\n-----END PUBLIC KEY-----',
      issuer: 'CN=Mock Issuer',
      subject: 'CN=Mock Subject',
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-01-01'),
    });

    // Initialize service
    siiService = new SIIService({
      apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
      nif: '12345678A',
      testMode: true,
      certificatePath: '/path/to/cert.p12',
      certificatePassword: 'password123',
      retryAttempts: 3,
      retryDelay: 100,
      timeout: 30000,
    });
  });

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      expect(siiService).toBeDefined();
    });

    it('should load certificate on initialization', () => {
      expect(CertificateManager.loadFromP12).toHaveBeenCalledWith(
        '/path/to/cert.p12',
        'password123'
      );
    });

    it('should throw error if certificate loading fails', () => {
      (CertificateManager.loadFromP12 as jest.Mock).mockReturnValueOnce(null);

      expect(() => {
        new SIIService({
          apiUrl: 'https://test.aeat.es',
          nif: '12345678A',
          testMode: true,
          certificatePath: '/invalid/cert.p12',
          certificatePassword: 'password123',
          retryAttempts: 3,
          retryDelay: 100,
          timeout: 30000,
        });
      }).toThrow('Failed to load certificate');
    });
  });

  describe('Invoice Transformation', () => {
    it('should transform invoice to SII format correctly', async () => {
      const soapXml = await siiService.transformInvoice(mockInvoice as any);

      expect(soapXml).toContain('FAC-2024-001');
      expect(soapXml).toContain('12345678A');
      expect(soapXml).toContain('87654321B');
      expect(soapXml).toContain('1000.00');
      expect(soapXml).toContain('210.00');
      expect(soapXml).toContain('1210.00');
    });

    it('should format dates correctly (DD-MM-YYYY)', async () => {
      const soapXml = await siiService.transformInvoice(mockInvoice as any);

      // Date should be formatted as DD-MM-YYYY
      expect(soapXml).toMatch(/15-01-2024/);
    });

    it('should escape XML special characters', async () => {
      const invoiceWithSpecialChars = {
        ...mockInvoice,
        company: {
          ...mockInvoice.company,
          name: 'Empresa & Co. <test>',
        },
      };

      const soapXml = await siiService.transformInvoice(invoiceWithSpecialChars as any);

      expect(soapXml).toContain('&amp;');
      expect(soapXml).toContain('&lt;');
      expect(soapXml).toContain('&gt;');
    });

    it('should include proper XML namespaces', async () => {
      const soapXml = await siiService.transformInvoice(mockInvoice as any);

      expect(soapXml).toContain('xmlns:soapenv=');
      expect(soapXml).toContain('xmlns:sii=');
    });
  });

  describe('AEAT Submission', () => {
    it('should submit invoice successfully and return CSV', async () => {
      mockAxios.create.mockReturnValueOnce({
        post: jest.fn().mockResolvedValueOnce({
          data: mockAEATResponse,
          status: 200,
        }),
      } as any);

      // Re-initialize with mocked axios
      siiService = new SIIService({
        apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
        nif: '12345678A',
        testMode: true,
        certificatePath: '/path/to/cert.p12',
        certificatePassword: 'password123',
        retryAttempts: 3,
        retryDelay: 100,
        timeout: 30000,
      });

      const result = await siiService.submitInvoice(mockInvoice as any);

      expect(result.success).toBe(true);
      expect(result.csv).toBe('ABC1234567890XYZ');
    });

    it('should handle AEAT error response', async () => {
      const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <sii:SuministroLRFacturasEmitidas xmlns:sii="http://www.agenciatributaria.es/wlpl/SiiStd/Aduanas/Tipos/espDatos/v1.0">
      <sii:RegistroLRFacturasEmitidas>
        <sii:Estado>Incorrecto</sii:Estado>
        <sii:CodigoErrorRegistro>3003</sii:CodigoErrorRegistro>
        <sii:DescripcionErrorRegistro>NIF Receptor no válido</sii:DescripcionErrorRegistro>
      </sii:RegistroLRFacturasEmitidas>
    </sii:SuministroLRFacturasEmitidas>
  </soap:Body>
</soap:Envelope>`;

      mockAxios.create.mockReturnValueOnce({
        post: jest.fn().mockResolvedValueOnce({
          data: errorResponse,
          status: 200,
        }),
      } as any);

      siiService = new SIIService({
        apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
        nif: '12345678A',
        testMode: true,
        certificatePath: '/path/to/cert.p12',
        certificatePassword: 'password123',
        retryAttempts: 3,
        retryDelay: 100,
        timeout: 30000,
      });

      const result = await siiService.submitInvoice(mockInvoice as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('NIF Receptor no válido');
    });

    it('should retry on network errors', async () => {
      const postMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValueOnce({
          data: mockAEATResponse,
          status: 200,
        });

      mockAxios.create.mockReturnValueOnce({
        post: postMock,
      } as any);

      siiService = new SIIService({
        apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
        nif: '12345678A',
        testMode: true,
        certificatePath: '/path/to/cert.p12',
        certificatePassword: 'password123',
        retryAttempts: 3,
        retryDelay: 50,
        timeout: 30000,
      });

      const result = await siiService.submitInvoice(mockInvoice as any);

      // Should eventually succeed after retries
      expect(postMock).toHaveBeenCalledTimes(3);
    });

    it('should respect max retry attempts', async () => {
      const postMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      mockAxios.create.mockReturnValueOnce({
        post: postMock,
      } as any);

      siiService = new SIIService({
        apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
        nif: '12345678A',
        testMode: true,
        certificatePath: '/path/to/cert.p12',
        certificatePassword: 'password123',
        retryAttempts: 2,
        retryDelay: 50,
        timeout: 30000,
      });

      const result = await siiService.submitInvoice(mockInvoice as any);

      expect(result.success).toBe(false);
      expect(postMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid certificate path', () => {
      (CertificateManager.loadFromP12 as jest.Mock).mockReturnValueOnce(null);

      expect(() => {
        new SIIService({
          apiUrl: 'https://test.aeat.es',
          nif: '12345678A',
          testMode: true,
          certificatePath: '/invalid/path.p12',
          certificatePassword: 'password123',
          retryAttempts: 3,
          retryDelay: 100,
          timeout: 30000,
        });
      }).toThrow();
    });

    it('should handle malformed XML responses', async () => {
      mockAxios.create.mockReturnValueOnce({
        post: jest.fn().mockResolvedValueOnce({
          data: 'Invalid XML',
          status: 200,
        }),
      } as any);

      siiService = new SIIService({
        apiUrl: 'https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd',
        nif: '12345678A',
        testMode: true,
        certificatePath: '/path/to/cert.p12',
        certificatePassword: 'password123',
        retryAttempts: 3,
        retryDelay: 100,
        timeout: 30000,
      });

      const result = await siiService.submitInvoice(mockInvoice as any);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});

describe('createSIIService Factory', () => {
  it('should create service with environment variables', () => {
    process.env.AEAT_NIF = '12345678A';
    process.env.AEAT_CERTIFICATE_PATH = '/path/to/cert.p12';
    process.env.AEAT_CERTIFICATE_PASSWORD = 'password123';
    process.env.AEAT_RETRY_ATTEMPTS = '3';
    process.env.AEAT_RETRY_DELAY = '5000';
    process.env.AEAT_TIMEOUT = '60000';

    const service = createSIIService();

    expect(service).toBeDefined();
  });

  it('should throw if required variables missing', () => {
    delete process.env.AEAT_CERTIFICATE_PATH;

    expect(() => {
      createSIIService();
    }).toThrow('AEAT_CERTIFICATE_PATH is required');
  });

  it('should merge provided config with environment variables', () => {
    process.env.AEAT_NIF = '12345678A';
    process.env.AEAT_CERTIFICATE_PATH = '/path/to/cert.p12';
    process.env.AEAT_CERTIFICATE_PASSWORD = 'password123';

    const service = createSIIService({
      nif: '87654321B',
      testMode: false,
    });

    expect(service).toBeDefined();
  });
});
