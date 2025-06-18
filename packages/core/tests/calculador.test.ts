import { describe, expect, test } from '@jest/globals';
import { CalculadorFiscal } from '../src/fiscal/calculador';
import { Factura } from '../src/types';

describe('CalculadorFiscal', () => {
  const calculador = new CalculadorFiscal();
  
  const facturaBase: Factura = {
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

  test('calcula correctamente el IVA', () => {
    expect(calculador.calcularIVA(1000, 21)).toBe(210);
    expect(calculador.calcularIVA(1000, 10)).toBe(100);
    expect(calculador.calcularIVA(1000, 4)).toBe(40);
  });

  test('calcula correctamente la retención', () => {
    expect(calculador.calcularRetencion(1000)).toBe(150);
    expect(calculador.calcularRetencion(1000, 19)).toBe(190);
  });

  test('valida una factura correcta', () => {
    expect(calculador.validarFactura(facturaBase)).toBe(true);
  });

  test('detecta una factura con cálculos incorrectos', () => {
    const facturaErronea = {
      ...facturaBase,
      iva: 200 // IVA incorrecto
    };
    expect(calculador.validarFactura(facturaErronea)).toBe(false);
  });

  test('calcula correctamente los totales del trimestre', () => {
    const facturas = [
      facturaBase,
      {
        ...facturaBase,
        numero: 'F2025-002',
        fecha: new Date('2025-02-15'),
        baseImponible: 2000,
        iva: 420,
        total: 2420
      }
    ];

    const totales = calculador.calcularTotalesTrimestre(facturas, {
      año: 2025,
      trimestre: '1T',
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-03-31')
    });

    expect(totales.baseImponible).toBe(3000);
    expect(totales.iva).toBe(630);
    expect(totales.total).toBe(3630);
  });
});
