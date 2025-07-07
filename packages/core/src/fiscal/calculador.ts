/**
 * Calculador Fiscal - Clase para realizar cálculos fiscales
 */
export class CalculadorFiscal {
  /**
   * Calcula el IVA
   */
  static calcularIVA(base: number, tipoIva: number = 0.21): number {
    return base * tipoIva;
  }

  /**
   * Calcula el IRPF
   */
  static calcularIRPF(base: number, tipoIrpf: number = 0.15): number {
    return base * tipoIrpf;
  }

  /**
   * Calcula el total con IVA
   */
  static calcularTotalConIVA(base: number, tipoIva: number = 0.21): number {
    return base + this.calcularIVA(base, tipoIva);
  }

  /**
   * Calcula el neto después de IRPF
   */
  static calcularNetoTrasIRPF(base: number, tipoIrpf: number = 0.15): number {
    return base - this.calcularIRPF(base, tipoIrpf);
  }

  /**
   * Valida un NIF español
   */
  static validarNIF(nif: string): boolean {
    const nifRegex = /^\d{8}[A-Z]$/;
    return nifRegex.test(nif);
  }

  /**
   * Valida un CIF español
   */
  static validarCIF(cif: string): boolean {
    const cifRegex = /^[A-Z]\d{7}[A-Z]$/;
    return cifRegex.test(cif);
  }

  /**
   * Valida NIF o CIF
   */
  static validarNIFoCIF(documento: string): boolean {
    return this.validarNIF(documento) || this.validarCIF(documento);
  }
}