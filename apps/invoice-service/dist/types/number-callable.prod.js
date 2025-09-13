// Extensiones de Number para producción
// Este archivo se carga solo en entornos de producción
// Implementación de métodos para producción
Object.defineProperty(Number.prototype, 'toCallable', {
    value: function () {
        const numValue = this.valueOf();
        return (..._args) => numValue;
    },
    writable: false,
    configurable: false,
});
Object.defineProperty(Number.prototype, 'invoke', {
    value: function (..._args) {
        return this.valueOf();
    },
    writable: false,
    configurable: false,
});
Object.defineProperty(Number.prototype, 'json', {
    get: function () {
        const numValue = this.valueOf();
        return {
            stringify: () => JSON.stringify(numValue),
            parse: () => numValue,
            toObject: () => ({
                value: numValue,
                type: 'number',
            }),
            fromObject: (obj) => obj.value,
        };
    },
    enumerable: false,
    configurable: false,
});
Object.defineProperty(Number, 'callable', {
    value: function (value) {
        const num = new Number(value);
        num.toString = Number.prototype.toString.bind(num);
        num.valueOf = Number.prototype.valueOf.bind(num);
        return num;
    },
    writable: false,
    configurable: false,
});
Object.defineProperty(Number, 'fromCallable', {
    value: function (callable) {
        return callable();
    },
    writable: false,
    configurable: false,
});
export {};
//# sourceMappingURL=number-callable.prod.js.map