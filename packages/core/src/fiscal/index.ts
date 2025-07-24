/**
 * @fileoverview Exportaciones principales del módulo fiscal
 * @version 1.0.0
 */

// Exportar calculadora de impuestos
export { CONSTANTES_FISCALES, TaxCalculator } from './tax-calculator';
export type {
    CalculoImpuestos, ConfiguracionFiscal, TipoIVA, TipoRegimenFiscal
} from './tax-calculator';

// Exportar validadores de documentos
export {
    formatearDocumento,
    generarNIFAleatorio,
    obtenerLetraNIF, validarCIF, validarDocumento, validarNIE, validarNIF
} from './nif-validator';

import type { TipoIVA } from './tax-calculator';

// Tipos y constantes adicionales
export interface DatosFiscalesTrimestre {
  trimestre: 1 | 2 | 3 | 4;
  año: number;
  ingresos: number;
  gastos: number;
  retenciones: number;
  tipoIVA: TipoIVA;
}

export interface ResumenAnualFiscal {
  año: number;
  ingresosTotales: number;
  gastosTotales: number;
  baseImponibleTotal: number;
  irpfTotal: number;
  ivaTotal: number;
  seguridadSocialTotal: number;
  beneficioNetoTotal: number;
  trimestres: DatosFiscalesTrimestre[];
}

// Utilidades fiscales
export const TRIMESTRES_FISCALES = {
  T1: {
    nombre: 'Primer Trimestre',
    meses: [1, 2, 3],
    vencimiento: '20 de abril',
  },
  T2: {
    nombre: 'Segundo Trimestre',
    meses: [4, 5, 6],
    vencimiento: '20 de julio',
  },
  T3: {
    nombre: 'Tercer Trimestre',
    meses: [7, 8, 9],
    vencimiento: '20 de octubre',
  },
  T4: {
    nombre: 'Cuarto Trimestre',
    meses: [10, 11, 12],
    vencimiento: '30 de enero del año siguiente',
  },
} as const;

export const FECHAS_IMPORTANTES_FISCALES = {
  RENTA: '30 de junio',
  IVA_ANUAL: '30 de enero',
  MODELO_303: '20 del mes siguiente al trimestre',
  MODELO_130: '20 del mes siguiente al trimestre',
  MODELO_131: '20 del mes siguiente al trimestre',
} as const;
