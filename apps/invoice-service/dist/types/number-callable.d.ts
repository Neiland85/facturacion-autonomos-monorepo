declare global {
    interface Number {
        toCallable(): (...args: unknown[]) => number;
        invoke(...args: unknown[]): number;
    }
}
export {};
//# sourceMappingURL=number-callable.d.ts.map