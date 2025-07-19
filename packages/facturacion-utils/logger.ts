export function createLogger(namespace: string) {
  return {
    info: (msg: string) => console.log(`[INFO][${namespace}]`, msg),
    warn: (msg: string) => console.warn(`[WARN][${namespace}]`, msg),
    error: (msg: string) => console.error(`[ERROR][${namespace}]`, msg),
  };
}
