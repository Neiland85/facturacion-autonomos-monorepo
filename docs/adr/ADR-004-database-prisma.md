# ADR-004: Configuración de Base de Datos y ORM con Prisma

## Estado

**Propuesto** - Julio 2025

## Contexto

Necesitamos una solución de persistencia de datos que soporte:

- Tipado fuerte con TypeScript
- Migraciones automáticas y versionado
- Queries optimizadas y type-safe
- Compatibilidad con el monorepo
- Desarrollo local y producción

## Decisión

Adoptamos **PostgreSQL** como base de datos principal con **Prisma ORM** para gestión de datos.

## Configuración Técnica

### Estructura de Base de Datos

\`\`\`prisma
// prisma/schema.prisma
generator client {
provider = "prisma-client-js"
output = "../packages/core/src/generated/prisma-client"
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
invoices Invoice[]
clients Client[]

@@map("users")
}

model Client {
id String @id @default(cuid())
name String
email String?
nif String @unique
address String?
city String?
postalCode String?
phone String?

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
date DateTime
dueDate DateTime?
subtotal Decimal @db.Decimal(10, 2)
taxRate Decimal @db.Decimal(5, 2)
taxAmount Decimal @db.Decimal(10, 2)
total Decimal @db.Decimal(10, 2)
status InvoiceStatus @default(DRAFT)
notes String?

// AEAT/SII Integration
siiSent Boolean @default(false)
siiReference String?
siiSentAt DateTime?

// Relaciones
userId String
user User @relation(fields: [userId], references: [id])
clientId String
client Client @relation(fields: [clientId], references: [id])
items InvoiceItem[]

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("invoices")
}

model InvoiceItem {
id String @id @default(cuid())
description String
quantity Decimal @db.Decimal(10, 3)
unitPrice Decimal @db.Decimal(10, 2)
total Decimal @db.Decimal(10, 2)

// Relaciones
invoiceId String
invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

@@map("invoice_items")
}

enum InvoiceStatus {
DRAFT
SENT
PAID
OVERDUE
CANCELLED
}
\`\`\`

### Configuración de Desarrollo

\`\`\`typescript
// packages/core/src/db/index.ts
import { PrismaClient } from '../generated/prisma-client'

declare global {
var \_\_prisma: PrismaClient | undefined
}

export const prisma = globalThis.\_\_prisma || new PrismaClient({
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
globalThis.\_\_prisma = prisma
}

// Export types
export \* from '../generated/prisma-client'
\`\`\`

### Docker Compose para Desarrollo

\`\`\`yaml

# docker-compose.dev.yml

version: '3.8'

services:
postgres:
image: postgres:15-alpine
restart: always
environment:
POSTGRES_DB: tributariapp_dev
POSTGRES_USER: dev_user
POSTGRES_PASSWORD: dev_password
ports: - "5432:5432"
volumes: - postgres_dev_data:/var/lib/postgresql/data - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql

redis:
image: redis:7-alpine
restart: always
ports: - "6379:6379"
volumes: - redis_dev_data:/data

volumes:
postgres_dev_data:
redis_dev_data:
\`\`\`

### Variables de Entorno

\`\`\`bash

# .env.development

DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/tributariapp_dev"
REDIS_URL="redis://localhost:6379"

# .env.production

DATABASE_URL="${DATABASE_URL}"
REDIS_URL="${REDIS_URL}"
\`\`\`

### Scripts de Package.json

\`\`\`json
{
"scripts": {
"db:generate": "prisma generate",
"db:push": "prisma db push",
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio",
"db:seed": "tsx prisma/seed.ts",
"db:reset": "prisma migrate reset --force"
}
}
\`\`\`

## Implementación por Fases

### Fase 1: Setup Básico (Semana 1)

- [ ] Configurar PostgreSQL con Docker
- [ ] Definir schema inicial de Prisma
- [ ] Configurar cliente de Prisma en packages/core
- [ ] Crear seeds de datos de desarrollo

### Fase 2: Integración API (Semana 2)

- [ ] Integrar Prisma en APIs
- [ ] Implementar repositorios/servicios
- [ ] Crear middleware de base de datos
- [ ] Testing de integración

### Fase 3: Migraciones y Producción (Semana 3)

- [ ] Setup de migraciones automáticas
- [ ] Configuración de producción
- [ ] Backup y restore procedures
- [ ] Monitoring y logging

## Consecuencias

### Positivas ✅

- **Type Safety**: Queries completamente tipadas
- **Performance**: Queries optimizadas automáticamente
- **Developer Experience**: IntelliSense completo
- **Migraciones**: Versionado automático de esquema
- **Monorepo**: Cliente compartido entre apps

### Negativas ❌

- **Complejidad**: Configuración inicial compleja
- **Vendor Lock-in**: Dependencia de Prisma
- **Learning Curve**: Team necesita aprender Prisma

## Alternativas Consideradas

1. **TypeORM**: Rechazado por complejidad de configuración
2. **Drizzle**: Considerado pero menos maduro
3. **Raw SQL**: Rechazado por falta de type safety

## Configuraciones de VS Code

\`\`\`json
{
"prisma.showPrismaDataPlatformNotification": false,
"files.associations": {
"\*.prisma": "prisma"
}
}
\`\`\`
