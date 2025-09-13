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
      fromObject(obj: { value: number; type: string }): number;
    };

    // Métodos adicionales para JSON
    toJSON(): number;
    fromJSON(jsonString: string): number;

    // Métodos de función para números
    call(this: Number, ...args: any[]): number;
    apply(this: Number, thisArg: any, args?: any[]): number;
    bind(
      this: Number,
      thisArg: any,
      ...args: any[]
    ): (...args: any[]) => number;

    // Utilidades adicionales
    toCallable(): (...args: any[]) => number;
    invoke(...args: any[]): number;
  }

  // Extender NumberConstructor
  interface NumberConstructor {
    callable(value: number): Number & ((...args: any[]) => number);
    fromCallable(callable: (...args: any[]) => number): number;
  }
}

export {};
