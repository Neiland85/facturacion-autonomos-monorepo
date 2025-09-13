'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.prisma = void 0;
// Cliente Prisma básico para desarrollo
class BasicPrismaClient {
  constructor(options = {}) {
    this.options = options;
    console.log('🗄️ Basic Prisma Client initialized (development mode)');
  }

  // Métodos básicos simulados
  $connect() {
    return Promise.resolve();
  }
  $disconnect() {
    return Promise.resolve();
  }

  // Simular algunas colecciones
  user = {
    findUnique: () => null,
    findMany: () => [],
    create: () => ({}),
    update: () => ({}),
    delete: () => ({}),
  };

  invoice = {
    findUnique: () => null,
    findMany: () => [],
    create: () => ({}),
    update: () => ({}),
    delete: () => ({}),
  };
}

const globalForPrisma = globalThis;
exports.prisma =
  globalForPrisma.prisma ??
  new BasicPrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  });
if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
//# sourceMappingURL=client.js.map
