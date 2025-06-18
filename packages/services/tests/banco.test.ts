import { describe, expect, test, jest } from '@jest/globals';
import { BancoService } from '../src/banco/banco.service';

jest.mock('axios');

describe('BancoService', () => {
  const config = {
    apiKey: 'test-key',
    apiSecret: 'test-secret',
    sandbox: true
  };

  const service = new BancoService(config);

  test('se construye correctamente', () => {
    expect(service).toBeInstanceOf(BancoService);
  });

  test('obtiene listado de cuentas', async () => {
    const mockCuentas = [
      {
        iban: 'ES1234567890',
        titular: 'Test SL',
        saldo: 1000
      }
    ];

    // TODO: Implementar test con mock de axios
  });

  test('obtiene movimientos de cuenta', async () => {
    const mockMovimientos = [
      {
        id: '1',
        fecha: new Date(),
        concepto: 'Factura Test',
        importe: 1000,
        saldo: 2000
      }
    ];

    // TODO: Implementar test con mock de axios
  });

  test('categoriza movimientos correctamente', async () => {
    const movimientos = [
      {
        id: '1',
        fecha: new Date(),
        concepto: 'Cobro Factura',
        importe: 1000,
        saldo: 2000
      },
      {
        id: '2',
        fecha: new Date(),
        concepto: 'Pago IRPF',
        importe: -500,
        saldo: 1500
      }
    ];

    const categorias = await service.categorizarMovimientos(movimientos);
    
    expect(categorias.ingresos).toHaveLength(1);
    expect(categorias.impuestos).toHaveLength(1);
  });
});
