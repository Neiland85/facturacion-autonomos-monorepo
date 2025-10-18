"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculadorFiscal = void 0;
/**
 * Calculador Fiscal - Clase para realizar cálculos fiscales
 */
class CalculadorFiscal {
    /**
     * Calcula el IVA
     */
    static calcularIVA(base, tipoIva = 0.21) {
        return base * tipoIva;
    }
    /**
     * Calcula el IRPF
     */
    static calcularIRPF(base, tipoIrpf = 0.15) {
        return base * tipoIrpf;
    }
    /**
     * Calcula el total con IVA
     */
    static calcularTotalConIVA(base, tipoIva = 0.21) {
        return base + this.calcularIVA(base, tipoIva);
    }
    /**
     * Calcula el neto después de IRPF
     */
    static calcularNetoTrasIRPF(base, tipoIrpf = 0.15) {
        return base - this.calcularIRPF(base, tipoIrpf);
    }
    /**
     * Valida un NIF español
     */
    static validarNIF(nif) {
        const nifRegex = /^\d{8}[A-Z]$/;
        return nifRegex.test(nif);
    }
    /**
     * Valida un CIF español
     */
    static validarCIF(cif) {
        const cifRegex = /^[A-Z]\d{7}[A-Z]$/;
        return cifRegex.test(cif);
    }
    /**
     * Valida NIF o CIF
     */
    static validarNIFoCIF(documento) {
        return this.validarNIF(documento) || this.validarCIF(documento);
    }
    /**
     * Calcula todos los impuestos de una factura
     */
    static calcularImpuestos(datos) {
        const { baseImponible, tipoIVA = 21, tipoIRPF = 0 } = datos;
        const iva = this.calcularIVA(baseImponible, tipoIVA / 100);
        const irpf = this.calcularIRPF(baseImponible, tipoIRPF / 100);
        const total = baseImponible + iva - irpf;
        return {
            baseImponible,
            iva,
            irpf,
            total,
        };
    }
}
exports.CalculadorFiscal = CalculadorFiscal;
