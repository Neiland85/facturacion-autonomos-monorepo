"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculadorFiscal = void 0;
class CalculadorFiscal {
    static calcularIVA(base, tipoIva = 0.21) {
        return base * tipoIva;
    }
    static calcularIRPF(base, tipoIrpf = 0.15) {
        return base * tipoIrpf;
    }
    static calcularTotalConIVA(base, tipoIva = 0.21) {
        return base + this.calcularIVA(base, tipoIva);
    }
    static calcularNetoTrasIRPF(base, tipoIrpf = 0.15) {
        return base - this.calcularIRPF(base, tipoIrpf);
    }
    static validarNIF(nif) {
        const nifRegex = /^\d{8}[A-Z]$/;
        return nifRegex.test(nif);
    }
    static validarCIF(cif) {
        const cifRegex = /^[A-Z]\d{7}[A-Z]$/;
        return cifRegex.test(cif);
    }
    static validarNIFoCIF(documento) {
        return this.validarNIF(documento) || this.validarCIF(documento);
    }
}
exports.CalculadorFiscal = CalculadorFiscal;
//# sourceMappingURL=calculador.js.map