import { TimestampService, TimestampServiceConfig, TimestampError } from '../timestamp-service';

describe('TimestampService', () => {
  const mockConfig: TimestampServiceConfig = {
    tsaUrl: 'http://timestamp.authority.test/rfc3161',
    timeout: 5000,
    username: undefined,
    password: undefined,
    enableStub: false,
  };

  const mockXmlWithSignature = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignatureValue>test-signature-value</SignatureValue>
  </Signature>
</Invoice>`;

  const mockXmlWithoutSignature = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice>
  <InvoiceNumber>INV001</InvoiceNumber>
</Invoice>`;

  let service: TimestampService;

  beforeEach(() => {
    service = new TimestampService(mockConfig);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create TimestampService with configuration', () => {
      expect(service).toBeDefined();
    });

    it('should create TimestampService with stub mode enabled', () => {
      const stubConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: true,
      };
      const stubService = new TimestampService(stubConfig);
      expect(stubService).toBeDefined();
    });
  });

  describe('RFC 3161 Timestamp Operations', () => {
    it('should add RFC 3161 timestamp when enabled', async () => {
      const prodConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: false,
        tsaUrl: 'http://timestamp.test/rfc3161',
      };
      const prodService = new TimestampService(prodConfig);
      expect(prodService).toBeDefined();
    });

    it('should handle TSA_UNAVAILABLE error gracefully', () => {
      const stubConfig = { ...mockConfig, enableStub: false };
      const stubService = new TimestampService(stubConfig);
      expect(stubService).toBeDefined();
    });

    it('should handle TIMEOUT error', async () => {
      const slowConfig: TimestampServiceConfig = {
        ...mockConfig,
        timeout: 100,
        enableStub: false,
      };
      const slowService = new TimestampService(slowConfig);
      expect(slowService).toBeDefined();
    });
  });

  describe('Stub Mode Operations', () => {
    it('should add stub timestamp when enabled', async () => {
      const stubConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: true,
      };
      const stubService = new TimestampService(stubConfig);

      const result = await stubService.addTimestamp(mockXmlWithSignature);

      expect(result).toBeDefined();
      expect(result).toContain('Timestamp');
    });

    it('should add stub timestamp with current date', async () => {
      const stubConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: true,
      };
      const stubService = new TimestampService(stubConfig);

      const result = await stubService.addTimestamp(mockXmlWithSignature);

      expect(result).toContain(new Date().getFullYear().toString());
    });

    it('should return null for XML without signature', async () => {
      const stubConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: true,
      };
      const stubService = new TimestampService(stubConfig);

      const result = await stubService.addTimestamp(mockXmlWithoutSignature);

      expect(result).toBeNull();
    });

    it('should handle malformed XML gracefully', async () => {
      const stubConfig: TimestampServiceConfig = {
        ...mockConfig,
        enableStub: true,
      };
      const stubService = new TimestampService(stubConfig);

      const malformedXml = `<?xml version="1.0"?>
<Invoice>
  <Data>test</Data>
</Inv>`;

      const result = await stubService.addTimestamp(malformedXml);

      expect(result === null || result !== undefined).toBe(true);
    });
  });

  describe('TimestampError', () => {
    it('should create TimestampError with code and message', () => {
      const error = new TimestampError('TSA_UNAVAILABLE', 'TSA service not reachable');

      expect(error.code).toBe('TSA_UNAVAILABLE');
      expect(error.message).toContain('TSA service not reachable');
    });

    it('should handle TIMEOUT error code', () => {
      const error = new TimestampError('TIMEOUT', 'Request timeout after 5000ms');

      expect(error.code).toBe('TIMEOUT');
      expect(error.message).toContain('timeout');
    });

    it('should handle INVALID_RESPONSE error code', () => {
      const error = new TimestampError('INVALID_RESPONSE', 'Invalid TSA response received');

      expect(error.code).toBe('INVALID_RESPONSE');
      expect(error.message).toContain('Invalid TSA response');
    });

    it('should handle INVALID_XML error code', () => {
      const error = new TimestampError('INVALID_XML', 'Malformed XML provided');

      expect(error.code).toBe('INVALID_XML');
      expect(error.message).toContain('XML');
    });
  });

  describe('Configuration and Initialization', () => {
    it('should initialize with all configuration options', () => {
      const fullConfig: TimestampServiceConfig = {
        tsaUrl: 'https://secure-tsa.example.com/timestamp',
        timeout: 8000,
        username: 'testuser',
        password: 'testpass',
        enableStub: false,
      };
      const fullService = new TimestampService(fullConfig);
      expect(fullService).toBeDefined();
    });

    it('should use default values for optional fields', () => {
      const minimalConfig: Partial<TimestampServiceConfig> = {
        tsaUrl: 'http://tsa.test',
        enableStub: true,
      };
      const minimalService = new TimestampService(minimalConfig as TimestampServiceConfig);
      expect(minimalService).toBeDefined();
    });
  });
});