import { describe, expect, test, jest } from '@jest/globals';
import { AEATService } from '../src/aeat/sii.service';
import { Factura } from '@tributariapp/core';

const mockFactura: Factura = {
  numero: 'F2025-001',
  fecha: new Date('2025-01-15'),
  emisor: {
    nombre: 'Test SL',
    nif: '12345678Z',
    direccion: 'Calle Test 1'
  },
  receptor: {
    nombre: 'Cliente Test',
    nif: '87654321X',
    direccion: 'Calle Cliente 1'
  },
  conceptos: [
    {
      descripcion: 'Servicio test',
      cantidad: 1,
      precioUnitario: 1000,
      tipoIVA: 21,
      importe: 1000
    }
  ],
  baseImponible: 1000,
  iva: 210,
  total: 1210
};

jest.mock('axios');

describe('AEATService', () => {
  const config = {
    certificado: 'test-cert',
    clave: 'test-key',
    entorno: 'pruebas' as const
  };

  const service = new AEATService(config);

  test('se construye correctamente', () => {
    expect(service).toBeInstanceOf(AEATService);
  });

  test('envía factura al SII', async () => {
    // TODO: Implementar test con mock de axios
  });

  test('consulta facturas del SII', async () => {
    // TODO: Implementar test con mock de axios
  });
});
