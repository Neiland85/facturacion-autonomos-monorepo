import { Factura } from '@tributariapp/core';

export const facturaFixture: Factura = {
  numero: 'F2025-001',
  fecha: new Date('2025-06-18'),
  emisor: {
    nombre: 'Test Company SL',
    nif: 'B12345678',
    direccion: 'Calle Test 123'
  },
  receptor: {
    nombre: 'Cliente Test SA',
    nif: 'A87654321',
    direccion: 'Avenida Cliente 456'
  },
  conceptos: [
    {
      descripcion: 'Servicio de desarrollo',
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

export const facturaConRetencionFixture: Factura = {
  ...facturaFixture,
  numero: 'F2025-002',
  retencion: 150,
  total: 1060
};

export const generarFactura = (overrides: Partial<Factura> = {}): Factura => ({
  ...facturaFixture,
  numero: `F2025-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  fecha: new Date(),
  ...overrides
});
