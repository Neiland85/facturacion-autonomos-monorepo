// Declaraciones de tipos para números llamables
// Este archivo solo contiene las declaraciones de tipos

// Extender el prototipo Number con funcionalidades de llamada
declare global {
  interface Number {
    toCallable(): (...args: unknown[]) => number;
    invoke(...args: unknown[]): number;
  }
}

export {};
