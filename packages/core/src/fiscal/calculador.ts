import { facturaSchema } from '../schemas/factura.schema';
import { Factura, Trimestre, TIPOS_IVA } from '../types';

export class CalculadorFiscal {
  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  calcularBaseImponible(conceptos: Factura['conceptos']): number {
    return this.redondear(
      conceptos.reduce((acc, concepto) => acc + concepto.importe, 0)
    );
  }

  calcularIVA(baseImponible: number, tipo: number): number {
    if (!TIPOS_IVA.some(t => t.tipo === tipo)) {
      throw new Error(`Tipo de IVA ${tipo}% no válido`);
    }
    return this.redondear((baseImponible * tipo) / 100);
  }

  calcularRetencion(baseImponible: number, porcentajeRetencion: number = 15): number {
    return this.redondear((baseImponible * porcentajeRetencion) / 100);
  }

  calcularTotalFactura(factura: Factura): number {
    const total = factura.baseImponible + factura.iva;
    return this.redondear(
      factura.retencion ? total - factura.retencion : total
    );
  }

  validarFactura(factura: Factura): boolean {
    try {
      facturaSchema.parse(factura);
      
      // Validaciones adicionales de negocio
      const baseCalculada = this.calcularBaseImponible(factura.conceptos);
      if (baseCalculada !== factura.baseImponible) {
        throw new Error('La base imponible no coincide con el cálculo');
      }

      const ivaCalculado = factura.conceptos.reduce((acc, concepto) => {
        return acc + this.calcularIVA(concepto.importe, concepto.tipoIVA);
      }, 0);
      
      if (this.redondear(ivaCalculado) !== this.redondear(factura.iva)) {
        throw new Error('El IVA no coincide con el cálculo');
      }

      const totalCalculado = this.calcularTotalFactura(factura);
      if (this.redondear(totalCalculado) !== this.redondear(factura.total)) {
        throw new Error('El total no coincide con el cálculo');
      }

      return true;
    } catch (error) {
      console.error('Error validando factura:', error);
      return false;
    }
  }

  obtenerFechasTrimestre(trimestre: Trimestre): { inicio: Date; fin: Date } {
    const año = trimestre.año;
    switch (trimestre.trimestre) {
      case '1T':
        return {
          inicio: new Date(año, 0, 1),
          fin: new Date(año, 2, 31, 23, 59, 59)
        };
      case '2T':
        return {
          inicio: new Date(año, 3, 1),
          fin: new Date(año, 5, 30, 23, 59, 59)
        };
      case '3T':
        return {
          inicio: new Date(año, 6, 1),
          fin: new Date(año, 8, 30, 23, 59, 59)
        };
      case '4T':
        return {
          inicio: new Date(año, 9, 1),
          fin: new Date(año, 11, 31, 23, 59, 59)
        };
    }
  }

  calcularTotalesTrimestre(facturas: Factura[], trimestre: Trimestre) {
    const { inicio, fin } = this.obtenerFechasTrimestre(trimestre);
    
    const facturasDelTrimestre = facturas.filter(f => 
      f.fecha >= inicio && f.fecha <= fin
    );

    return {
      baseImponible: this.redondear(
        facturasDelTrimestre.reduce((acc, f) => acc + f.baseImponible, 0)
      ),
      iva: this.redondear(
        facturasDelTrimestre.reduce((acc, f) => acc + f.iva, 0)
      ),
      retencion: this.redondear(
        facturasDelTrimestre.reduce((acc, f) => acc + (f.retencion || 0), 0)
      ),
      total: this.redondear(
        facturasDelTrimestre.reduce((acc, f) => acc + f.total, 0)
      )
    };
  }
}
