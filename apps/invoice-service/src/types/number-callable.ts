// Implementación de números llamables
// Este archivo proporciona la implementación real de las signaturas de llamada

// Extender el prototipo Number con funcionalidades de llamada
declare global {
  interface Number {
    toCallable(): (...args: any[]) => number;
    invoke(...args: any[]): number;
  }
}

// Implementación de métodos
Object.defineProperty(Number.prototype, 'toCallable', {
  value: function (this: Number): (...args: any[]) => number {
    const numValue: number = this.valueOf();
    return (...args: any[]): number => numValue;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number.prototype, 'invoke', {
  value: function (this: Number, ...args: any[]): number {
    return this.valueOf();
  },
  writable: false,
  configurable: false,
});

// Implementación de propiedad json
Object.defineProperty(Number.prototype, 'json', {
  get: function (this: Number): {
    stringify(): string;
    parse(): number;
    toObject(): { value: number; type: 'number' };
    fromObject(obj: { value: number; type: string }): number;
  } {
    const numValue: number = this.valueOf();
    return {
      stringify: (): string => JSON.stringify(numValue),
      parse: (): number => numValue,
      toObject: (): { value: number; type: 'number' } => ({
        value: numValue,
        type: 'number',
      }),
      fromObject: (obj: { value: number; type: string }): number => obj.value,
    };
  },
  enumerable: false,
  configurable: false,
});

// Implementación de métodos JSON
Object.defineProperty(Number.prototype, 'toJSON', {
  value: function (this: Number): number {
    return this.valueOf();
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number.prototype, 'fromJSON', {
  value: function (this: Number, jsonString: string): number {
    try {
      const parsed: any = JSON.parse(jsonString);
      return typeof parsed === 'number' ? parsed : this.valueOf();
    } catch {
      return this.valueOf();
    }
  },
  writable: false,
  configurable: false,
});

// Extender NumberConstructor
Object.defineProperty(Number, 'callable', {
  value: function (value: number): Number & ((...args: any[]) => number) {
    const num = new Number(value) as Number & ((...args: any[]) => number);
    num.toString = Number.prototype.toString.bind(num);
    num.valueOf = Number.prototype.valueOf.bind(num);
    return num;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number, 'fromCallable', {
  value: function (callable: (...args: any[]) => number): number {
    return callable();
  },
  writable: false,
  configurable: false,
});

export {};
