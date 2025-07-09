export declare class CalculadorFiscal {
    static calcularIVA(base: number, tipoIva?: number): number;
    static calcularIRPF(base: number, tipoIrpf?: number): number;
    static calcularTotalConIVA(base: number, tipoIva?: number): number;
    static calcularNetoTrasIRPF(base: number, tipoIrpf?: number): number;
    static validarNIF(nif: string): boolean;
    static validarCIF(cif: string): boolean;
    static validarNIFoCIF(documento: string): boolean;
}
//# sourceMappingURL=calculador.d.ts.map