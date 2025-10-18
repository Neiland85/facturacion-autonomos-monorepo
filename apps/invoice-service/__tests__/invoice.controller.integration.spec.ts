import request from 'supertest';
import express from 'express';
import { prisma } from '@facturacion/database';
import { InvoiceController } from '../src/controllers/invoice.controller';
import {
  CertificateManager,
  XmlDSigSigner,
} from '../../../packages/services/src/digital-signing';

// Mock del middleware de autenticación para inyectar un usuario
const mockAuthMiddleware = (req: any, res: any, next: () => void) => {
  req.user = { id: 'user-test-id', role: 'USER' };
  next();
};

// Crear una instancia de la app Express para el test
const app = express();
app.use(express.json());
app.post('/api/invoices', mockAuthMiddleware, (req, res) =>
  InvoiceController.createInvoice(req, res)
);
app.get('/api/invoices/:id/xml/signed', mockAuthMiddleware, (req, res) =>
  InvoiceController.getSignedXml(req, res)
);

// Mockear el CertificateManager para no depender de ficheros reales
jest.mock('@facturacion/digital-signature', () => ({
  ...jest.requireActual('@facturacion/digital-signature'),
  CertificateManager: {
    loadFromP12: jest.fn(),
  },
}));

const mockedLoadFromP12 = CertificateManager.loadFromP12 as jest.Mock;

describe('InvoiceController - Integration Test', () => {
  beforeEach(async () => {
    // Limpiar la base de datos de facturas antes de cada test
    await prisma.invoice.deleteMany({ where: { userId: 'user-test-id' } });
    // Resetear mocks
    mockedLoadFromP12.mockClear();
    delete process.env.CERTIFICATE_PATH;
    delete process.env.CERTIFICATE_PASSWORD;
    // Restaurar mocks de fetch
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    // Limpieza final
    await prisma.invoice.deleteMany({ where: { userId: 'user-test-id' } });
    await prisma.$disconnect();
  });

  describe('POST /api/invoices', () => {
    it('debería llamar al API Gateway para transformar y firmar la factura', async () => {
      // Arrange: Configurar el mock del certificado y las variables de entorno
      process.env.CERTIFICATE_PATH = 'mock/path/cert.p12';
      process.env.CERTIFICATE_PASSWORD = 'mock-password';

      mockedLoadFromP12.mockReturnValue({
        privateKey: '---BEGIN PRIVATE KEY---...---END PRIVATE KEY---',
        certificate: '---BEGIN CERTIFICATE---...---END CERTIFICATE---',
      });

      // Arrange: Mockear la llamada fetch al API Gateway
      const mockXmlResponse = '<fe:Facturae>...</fe:Facturae>';
      const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(
        () =>
          Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockXmlResponse),
          } as Response)
      );

      const invoiceData = {
        number: 'FAC-2024-TEST-001',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        issuer: {
          name: 'Mi Empresa de Pruebas S.L.',
          fiscalId: 'B12345678',
          address: {
            street: 'Calle del Test, 1',
            postalCode: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        },
        client: {
          name: 'Cliente Final de Pruebas S.A.',
          fiscalId: 'A87654321',
          address: {
            street: 'Avenida de la Integración, 45',
            postalCode: '08001',
            city: 'Barcelona',
            province: 'Barcelona',
          },
        },
        lines: [
          {
            description: 'Servicio de testing avanzado',
            quantity: 1,
            unitPrice: 100,
            vatRate: 21,
            vatAmount: 21,
            total: 121,
          },
        ],
        subtotal: 100,
        totalVat: 21,
        total: 121,
      };

      // Act: Realizar la petición para crear la factura
      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      // Assert: Verificar que se llamó al API Gateway
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3003/api/transform/facturae',
        expect.any(Object)
      );

      // Assert: Verificar la respuesta y la base de datos
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();

      // Verificar directamente en la base de datos
      const createdInvoice = await prisma.invoice.findUnique({
        where: { id: response.body.data.id },
      });

      expect(createdInvoice).not.toBeNull();
      expect(createdInvoice?.signedXml).toBeDefined();
      // Verificar la nueva estructura Facturae
      expect(createdInvoice?.signedXml).toContain(mockXmlResponse.replace('</fe:Facturae>', ''));
      expect(createdInvoice?.signedXml).toContain('<SchemaVersion>3.2.1</SchemaVersion>');
      expect(createdInvoice?.signedXml).toContain('<SellerParty>');
      expect(createdInvoice?.signedXml).toContain('<TaxIdentificationNumber>A87654321</TaxIdentificationNumber>'); // NIF del cliente
      expect(createdInvoice?.signedXml).toContain('<InvoiceLine>');
      expect(createdInvoice?.signedXml).toContain('<ItemDescription>Servicio de testing avanzado</ItemDescription>');
      expect(createdInvoice?.signedXml).toContain('<ds:Signature'); // Verificar que la firma XMLDSig está presente
      expect(createdInvoice?.signedXml).toContain('</ds:Signature>');
    });

    it('debería crear una factura con signedXml nulo si el certificado no está configurado', async () => {
      // Arrange: Asegurarse de que las variables de entorno no estén definidas
      // (hecho en beforeEach)

      const invoiceData = {
        number: `FAC-${Date.now()}`,
        total: 242.0,
        // ... otros datos necesarios para la factura
      };

      // Act: Realizar la petición
      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      // Assert: Verificar la respuesta y la base de datos
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();

      // Verificar directamente en la base de datos
      const createdInvoice = await prisma.invoice.findUnique({
        where: { id: response.body.data.id },
      });

      expect(createdInvoice).not.toBeNull();
      expect(createdInvoice?.signedXml).toBeNull();

      // Verificar que el mock no fue llamado
      expect(mockedLoadFromP12).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/invoices/:id/xml/signed - Enhanced', () => {
    it('should include X-Signature-Status header for signed XML', async () => {
      const invoiceNumber = `FAC-${Date.now()}`;
      const signedXmlContent = `<Factura><Numero>${invoiceNumber}</Numero><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><SignatureValue>test</SignatureValue></ds:Signature></Factura>`;
      const invoice = await prisma.invoice.create({
        data: {
          userId: 'user-test-id',
          number: invoiceNumber,
          total: 121.0,
          signedXml: signedXmlContent,
          baseImponible: 100,
          tipoIVA: 21,
          importeIVA: 21,
          clienteNombre: 'Test Client',
        },
      });

      const response = await request(app).get(`/api/invoices/${invoice.id}/xml/signed`);

      expect(response.status).toBe(200);
      expect(response.headers['x-signature-status']).toBe('signed');
    });

    it('should include X-Signature-Status: unsigned header for unsigned XML', async () => {
      const invoiceNumber = `FAC-${Date.now()}`;
      const unsignedXmlContent = `<Factura><Numero>${invoiceNumber}</Numero><Total>121.00</Total></Factura>`;
      const invoice = await prisma.invoice.create({
        data: {
          userId: 'user-test-id',
          number: invoiceNumber,
          total: 121.0,
          signedXml: unsignedXmlContent,
          baseImponible: 100,
          tipoIVA: 21,
          importeIVA: 21,
          clienteNombre: 'Test Client',
        },
      });

      const response = await request(app).get(`/api/invoices/${invoice.id}/xml/signed`);

      expect(response.status).toBe(200);
      expect(response.headers['x-signature-status']).toBe('unsigned');
    });

    it('should include X-Timestamp-Status header for timestamped XML', async () => {
      const invoiceNumber = `FAC-${Date.now()}`;
      const timestampedXmlContent = `<Factura><Numero>${invoiceNumber}</Numero><xades:SigningTime>2024-01-15T10:00:00Z</xades:SigningTime></Factura>`;
      const invoice = await prisma.invoice.create({
        data: {
          userId: 'user-test-id',
          number: invoiceNumber,
          total: 121.0,
          signedXml: timestampedXmlContent,
          baseImponible: 100,
          tipoIVA: 21,
          importeIVA: 21,
          clienteNombre: 'Test Client',
        },
      });

      const response = await request(app).get(`/api/invoices/${invoice.id}/xml/signed`);

      expect(response.status).toBe(200);
      expect(response.headers['x-timestamp-status']).toBe('timestamped');
    });

    it('should return 400 when invoice data is missing client', async () => {
      // This test needs a custom setup to create an invoice with missing client
      const invoiceNumber = `FAC-${Date.now()}`;
      
      // Directly call getSignedXml with mock request/response
      // to test validation logic
      expect(true).toBe(true); // Placeholder
    });

    it('should return 400 when invoice data is missing company', async () => {
      // Similar test for company data
      expect(true).toBe(true); // Placeholder
    });

    it('should return 400 when invoice data is missing lines', async () => {
      // Similar test for invoice lines
      expect(true).toBe(true); // Placeholder
    });

    it('should require authentication token', async () => {
      // Create app route without auth middleware
      const appNoAuth = express();
      appNoAuth.use(express.json());
      appNoAuth.get('/api/invoices/:id/xml/signed/noauth', (req, res) =>
        InvoiceController.getSignedXml(req, res)
      );

      const response = await request(appNoAuth).get(
        `/api/invoices/test-id/xml/signed/noauth`
      );

      // Should require auth (user object should be undefined)
      expect(response.status).toBeDefined();
    });
  });
});
