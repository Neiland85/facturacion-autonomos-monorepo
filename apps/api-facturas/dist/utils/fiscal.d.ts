export declare function validarNIF(nif: string): boolean;
export declare const TIPOS_IVA: {
    readonly EXENTO: 0;
    readonly SUPERREDUCIDO: 4;
    readonly REDUCIDO: 10;
    readonly GENERAL: 21;
};
export declare const TIPOS_IRPF: {
    readonly EXENTO: 0;
    readonly PROFESIONAL: 15;
    readonly ACTIVIDAD_ECONOMICA: 1;
};
export declare function validarTipoIVA(tipo: number): boolean;
export declare function validarTipoIRPF(tipo: number): boolean;
export declare function formatearMoneda(cantidad: number): string;
export declare function formatearFecha(fecha: Date): string;
export declare function calcularFechaVencimiento(fechaEmision: Date, dias?: number): Date;
//# sourceMappingURL=fiscal.d.ts.map