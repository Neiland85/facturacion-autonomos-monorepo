// Declaraciones globales para extender tipos nativos

// Extender el tipo Number con funcionalidades adicionales
declare global {
  interface Number {
    // Método de utilidad para llamar números
    call(this: Number, ...args: any[]): number;

    // Método apply para números
    apply(this: Number, thisArg: any, args?: any[]): number;

    // Método bind para números
    bind(
      this: Number,
      thisArg: any,
      ...args: any[]
    ): (...args: any[]) => number;

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
  }

  // Extender NumberConstructor si es necesario
  interface NumberConstructor {
    // Permite crear números llamables
    callable(value: number): Number & ((...args: any[]) => number);
  }
}

// Extensión del prototipo Number para signaturas de llamada
declare global {
  interface Number {
    // Implementación de signatura de llamada
    (this: Number, ...args: any[]): number;
  }
}

export {};
