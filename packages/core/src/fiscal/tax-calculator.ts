<<<<<<< HEAD
export class TaxCalculator {
  calculate(base: number, rate: number): { base: number; rate: number; amount: number; total: number } {
    const amount = base * rate;
    const total = base + amount;
    return { base, rate, amount, total };
  }
}
=======
/**
 * @fileoverview Calculadora de impuestos para autónomos españoles
 * @version 1.0.0
 */

// Tipos de tributación
export type TipoRegimenFiscal =
  | 'estimacion_directa'
  | 'estimacion_objetiva'
  | 'recargo_equivalencia';

// Tipos de IVA
export type TipoIVA = 'general' | 'reducido' | 'superreducido' | 'exento';

// Configuración fiscal del autónomo
export interface ConfiguracionFiscal {
  nif: string;
  nombre: string;
  regimenFiscal: TipoRegimenFiscal;
  actividadEconomica: string;
  codigoIAE: string;
  fechaInicioActividad: Date;
  // Deducciones específicas
  deduccionSede: number;
  deduccionVehiculo: number;
  deduccionMaterial: number;
  porcentajeGastosDeducibles: number;
}

// Resultado del cálculo de impuestos
export interface CalculoImpuestos {
  // Ingresos y gastos
  ingresosNetos: number;
  gastosDeducibles: number;
  baseImponible: number;

  // IRPF
  irpfTrimestral: number;
  irpfAnual: number;
  retencionesAplicadas: number;

  // IVA
  ivaRepercutido: number;
  ivaSoportado: number;
  ivaTrimestral: number;

  // Seguridad Social
  cuotaSeguridadSocial: number;

  // Totales
  impuestosTotales: number;
  beneficioNeto: number;
}

// Rangos de IRPF 2024
const TRAMOS_IRPF_2024 = [
  { desde: 0, hasta: 12450, tipo: 0.19 },
  { desde: 12450, hasta: 20200, tipo: 0.24 },
  { desde: 20200, hasta: 35200, tipo: 0.3 },
  { desde: 35200, hasta: 60000, tipo: 0.37 },
  { desde: 60000, hasta: 300000, tipo: 0.47 },
  { desde: 300000, hasta: Infinity, tipo: 0.47 },
];

// Tipos de IVA 2024
const TIPOS_IVA_2024 = {
  general: 0.21,
  reducido: 0.1,
  superreducido: 0.04,
  exento: 0.0,
};

// Cuota mínima de autónomos 2024
const CUOTA_MINIMA_AUTONOMOS_2024 = 294.0; // Base mínima mensual

/**
 * Calculadora principal de impuestos para autónomos
 */
export class TaxCalculator {
  private readonly configuracion: ConfiguracionFiscal;

  constructor(configuracion: ConfiguracionFiscal) {
    this.configuracion = configuracion;
  }

  /**
   * Calcula el IRPF según los tramos vigentes
   */
  calcularIRPF(baseImponible: number): number {
    let irpf = 0;
    let baseRestante = baseImponible;

    for (const tramo of TRAMOS_IRPF_2024) {
      if (baseRestante <= 0) break;

      const baseTramo = Math.min(baseRestante, tramo.hasta - tramo.desde);
      irpf += baseTramo * tramo.tipo;
      baseRestante -= baseTramo;
    }

    return irpf;
  }

  /**
   * Calcula el IVA según el tipo aplicable
   */
  calcularIVA(base: number, tipoIVA: TipoIVA): number {
    return base * TIPOS_IVA_2024[tipoIVA];
  }

  /**
   * Calcula la cuota de autónomos según la base de cotización
   */
  calcularCuotaAutonomos(
    baseCotizacion: number = CUOTA_MINIMA_AUTONOMOS_2024
  ): number {
    // Simplificado - en realidad depende de muchos factores
    return baseCotizacion;
  }

  /**
   * Aplica deducciones específicas del autónomo
   */
  aplicarDeducciones(ingresos: number, gastos: number): number {
    const gastosDeducibles =
      gastos +
      this.configuracion.deduccionSede +
      this.configuracion.deduccionVehiculo +
      this.configuracion.deduccionMaterial;

    const porcentajeAdicional =
      ingresos * (this.configuracion.porcentajeGastosDeducibles / 100);

    return gastosDeducibles + porcentajeAdicional;
  }

  /**
   * Cálculo completo de impuestos trimestrales
   */
  calcularImpuestosTrimestre(
    ingresosTrimestre: number,
    gastosTrimestre: number,
    tipoIVA: TipoIVA = 'general',
    retencionesAplicadas: number = 0
  ): CalculoImpuestos {
    // Calcular base imponible
    const gastosDeducibles = this.aplicarDeducciones(
      ingresosTrimestre,
      gastosTrimestre
    );
    const baseImponible = Math.max(0, ingresosTrimestre - gastosDeducibles);

    // IRPF
    const irpfAnual = this.calcularIRPF(baseImponible * 4); // Proyección anual
    const irpfTrimestral = irpfAnual / 4;

    // IVA
    const ivaRepercutido = this.calcularIVA(ingresosTrimestre, tipoIVA);
    const ivaSoportado = this.calcularIVA(gastosTrimestre, tipoIVA);
    const ivaTrimestral = Math.max(0, ivaRepercutido - ivaSoportado);

    // Seguridad Social (trimestral)
    const cuotaSeguridadSocial = this.calcularCuotaAutonomos() * 3;

    // Totales
    const impuestosTotales =
      irpfTrimestral +
      ivaTrimestral +
      cuotaSeguridadSocial -
      retencionesAplicadas;
    const beneficioNeto = baseImponible - impuestosTotales;

    return {
      ingresosNetos: ingresosTrimestre,
      gastosDeducibles,
      baseImponible,
      irpfTrimestral,
      irpfAnual,
      retencionesAplicadas,
      ivaRepercutido,
      ivaSoportado,
      ivaTrimestral,
      cuotaSeguridadSocial,
      impuestosTotales,
      beneficioNeto,
    };
  }

  /**
   * Estima los pagos fraccionados trimestrales
   */
  estimarPagosFraccionados(baseImponibleAnualEstimada: number): number {
    // 20% de la base imponible estimada para pagos fraccionados
    return (baseImponibleAnualEstimada * 0.2) / 4;
  }

  /**
   * Calcula la retención recomendada para facturas
   */
  calcularRetencionFactura(importeFactura: number): number {
    // 15% de retención estándar para profesionales
    return importeFactura * 0.15;
  }

  /**
   * Genera un resumen fiscal trimestral
   */
  generarResumenTrimestral(
    trimestre: number,
    año: number,
    datosTrimestrales: {
      ingresos: number;
      gastos: number;
      tipoIVA: TipoIVA;
      retenciones: number;
    }
  ): string {
    const calculo = this.calcularImpuestosTrimestre(
      datosTrimestrales.ingresos,
      datosTrimestrales.gastos,
      datosTrimestrales.tipoIVA,
      datosTrimestrales.retenciones
    );

    return `
=== RESUMEN FISCAL T${trimestre}/${año} ===
Autónomo: ${this.configuracion.nombre} (${this.configuracion.nif})
Régimen: ${this.configuracion.regimenFiscal}

INGRESOS Y GASTOS:
- Ingresos netos: ${calculo.ingresosNetos.toFixed(2)}€
- Gastos deducibles: ${calculo.gastosDeducibles.toFixed(2)}€
- Base imponible: ${calculo.baseImponible.toFixed(2)}€

IRPF:
- IRPF trimestral: ${calculo.irpfTrimestral.toFixed(2)}€
- Retenciones aplicadas: ${calculo.retencionesAplicadas.toFixed(2)}€

IVA:
- IVA repercutido: ${calculo.ivaRepercutido.toFixed(2)}€
- IVA soportado: ${calculo.ivaSoportado.toFixed(2)}€
- IVA a ingresar: ${calculo.ivaTrimestral.toFixed(2)}€

SEGURIDAD SOCIAL:
- Cuota trimestral: ${calculo.cuotaSeguridadSocial.toFixed(2)}€

RESUMEN:
- Total impuestos: ${calculo.impuestosTotales.toFixed(2)}€
- Beneficio neto: ${calculo.beneficioNeto.toFixed(2)}€
    `.trim();
  }
}

/**
 * Funciones de utilidad para validaciones fiscales
 */
export const validarNIF = (nif: string): boolean => {
  const nifRegex = /^\d{8}[A-Z]$/;
  if (!nifRegex.test(nif)) return false;

  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const numero = parseInt(nif.substring(0, 8), 10);
  const letra = nif.charAt(8);

  return letra === letras.charAt(numero % 23);
};

export const validarCIF = (cif: string): boolean => {
  const cifRegex = /^[A-Z]\d{7}[\dA-Z]$/;
  return cifRegex.test(cif);
};

export const calcularDigitoControlIBAN = (iban: string): boolean => {
  // Implementación simplificada de validación IBAN
  const ibanRegex = /^ES\d{22}$/;
  return ibanRegex.test(iban);
};

/**
 * Constantes fiscales útiles
 */
export const CONSTANTES_FISCALES = {
  TIPOS_IVA: TIPOS_IVA_2024,
  TRAMOS_IRPF: TRAMOS_IRPF_2024,
  CUOTA_MINIMA_AUTONOMOS: CUOTA_MINIMA_AUTONOMOS_2024,
  RETENCION_PROFESIONALES: 0.15,
  PAGO_FRACCIONADO_PORCENTAJE: 0.2,
  LIMITE_OPERACIONES_EFECTIVO: 1000,
  LIMITE_SIMPLIFICADO_IVA: 400000,
};
>>>>>>> origin/develop
