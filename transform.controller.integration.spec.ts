import request from 'supertest';
import app from './apps/xml-transformer/src/index'; // Importamos la instancia de la app Express

describe('XML Transformer Service - Integration Test', () => {
  // Datos de prueba para una factura válida
  const validInvoiceJson = {
    number: 'FAC-2024-XML-001',
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    issuer: {
      name: 'Emisor de Prueba S.L.',
      fiscalId: 'B12345678',
      address: {
        street: 'Calle del Emisor, 1',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
      },
    },
    client: {
      name: 'Receptor de Prueba S.A.',
      fiscalId: 'A87654321',
      address: {
        street: 'Avenida del Receptor, 45',
        postalCode: '08001',
        city: 'Barcelona',
        province: 'Barcelona',
      },
    },
    lines: [
      {
        description: 'Producto de prueba para XML',
        quantity: 2,
        unitPrice: 50,
        vatRate: 21,
        vatAmount: 21,
        total: 121,
      },
    ],
    subtotal: 100,
    totalVat: 21,
    total: 121,
  };

  it('debería transformar un JSON de factura válido a XML en formato Facturae', async () => {
    // Act: Realizar la petición al endpoint de transformación
    const response = await request(app)
      .post('/api/transform/facturae')
      .send(validInvoiceJson);

    // Assert: Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/xml');

    const xmlBody = response.text;

    // Verificar la estructura básica de Facturae
    expect(xmlBody).toContain('<fe:Facturae');
    expect(xmlBody).toContain('<SchemaVersion>3.2.1</SchemaVersion>');
    expect(xmlBody).toContain('<SellerParty>');
    expect(xmlBody).toContain('<BuyerParty>');
    expect(xmlBody).toContain('<InvoiceLine>');

    // Verificar que los datos se han mapeado correctamente
    expect(xmlBody).toContain(
      '<InvoiceNumber>FAC-2024-XML-001</InvoiceNumber>'
    );
    expect(xmlBody).toContain(
      '<TaxIdentificationNumber>A87654321</TaxIdentificationNumber>'
    ); // NIF del cliente
    expect(xmlBody).toContain(
      '<ItemDescription>Producto de prueba para XML</ItemDescription>'
    );
    expect(xmlBody).toContain('<InvoiceTotal>121.00</InvoiceTotal>');
  });

  it('debería devolver un error 400 si el cuerpo de la petición está vacío', async () => {
    // Act
    const response = await request(app)
      .post('/api/transform/facturae')
      .send({});

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('no puede estar vacío');
  });

  it('debería devolver un error 400 con detalles de Zod si el JSON de entrada es inválido', async () => {
    // Arrange: JSON sin campos requeridos como `issuer` y `lines`
    const invalidJson = {
      number: 'INVALID-INV',
      date: new Date().toISOString(),
      // Faltan `issuer`, `client` y `lines`
    };

    // Act
    const response = await request(app)
      .post('/api/transform/facturae')
      .send(invalidJson);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Datos de entrada inválidos.');
    // Verificar que Zod reporta los campos faltantes
    expect(response.body.details).toHaveProperty('issuer');
    expect(response.body.details).toHaveProperty('client');
    expect(response.body.details.lines[0]).toContain(
      'La factura debe tener al menos una línea'
    );
  });
});
