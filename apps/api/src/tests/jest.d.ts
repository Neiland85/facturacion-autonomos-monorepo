// jest.d.ts
declare namespace jest {
  function mock(moduleName: string, factory?: () => unknown): unknown;
  function fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
  function clearAllMocks(): void;
  interface Mock<T = any, Y extends any[] = any[]> {
    (...args: Y): T;
    mockReturnValue(value: T): this;
    mockResolvedValue(value: T): this;
  }
}
