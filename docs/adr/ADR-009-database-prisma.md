# ADR-009: Base de Datos con Prisma ORM

## Estado

**Aceptado** - Julio 2025

## Contexto

Necesitamos una solución de base de datos robusta para gestionar facturas, clientes y datos fiscales. La aplicación requiere:

- Modelado de datos relacional complejo
- Type safety con TypeScript
- Migrations automáticas
- Performance optimizada
- Integración con monorepo

## Decisión

Adoptamos **Prisma ORM** con **PostgreSQL** como base de datos principal.

## Arquitectura de Base de Datos

### Estructura Principal

\`\`\`
├── prisma/
│ ├── schema.prisma # Schema principal
│ ├── migrations/ # Migrations automáticas
│ ├── seed.ts # Data seeding
│ └── client.ts # Cliente configurado
├── packages/database/ # Package dedicado
│ ├── src/
│ │ ├── index.ts # Exports principales
│ │ ├── client.ts # Prisma client
│ │ ├── types.ts # Tipos generados
│ │ └── helpers.ts # Utilidades
\`\`\`

## Schema Principal

### Modelos Principales

\`\`\`prisma
// prisma/schema.prisma
generator client {
provider = "prisma-client-js"
output = "../packages/database/src/generated"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model User {
id String @id @default(cuid())
email String @unique
name String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
company Company?
invoices Invoice[]
clients Client[]

@@map("users")
}

model Company {
id String @id @default(cuid())
name String
cif String @unique
address String
city String
postalCode String
province String
phone String?
email String?
website String?

// Datos fiscales
taxRegime TaxRegime @default(GENERAL)
vatNumber String?

// Relaciones
userId String @unique
user User @relation(fields: [userId], references: [id])
invoices Invoice[]

@@map("companies")
}

model Client {
id String @id @default(cuid())
name String
nifCif String
address String?
city String?
postalCode String?
province String?
phone String?
email String?

// Relaciones
userId String
user User @relation(fields: [userId], references: [id])
invoices Invoice[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("clients")
}

model Invoice {
id String @id @default(cuid())
number String @unique
series String @default("A")
issueDate DateTime
dueDate DateTime?

// Importes
subtotal Decimal @db.Decimal(10,2)
vatAmount Decimal @db.Decimal(10,2)
total Decimal @db.Decimal(10,2)

// Estado
status InvoiceStatus @default(DRAFT)
paidAt DateTime?

// SII Integration
siiSent Boolean @default(false)
siiReference String?
siiSentAt DateTime?

// Relaciones
companyId String
company Company @relation(fields: [companyId], references: [id])
clientId String
client Client @relation(fields: [clientId], references: [id])
userId String
user User @relation(fields: [userId], references: [id])
lines InvoiceLine[]

// Metadatos
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("invoices")
}

model InvoiceLine {
id String @id @default(cuid())
description String
quantity Decimal @db.Decimal(10,2)
unitPrice Decimal @db.Decimal(10,2)
vatRate Decimal @db.Decimal(5,2) @default(21.00)
amount Decimal @db.Decimal(10,2)

// Relaciones
invoiceId String
invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

@@map("invoice_lines")
}

// Enums
enum TaxRegime {
GENERAL
SIMPLIFIED
AGRICULTURE

@@map("tax_regimes")
}

enum InvoiceStatus {
DRAFT
SENT
PAID
OVERDUE
CANCELLED

@@map("invoice_statuses")
}
\`\`\`

## Configuración del Cliente

### packages/database/src/client.ts

\`\`\`typescript
import { PrismaClient } from './generated'

const globalForPrisma = globalThis as unknown as {
prisma: PrismaClient | undefined
}

export const prisma =
globalForPrisma.prisma ??
new PrismaClient({
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
\`\`\`

### packages/database/src/index.ts

\`\`\`typescript
export { prisma } from './client'
export _ from './generated'
export _ from './types'
export \* from './helpers'
\`\`\`

## Integración con TypeScript

### Tipos Generados

\`\`\`typescript
// packages/database/src/types.ts
import type { Prisma } from './generated'

// Tipos extendidos para la aplicación
export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
include: {
client: true
company: true
lines: true
}
}>

export type ClientWithInvoices = Prisma.ClientGetPayload<{
include: {
invoices: {
include: {
lines: true
}
}
}
}>

// Tipos para forms
export type CreateInvoiceData = Prisma.InvoiceCreateInput
export type UpdateInvoiceData = Prisma.InvoiceUpdateInput
export type CreateClientData = Prisma.ClientCreateInput
\`\`\`

## Scripts de Desarrollo

### package.json scripts

\`\`\`json
{
"scripts": {
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "tsx prisma/seed.ts",
"db:studio": "prisma studio",
"db:reset": "prisma migrate reset"
}
}
\`\`\`

## Consecuencias

### Positivas ✅

- **Type Safety**: Tipos automáticos para toda la base de datos
- **Migration System**: Control de versiones de schema
- **Performance**: Query optimization automático
- **Developer Experience**: Prisma Studio para debugging
- **Monorepo Integration**: Package dedicado para reutilización

### Negativas ❌

- **Bundle Size**: Cliente Prisma añade peso
- **Learning Curve**: Sintaxis específica de Prisma
- **Vendor Lock-in**: Dependencia fuerte del ORM

## Implementación

### Environment Variables

\`\`\`bash

# .env

DATABASE_URL="postgresql://user:password@localhost:5432/facturacion"
DIRECT_URL="postgresql://user:password@localhost:5432/facturacion"
\`\`\`

### Docker Configuration

\`\`\`yaml

# docker-compose.yml

services:
postgres:
image: postgres:15
environment:
POSTGRES_DB: facturacion
POSTGRES_USER: user
POSTGRES_PASSWORD: password
ports: - "5432:5432"
volumes: - postgres_data:/var/lib/postgresql/data

volumes:
postgres_data:
\`\`\`

## Próximos Pasos

### ✅ Completado

1. **Setup inicial**: ✅ Package de database creado y configurado
2. **Generación de cliente**: ✅ Cliente de Prisma generado correctamente
3. **Corrección de tipos**: ✅ Todos los errores de TypeScript corregidos
4. **Compilación**: ✅ Package compila sin errores

### 🔄 En progreso

5. **Environment setup**: Configurar variables de entorno y base de datos
6. **Migrations**: Ejecutar primera migración
7. **Seed data**: Crear datos de ejemplo

### 📋 Pendientes

8. **Integration**: Conectar con APIs
9. **Testing**: Setup de tests con database

## Progreso de Implementación - Iteración 2

### ✅ Completado (9 de julio de 2025)

#### Integración con API de Facturas
- **Configuración de Workspace Dependencies**: Se estableció correctamente la dependencia `@facturacion/database` en el package.json de `api-facturas`
- **Controlador de Facturas**: Se creó un controlador completo con operaciones CRUD:
  - `FacturasController.getAll()` - Obtener todas las facturas con paginación
  - `FacturasController.getById()` - Obtener factura por ID
  - `FacturasController.create()` - Crear nueva factura
  - `FacturasController.update()` - Actualizar factura existente
  - `FacturasController.delete()` - Eliminar factura
- **Rutas REST**: Se implementaron las rutas básicas del API REST para facturas
- **Tipado TypeScript**: Se corrigieron todos los errores de tipado en el controlador
- **Importación del Cliente Prisma**: Se integró correctamente la importación del cliente desde el package de database

#### Correcciones de Configuración
- **Package.json del API**: Se configuró correctamente con todas las dependencias necesarias
- **Instalación de Dependencias**: Se resolvieron los conflictos de workspace y se instalaron correctamente todas las dependencias del monorepo
- **Rutas Simplificadas**: Se creó un sistema de rutas más simple y mantenible
- **Estructura de Respuestas**: Se estandarizó el formato de respuestas del API con manejo de errores

### 🔄 En Progreso
- **Build del Monorepo**: Se está ejecutando el build completo para verificar que todas las integraciones funcionen correctamente
- **Verificación de Compilación**: Validando que no hay errores de TypeScript en la integración

### ⏳ Próximos Pasos Inmediatos
1. **Setup de Base de Datos**: Configurar PostgreSQL local o cloud para testing
2. **Migraciones Iniciales**: Ejecutar `prisma migrate dev --name init`
3. **Testing de Integración**: Probar las operaciones CRUD con datos reales
4. **Middleware de Validación**: Implementar validación de datos de entrada
5. **Documentación API**: Generar documentación Swagger/OpenAPI

## Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [TypeScript with Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
