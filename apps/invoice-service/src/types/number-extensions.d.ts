// Tipos globales para invoice-service
// Extiende tipos nativos con funcionalidades adicionales

declare global {
  // Extender Number con funcionalidades adicionales
  interface Number {
    // Propiedad json para serialización
    json: {
      stringify(): string;
      parse(): number;
      toObject(): { value: number; type: 'number' };
      fromObject(obj: { value: number; type: 'number' }): number;
    };

    // Métodos adicionales para JSON
    toJSON(): number;
    fromJSON(jsonString: string): number;

    // Métodos de función para números
    call(this: Number, ...args: unknown[]): number;
    apply(this: Number, thisArg: unknown, args?: unknown[]): number;
    bind(
      this: Number,
      thisArg: unknown,
      ...args: unknown[]
    ): (...args: unknown[]) => number;

    // Utilidades adicionales
    toCallable(): (...args: unknown[]) => number;
    invoke(...args: unknown[]): number;
  }

  // Extender NumberConstructor
  interface NumberConstructor {
    callable(value: number): Number & ((...args: unknown[]) => number);
    fromCallable(callable: (...args: unknown[]) => number): number;
  }
}

export {};
