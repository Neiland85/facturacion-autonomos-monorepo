import { z } from 'zod';
import { default as axios } from 'axios';

// Validación de configuración
const configSchema = z.object({
  apiKey: z.string(),
  apiSecret: z.string(),
  sandbox: z.boolean().default(false)
});

type BancoConfig = z.infer<typeof configSchema>;

interface CuentaBancaria {
  iban: string;
  titular: string;
  saldo: number;
}

interface Movimiento {
  id: string;
  fecha: Date;
  concepto: string;
  importe: number;
  saldo: number;
}

export class BancoService {
  private config: BancoConfig;
  private baseUrl: string;

  constructor(config: BancoConfig) {
    this.config = configSchema.parse(config);
    this.baseUrl = this.config.sandbox
      ? 'https://sandbox.banco-api.com/v1'
      : 'https://api.banco.com/v1';
  }

  private async request<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error en llamada a API bancaria:', error);
      throw new Error('Error en la comunicación con el banco');
    }
  }

  async obtenerCuentas(): Promise<CuentaBancaria[]> {
    return this.request<CuentaBancaria[]>('/cuentas');
  }

  async obtenerMovimientos(iban: string, desde: Date, hasta: Date): Promise<Movimiento[]> {
    const params = new URLSearchParams({
      desde: desde.toISOString(),
      hasta: hasta.toISOString()
    });
    
    return this.request<Movimiento[]>(`/cuentas/${iban}/movimientos?${params}`);
  }

  async obtenerSaldo(iban: string): Promise<number> {
    const cuenta = await this.request<CuentaBancaria>(`/cuentas/${iban}`);
    return cuenta.saldo;
  }

  async categorizarMovimientos(movimientos: Movimiento[]): Promise<Record<string, Movimiento[]>> {
    // Implementar categorización por ML/reglas
    const categorias: Record<string, Movimiento[]> = {
      ingresos: [],
      gastos: [],
      impuestos: [],
      otros: []
    };

    movimientos.forEach(movimiento => {
      if (movimiento.importe > 0) {
        categorias.ingresos.push(movimiento);
      } else if (movimiento.concepto.toLowerCase().includes('impuesto')) {
        categorias.impuestos.push(movimiento);
      } else if (movimiento.importe < 0) {
        categorias.gastos.push(movimiento);
      } else {
        categorias.otros.push(movimiento);
      }
    });

    return categorias;
  }
}
