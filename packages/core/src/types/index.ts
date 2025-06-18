// Interfaces
export interface TipoImpositivo {
  tipo: number;  // 21, 10, 4, 0
  descripcion: string;
  esReducido: boolean;
}

export interface Factura {
  numero: string;
  fecha: Date;
  emisor: {
    nombre: string;
    nif: string;
    direccion: string;
  };
  receptor: {
    nombre: string;
    nif: string;
    direccion: string;
  };
  conceptos: LineaFactura[];
  baseImponible: number;
  iva: number;
  total: number;
  retencion?: number;
}

export interface LineaFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tipoIVA: number;
  importe: number;
}

export interface Trimestre {
  año: number;
  trimestre: '1T' | '2T' | '3T' | '4T';
  fechaInicio: Date;
  fechaFin: Date;
}

// Tipos de IVA disponibles
export const TIPOS_IVA: TipoImpositivo[] = [
  { tipo: 21, descripcion: 'IVA General', esReducido: false },
  { tipo: 10, descripcion: 'IVA Reducido', esReducido: true },
  { tipo: 4, descripcion: 'IVA Superreducido', esReducido: true },
  { tipo: 0, descripcion: 'IVA Exento', esReducido: true }
];
