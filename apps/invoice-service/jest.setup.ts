// Jest setup file for invoice-service
// Add any global test setup here

// Mock de extensiones de Number para tests
Object.defineProperty(Number.prototype, 'toCallable', {
  value: function (this: Number): (...args: unknown[]) => number {
    const numValue: number = this.valueOf();
    return (..._args: unknown[]): number => numValue;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number.prototype, 'invoke', {
  value: function (this: Number, ...args: unknown[]): number {
    return this.valueOf();
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number.prototype, 'json', {
  get: function (this: Number): {
    stringify(): string;
    parse(): number;
    toObject(): { value: number; type: 'number' };
    fromObject(obj: { value: number; type: 'number' }): number;
  } {
    const numValue: number = this.valueOf();
    return {
      stringify: (): string => JSON.stringify(numValue),
      parse: (): number => numValue,
      toObject: (): { value: number; type: 'number' } => ({
        value: numValue,
        type: 'number',
      }),
      fromObject: (obj: { value: number; type: 'number' }): number => obj.value,
    };
  },
  enumerable: false,
  configurable: false,
});

Object.defineProperty(Number, 'callable', {
  value: function (value: number): Number & ((...args: unknown[]) => number) {
    const num = new Number(value) as Number & ((...args: unknown[]) => number);
    num.toString = Number.prototype.toString.bind(num);
    num.valueOf = Number.prototype.valueOf.bind(num);
    return num;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(Number, 'fromCallable', {
  value: function (callable: (...args: unknown[]) => number): number {
    return callable();
  },
  writable: false,
  configurable: false,
});

// Example: Global test timeout
// jest.setTimeout(10000);

// Example: Global before/after hooks
// beforeAll(async () => {
//   // Setup code
// });

// afterAll(async () => {
//   // Cleanup code
// });
