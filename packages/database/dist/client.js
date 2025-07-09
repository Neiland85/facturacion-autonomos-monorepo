"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const generated_1 = require("./generated");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new generated_1.PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
//# sourceMappingURL=client.js.map