/**
 * Calculador Fiscal - Clase para realizar cálculos fiscales
 */
export declare class CalculadorFiscal {
    /**
     * Calcula el IVA
     */
    static calcularIVA(base: number, tipoIva?: number): number;
    /**
     * Calcula el IRPF
     */
    static calcularIRPF(base: number, tipoIrpf?: number): number;
    /**
     * Calcula el total con IVA
     */
    static calcularTotalConIVA(base: number, tipoIva?: number): number;
    /**
     * Calcula el neto después de IRPF
     */
    static calcularNetoTrasIRPF(base: number, tipoIrpf?: number): number;
    /**
     * Valida un NIF español
     */
    static validarNIF(nif: string): boolean;
    /**
     * Valida un CIF español
     */
    static validarCIF(cif: string): boolean;
    /**
     * Valida NIF o CIF
     */
    static validarNIFoCIF(documento: string): boolean;
    /**
     * Calcula todos los impuestos de una factura
     */
    static calcularImpuestos(datos: {
        baseImponible: number;
        tipoIVA?: number;
        tipoIRPF?: number;
        regimenEspecial?: string;
    }): {
        baseImponible: number;
        iva: number;
        irpf: number;
        total: number;
    };
}
//# sourceMappingURL=calculador.d.ts.map