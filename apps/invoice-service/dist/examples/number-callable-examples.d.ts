import '../types/number-callable';
declare const numero = 42;
declare const callableNumero: (...args: unknown[]) => number;
declare const numeroCallable: Number & ((...args: unknown[]) => number);
declare const numeroDesdeCallable: number;
declare const resultado: number;
declare const numeroParaJson = 42;
declare const numeroDesdeObjeto: number;
declare const numeroTipado: number;
declare const callableTipadoDemo: (...args: unknown[]) => number;
declare const valorInvocadoDemo: number;
declare const valorJSONDemo: number;
declare const jsonStringDemo: string;
declare const numeroParseadoDemo: number;
declare const objetoTipadoDemo: {
    value: number;
    type: 'number';
};
declare const numeroDesdeObjetoDemo: number;
declare const numeroCallableTipadoDemo: Number & ((...args: unknown[]) => number);
declare const numeroDesdeCallableDemo: number;
declare const numeroDemo: number;
declare const jsonHandler: {
    stringify(): string;
    parse(): number;
    toObject(): {
        value: number;
        type: "number";
    };
    fromObject(obj: {
        value: number;
        type: "number";
    }): number;
};
export { callableNumero, callableTipadoDemo, jsonHandler, jsonStringDemo, numero, numeroCallable, numeroCallableTipadoDemo, numeroDemo, numeroDesdeCallable, numeroDesdeCallableDemo, numeroDesdeObjeto, numeroDesdeObjetoDemo, numeroParaJson, numeroParseadoDemo, numeroTipado, objetoTipadoDemo, resultado, valorInvocadoDemo, valorJSONDemo, };
//# sourceMappingURL=number-callable-examples.d.ts.map