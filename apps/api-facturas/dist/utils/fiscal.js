"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPOS_IRPF = exports.TIPOS_IVA = void 0;
exports.validarNIF = validarNIF;
exports.validarTipoIVA = validarTipoIVA;
exports.validarTipoIRPF = validarTipoIRPF;
exports.formatearMoneda = formatearMoneda;
exports.formatearFecha = formatearFecha;
exports.calcularFechaVencimiento = calcularFechaVencimiento;
function validarNIF(nif) {
    if (!nif || typeof nif !== 'string') {
        return false;
    }
    const nifLimpio = nif.trim().toUpperCase();
    const dniRegex = /^\d{8}[A-Z]$/;
    if (dniRegex.test(nifLimpio)) {
        return validarNIFPersona(nifLimpio);
    }
    const cifRegex = /^[A-Z]\d{7}[A-Z0-9]$/;
    if (cifRegex.test(nifLimpio)) {
        return validarCIF(nifLimpio);
    }
    return false;
}
function validarNIFPersona(nif) {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const numero = parseInt(nif.substring(0, 8), 10);
    const letra = nif.charAt(8);
    return letras.charAt(numero % 23) === letra;
}
function validarCIF(cif) {
    const codigoOrganizacion = cif.charAt(0);
    const numero = cif.substring(1, 8);
    const control = cif.charAt(8);
    const codigosValidos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'N', 'P', 'Q', 'R', 'S', 'U', 'V', 'W'];
    if (!codigosValidos.includes(codigoOrganizacion)) {
        return false;
    }
    let suma = 0;
    for (let i = 0; i < 7; i++) {
        const digito = parseInt(numero.charAt(i), 10);
        if (i % 2 === 0) {
            const multiplicacion = digito * 2;
            suma += multiplicacion > 9 ? multiplicacion - 9 : multiplicacion;
        }
        else {
            suma += digito;
        }
    }
    const unidad = suma % 10;
    const digitoControl = unidad === 0 ? 0 : 10 - unidad;
    const letrasControl = 'JABCDEFGHI';
    const letraControl = letrasControl.charAt(digitoControl);
    return control === digitoControl.toString() || control === letraControl;
}
exports.TIPOS_IVA = {
    EXENTO: 0,
    SUPERREDUCIDO: 4,
    REDUCIDO: 10,
    GENERAL: 21
};
exports.TIPOS_IRPF = {
    EXENTO: 0,
    PROFESIONAL: 15,
    ACTIVIDAD_ECONOMICA: 1
};
function validarTipoIVA(tipo) {
    return Object.values(exports.TIPOS_IVA).includes(tipo);
}
function validarTipoIRPF(tipo) {
    return tipo >= 0 && tipo <= 47;
}
function formatearMoneda(cantidad) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cantidad);
}
function formatearFecha(fecha) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(fecha);
}
function calcularFechaVencimiento(fechaEmision, dias = 30) {
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);
    return fechaVencimiento;
}
//# sourceMappingURL=fiscal.js.map