// --- package.json ---
{
"name": "facturacion-autonomos-monorepo",
"version": "1.0.0",
"private": true,
"packageManager": "yarn@4.9.2",
"workspaces": [
"apps/*",
"packages/*"
],
"scripts": {
"dev": "turbo run dev",
"build": "turbo run build",
"test": "turbo run test",
"lint": "turbo run lint",
"type-check": "turbo run type-check",
"clean": "turbo run clean",
"format": "prettier --write \"\*_/_.{ts,tsx,js,jsx,json,md}\"",
"adr:new": "node scripts/create-adr.mjs",
"db:generate": "turbo run db:generate",
"db:push": "turbo run db:push",
"db:studio": "turbo run db:studio"
},
"devDependencies": {
"@turbo/gen": "^2.3.0",
"turbo": "^2.3.0",
"prettier": "^3.3.3",
"typescript": "^5.7.2",
"@types/node": "^22.10.1",
"eslint": "^9.15.0",
"@typescript-eslint/eslint-plugin": "^8.15.0",
"@typescript-eslint/parser": "^8.15.0",
"jest": "^29.7.0",
"ts-jest": "^29.2.5",
"@types/jest": "^29.5.14",
"cypress": "^13.15.2",
"playwright": "^1.48.2",
"@playwright/test": "^1.48.2"
},
"engines": {
"node": ">=20.0.0",
"yarn": ">=4.0.0"
}
}

// --- .yarnrc.yml ---
nodeLinker: pnp
enableGlobalCache: true
compressionLevel: mixed
enableTelemetry: false
packageExtensions:
"@types/react@_":
dependencies:
"@types/react": "_"

plugins:

- path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
  spec: "@yarnpkg/plugin-interactive-tools"

yarnPath: .yarn/releases/yarn-4.9.2.cjs

// --- turbo.json ---
{
"$schema": "https://turbo.build/schema.json",
"globalDependencies": ["**/.env.*local"],
"pipeline": {
"build": {
"dependsOn": ["^build"],
"outputs": [".next/**", "!.next/cache/**", "dist/**"]
},
"dev": {
"cache": false,
"persistent": true
},
"lint": {
"dependsOn": ["^lint"],
"outputs": []
},
"type-check": {
"dependsOn": ["^type-check"],
"outputs": []
},
"test": {
"dependsOn": ["^build"],
"outputs": ["coverage/**"]
},
"test:e2e": {
"dependsOn": ["^build"],
"outputs": []
},
"clean": {
"cache": false
},
"db:generate": {
"cache": false
},
"db:push": {
"cache": false
},
"db:studio": {
"cache": false,
"persistent": true
}
}
}

// --- tsconfig.base.json ---
{
"compilerOptions": {
"target": "ES2022",
"lib": ["DOM", "DOM.Iterable", "ES2022"],
"allowJs": true,
"skipLibCheck": true,
"strict": true,
"noEmit": true,
"esModuleInterop": true,
"module": "ESNext",
"moduleResolution": "Bundler",
"resolveJsonModule": true,
"isolatedModules": true,
"jsx": "preserve",
"incremental": true,
"noUncheckedIndexedAccess": true,
"baseUrl": ".",
"paths": {
"@/_": ["./src/_"],
"@/core": ["./packages/core/src"],
"@/services": ["./packages/services/src"],
"@/ui": ["./packages/ui/src"],
"@/types": ["./packages/types/src"]
}
},
"include": [
"next-env.d.ts",
"**/*.ts",
"**/*.tsx",
"**/*.js",
"**/*.jsx"
],
"exclude": ["node_modules", ".next", "dist", "build"]
}

// --- eslint.config.mjs ---
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
js.configs.recommended,
{
files: ["**/*.ts", "**/*.tsx"],
languageOptions: {
parser: typescriptParser,
parserOptions: {
ecmaVersion: "latest",
sourceType: "module",
ecmaFeatures: {
jsx: true,
},
},
},
plugins: {
"@typescript-eslint": typescript,
},
rules: {
...typescript.configs.recommended.rules,
"@typescript-eslint/no-unused-vars": "error",
"@typescript-eslint/no-explicit-any": "warn",
"@typescript-eslint/explicit-function-return-type": "off",
"@typescript-eslint/explicit-module-boundary-types": "off",
"@typescript-eslint/no-empty-function": "off",
},
},
{
ignores: [
"node_modules/**",
".next/**",
"dist/**",
"build/**",
"coverage/**",
".turbo/**",
],
},
];

// --- prettier.config.cjs ---
/\*_ @type {import("prettier").Config} _/
module.exports = {
printWidth: 80,
tabWidth: 2,
useTabs: false,
semi: true,
singleQuote: false,
quoteProps: "as-needed",
jsxSingleQuote: false,
trailingComma: "es5",
bracketSpacing: true,
bracketSameLine: false,
arrowParens: "always",
endOfLine: "lf",
plugins: ["prettier-plugin-tailwindcss"],
};

// --- jest.config.base.ts ---
import type { Config } from "jest";

const config: Config = {
preset: "ts-jest",
testEnvironment: "node",
roots: ["<rootDir>/src"],
testMatch: [
"**/__tests__/**/*.+(ts|tsx|js)",
"**/*.(test|spec).+(ts|tsx|js)",
],
transform: {
"^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/core$": "<rootDir>/../core/src",
"^@/services$": "<rootDir>/../services/src",
    "^@/ui$": "<rootDir>/../ui/src",
"^@/types$": "<rootDir>/../types/src",
},
setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;

// --- cypress.config.ts ---
import { defineConfig } from "cypress";

export default defineConfig({
e2e: {
baseUrl: "http://localhost:3000",
supportFile: "cypress/support/e2e.ts",
specPattern: "cypress/e2e/**/\*.cy.{js,jsx,ts,tsx}",
video: false,
screenshotOnRunFailure: false,
},
component: {
devServer: {
framework: "next",
bundler: "webpack",
},
specPattern: "src/**/\*.cy.{js,jsx,ts,tsx}",
},
});

// --- playwright.config.ts ---
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
testDir: "./e2e",
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: "html",
use: {
baseURL: "http://localhost:3000",
trace: "on-first-retry",
},
projects: [
{
name: "chromium",
use: { ...devices["Desktop Chrome"] },
},
{
name: "firefox",
use: { ...devices["Desktop Firefox"] },
},
{
name: "webkit",
use: { ...devices["Desktop Safari"] },
},
],
webServer: {
command: "yarn dev",
url: "http://localhost:3000",
reuseExistingServer: !process.env.CI,
},
});

// --- apps/web/package.json ---
{
"name": "@facturacion/web",
"version": "0.1.0",
"private": true,
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf .next dist"
},
"dependencies": {
"next": "^15.1.0",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"@tanstack/react-query": "^5.59.16",
"zod": "^3.23.8",
"tailwindcss": "^3.4.14",
"@headlessui/react": "^2.2.0",
"@heroicons/react": "^2.1.5",
"framer-motion": "^11.11.17",
"react-hook-form": "^7.53.1",
"@hookform/resolvers": "^3.9.1"
},
"devDependencies": {
"@types/react": "^18.3.12",
"@types/react-dom": "^18.3.1",
"typescript": "^5.7.2",
"eslint": "^9.15.0",
"eslint-config-next": "^15.1.0",
"autoprefixer": "^10.4.20",
"postcss": "^8.4.49"
}
}

// --- apps/web/next.config.mjs ---
/\*_ @type {import('next').NextConfig} _/
const nextConfig = {
experimental: {
appDir: true,
serverComponentsExternalPackages: ["@prisma/client"],
typedRoutes: true,
},
transpilePackages: ["@facturacion/core", "@facturacion/services", "@facturacion/ui"],
env: {
CUSTOM_KEY: process.env.CUSTOM_KEY,
},
async headers() {
return [
{
source: "/api/:path*",
headers: [
{ key: "Access-Control-Allow-Origin", value: "*" },
{ key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
{ key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
],
},
];
},
};

export default nextConfig;

// --- apps/web/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"plugins": [
{
"name": "next"
}
]
},
"include": [
"next-env.d.ts",
"**/*.ts",
"**/*.tsx",
".next/types/**/*.ts"
],
"exclude": ["node_modules"]
}

// --- apps/api-facturas/package.json ---
{
"name": "@facturacion/api-facturas",
"version": "1.0.0",
"private": true,
"scripts": {
"dev": "nodemon src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"lint": "eslint src --ext .ts",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf dist",
"db:generate": "prisma generate",
"db:push": "prisma db push",
"db:studio": "prisma studio"
},
"dependencies": {
"express": "^4.21.1",
"cors": "^2.8.5",
"helmet": "^8.0.0",
"compression": "^1.7.4",
"morgan": "^1.10.0",
"@prisma/client": "^6.1.0",
"zod": "^3.23.8",
"bcryptjs": "^2.4.3",
"jsonwebtoken": "^9.0.2",
"express-rate-limit": "^7.4.1",
"winston": "^3.15.0"
},
"devDependencies": {
"@types/express": "^5.0.0",
"@types/cors": "^2.8.17",
"@types/compression": "^1.7.5",
"@types/morgan": "^1.9.9",
"@types/bcryptjs": "^2.4.6",
"@types/jsonwebtoken": "^9.0.7",
"nodemon": "^3.1.7",
"prisma": "^6.1.0",
"ts-node": "^10.9.2",
"supertest": "^7.0.0",
"@types/supertest": "^6.0.2"
}
}

// --- apps/api-facturas/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"target": "ES2022",
"module": "CommonJS",
"moduleResolution": "node"
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist"]
}

// --- apps/api-tax-calculator/package.json ---
{
"name": "@facturacion/api-tax-calculator",
"version": "1.0.0",
"private": true,
"scripts": {
"dev": "nodemon src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"lint": "eslint src --ext .ts",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf dist"
},
"dependencies": {
"express": "^4.21.1",
"cors": "^2.8.5",
"helmet": "^8.0.0",
"compression": "^1.7.4",
"morgan": "^1.10.0",
"zod": "^3.23.8",
"express-rate-limit": "^7.4.1",
"winston": "^3.15.0"
},
"devDependencies": {
"@types/express": "^5.0.0",
"@types/cors": "^2.8.17",
"@types/compression": "^1.7.5",
"@types/morgan": "^1.9.9",
"nodemon": "^3.1.7",
"ts-node": "^10.9.2",
"supertest": "^7.0.0",
"@types/supertest": "^6.0.2"
}
}

// --- apps/api-tax-calculator/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"target": "ES2022",
"module": "CommonJS",
"moduleResolution": "node"
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist"]
}

// --- packages/core/package.json ---
{
"name": "@facturacion/core",
"version": "1.0.0",
"private": true,
"main": "./src/index.ts",
"types": "./src/index.ts",
"scripts": {
"build": "tsc",
"dev": "tsc --watch",
"lint": "eslint src --ext .ts",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf dist"
},
"dependencies": {
"zod": "^3.23.8",
"date-fns": "^4.1.0"
},
"devDependencies": {
"typescript": "^5.7.2"
}
}

// --- packages/core/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"declaration": true,
"declarationMap": true
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist", "**/*.test.ts"]
}

// --- packages/services/package.json ---
{
"name": "@facturacion/services",
"version": "1.0.0",
"private": true,
"main": "./src/index.ts",
"types": "./src/index.ts",
"scripts": {
"build": "tsc",
"dev": "tsc --watch",
"lint": "eslint src --ext .ts",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf dist"
},
"dependencies": {
"@facturacion/core": "workspace:\*",
"axios": "^1.7.7",
"zod": "^3.23.8"
},
"devDependencies": {
"typescript": "^5.7.2",
"@types/node": "^22.10.1"
}
}

// --- packages/services/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"declaration": true,
"declarationMap": true
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist", "**/*.test.ts"]
}

// --- packages/ui/package.json ---
{
"name": "@facturacion/ui",
"version": "1.0.0",
"private": true,
"main": "./src/index.ts",
"types": "./src/index.ts",
"scripts": {
"build": "tsc",
"dev": "tsc --watch",
"lint": "eslint src --ext .ts,.tsx",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"clean": "rm -rf dist"
},
"dependencies": {
"react": "^18.3.1",
"@headlessui/react": "^2.2.0",
"@heroicons/react": "^2.1.5",
"framer-motion": "^11.11.17",
"tailwindcss": "^3.4.14"
},
"devDependencies": {
"@types/react": "^18.3.12",
"typescript": "^5.7.2"
},
"peerDependencies": {
"react": "^18.3.1"
}
}

// --- packages/ui/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"declaration": true,
"declarationMap": true,
"jsx": "react-jsx"
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}

// --- packages/types/package.json ---
{
"name": "@facturacion/types",
"version": "1.0.0",
"private": true,
"main": "./src/index.ts",
"types": "./src/index.ts",
"scripts": {
"build": "tsc",
"dev": "tsc --watch",
"lint": "eslint src --ext .ts",
"type-check": "tsc --noEmit",
"clean": "rm -rf dist"
},
"dependencies": {
"zod": "^3.23.8"
},
"devDependencies": {
"typescript": "^5.7.2"
}
}

// --- packages/types/tsconfig.json ---
{
"extends": "../../tsconfig.base.json",
"compilerOptions": {
"outDir": "./dist",
"rootDir": "./src",
"declaration": true,
"declarationMap": true
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist"]
}

// --- prisma/schema.prisma ---
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model User {
id String @id @default(cuid())
email String @unique
name String?
role Role @default(USER)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
invoices Invoice[]
clients Client[]
settings UserSettings?

@@map("users")
}

model UserSettings {
id String @id @default(cuid())
userId String @unique

// Configuración fiscal
irpfRate Float @default(0.15)
ivaRate Float @default(0.21)
retentionRate Float @default(0.0)
isAutonomoRegimen Boolean @default(true)

// Configuración de facturación
invoicePrefix String @default("F")
nextInvoiceNumber Int @default(1)

// Configuración de empresa
companyName String?
taxId String?
address String?
city String?
postalCode String?
country String @default("España")

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@map("user_settings")
}

model Client {
id String @id @default(cuid())
userId String

name String
email String?
taxId String?
address String?
city String?
postalCode String?
country String @default("España")

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
invoices Invoice[]

@@map("clients")
}

model Invoice {
id String @id @default(cuid())
userId String
clientId String?

// Datos básicos
number String
date DateTime @default(now())
dueDate DateTime?
status InvoiceStatus @default(DRAFT)

// Importes
subtotal Float
taxAmount Float
totalAmount Float

// Retenciones
retentionRate Float @default(0.0)
retentionAmount Float @default(0.0)

// Metadatos
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relaciones
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
client Client? @relation(fields: [clientId], references: [id])
items InvoiceItem[]

@@unique([userId, number])
@@map("invoices")
}

model InvoiceItem {
id String @id @default(cuid())
invoiceId String

description String
quantity Float
unitPrice Float
total Float
taxRate Float @default(0.21)

invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

@@map("invoice_items")
}

model TaxCalculation {
id String @id @default(cuid())
userId String

// Período fiscal
year Int
quarter Int

// Ingresos
totalIncome Float
deductibleExpenses Float
netIncome Float

// Impuestos
irpfAmount Float
ivaAmount Float
socialSecurityAmount Float
totalTaxes Float

// Metadatos
calculatedAt DateTime @default(now())
notes String?

@@unique([userId, year, quarter])
@@map("tax_calculations")
}

enum Role {
USER
ADMIN
}

enum InvoiceStatus {
DRAFT
SENT
PAID
OVERDUE
CANCELLED
}

// --- .vscode/extensions.json ---
{
"recommendations": [
"github.copilot",
"github.copilot-chat",
"ms-vscode.vscode-typescript-next",
"bradlc.vscode-tailwindcss",
"prisma.prisma",
"graphql.vscode-graphql",
"graphql.vscode-graphql-syntax",
"redhat.vscode-yaml",
"yzhang.markdown-all-in-one",
"esbenp.prettier-vscode",
"dbaeumer.vscode-eslint",
"ms-playwright.playwright",
"orta.vscode-jest",
"ms-vscode.vscode-json",
"bradlc.vscode-tailwindcss",
"lokalise.i18n-ally",
"formulahendry.auto-rename-tag",
"christian-kohler.path-intellisense",
"ms-vscode.vscode-typescript-next",
"usernamehw.errorlens"
]
}

// --- .vscode/settings.json ---
{
"typescript.preferences.preferTypeOnlyAutoImports": true,
"typescript.suggest.autoImports": true,
"typescript.updateImportsOnFileMove.enabled": "always",
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
"source.fixAll.eslint": "explicit",
"source.organizeImports": "explicit"
},
"files.associations": {
"_.css": "tailwindcss"
},
"emmet.includeLanguages": {
"javascript": "javascriptreact",
"typescript": "typescriptreact"
},
"tailwindCSS.includeLanguages": {
"typescript": "javascript",
"typescriptreact": "javascript"
},
"tailwindCSS.experimental.classRegex": [
["cva\\(([^)]_)\\)", "[\"'`]([^"'`]*)._?[\"'`]"],
["cx\\(([^)]_)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
],
"github.copilot.enable": {
"\*": true,
"yaml": false,
"plaintext": false,
"markdown": true
},
"search.exclude": {
"**/node_modules": true,
"**/.next": true,
"**/dist": true,
"**/.turbo": true,
"**/coverage": true
},
"files.exclude": {
"**/.turbo": true
}
}

// --- .copilot/tasks.json ---
{
"tasks": [
{
"name": "generate:adr",
"description": "Genera un nuevo ADR (Architecture Decision Record)",
"command": "yarn adr:new",
"args": ["${input:adrTitle}"],
"inputs": [
{
"id": "adrTitle",
"description": "Título del ADR",
"type": "promptString"
}
]
},
{
"name": "scaffold:service",
"description": "Genera un nuevo microservicio con Express + Prisma",
"command": "turbo gen",
"args": ["service", "${input:serviceName}"],
"inputs": [
{
"id": "serviceName",
"description": "Nombre del servicio",
"type": "promptString"
}
]
},
{
"name": "scaffold:hook",
"description": "Genera un hook React con SWR y Zod",
"command": "turbo gen",
"args": ["hook", "${input:hookName}"],
"inputs": [
{
"id": "hookName",
"description": "Nombre del hook (sin 'use')",
"type": "promptString"
}
]
},
{
"name": "test:all",
"description": "Ejecuta todos los tests: Jest + Cypress + Playwright",
"command": "yarn",
"args": ["test"]
},
{
"name": "dev:full",
"description": "Inicia desarrollo completo (todos los servicios)",
"command": "yarn",
"args": ["dev"]
},
{
"name": "build:production",
"description": "Build de producción completo",
"command": "yarn",
"args": ["build"]
}
]
}

// --- adr/0000-template.md ---

# [NÚMERO]. [TÍTULO CORTO DEL PROBLEMA Y SOLUCIÓN]

Fecha: [FECHA]

## Estado

[Propuesto | Aceptado | Rechazado | Deprecado | Sustituido por [ADR-XXXX](XXXX-titulo.md)]

## Contexto

[Descripción del problema que fuerza esta decisión. Es libre de texto, de dos o tres párrafos. Puede incluir diagramas.]

## Opciones Consideradas

- [Opción 1]
- [Opción 2]
- [Opción 3]
- [...] <!-- números de opciones pueden variar -->

## Decisión

[Opción elegida], porque [justificación. por ejemplo, única opción que cumple con criterio de decisión clave | que resuelve la fuerza | ... | viene con mejores consecuencias.].

### Pros y Contras de las Opciones

#### [Opción 1]

[ejemplo | descripción | puntero a más información | ...] <!-- opcional -->

- Bueno, porque [argumento a]
- Bueno, porque [argumento b]
- Malo, porque [argumento c]
- [...] <!-- números de pros y contras pueden variar -->

#### [Opción 2]

[ejemplo | descripción | puntero a más información | ...] <!-- opcional -->

- Bueno, porque [argumento a]
- Bueno, porque [argumento b]
- Malo, porque [argumento c]
- [...] <!-- números de pros y contras pueden variar -->

#### [Opción 3]

[ejemplo | descripción | puntero a más información | ...] <!-- opcional -->

- Bueno, porque [argumento a]
- Bueno, porque [argumento b]
- Malo, porque [argumento c]
- [...] <!-- números de pros y contras pueden variar -->

## Consecuencias

- Bueno, porque [e.g., mejora en satisfacción de un atributo de calidad, sigue principios arquitectónicos, ...]
- Malo, porque [e.g., compromete atributo de calidad, viola principios arquitectónicos, ...]
- [...] <!-- números de consecuencias pueden variar -->

## Enlaces

- [Tipo de enlace] [Enlace a ADR] <!-- ejemplo: Refina [ADR-0005](0005-ejemplo.md) -->
- [...] <!-- números de enlaces pueden variar -->

// --- scripts/create-adr.mjs ---
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const **filename = fileURLToPath(import.meta.url);
const **dirname = path.dirname(\_\_filename);

function slugify(text) {
return text
.toLowerCase()
.replace(/[^\w ]+/g, '')
.replace(/ +/g, '-');
}

function getNextAdrNumber() {
const adrDir = path.join(\_\_dirname, '..', 'adr');

if (!fs.existsSync(adrDir)) {
fs.mkdirSync(adrDir, { recursive: true });
return '0001';
}

const files = fs.readdirSync(adrDir)
.filter(file => file.match(/^\d{4}-.\*\.md$/))
.map(file => parseInt(file.substring(0, 4)))
.filter(num => !isNaN(num));

const maxNumber = files.length > 0 ? Math.max(...files) : 0;
return (maxNumber + 1).toString().padStart(4, '0');
}

function createAdr(title) {
if (!title) {
console.error('Error: Debes proporcionar un título para el ADR');
console.log('Uso: yarn adr:new "Título del ADR"');
process.exit(1);
}

const number = getNextAdrNumber();
const slug = slugify(title);
const filename = `${number}-${slug}.md`;
const date = new Date().toISOString().split('T')[0];

const templatePath = path.join(\_\_dirname, '..', 'adr', '0000-template.md');
const template = fs.readFileSync(templatePath, 'utf8');

const content = template
.replace('[NÚMERO]', number)
.replace('[TÍTULO CORTO DEL PROBLEMA Y SOLUCIÓN]', title)
.replace('[FECHA]', date);

const adrPath = path.join(\_\_dirname, '..', 'adr', filename);
fs.writeFileSync(adrPath, content);

console.log(`✅ ADR creado: adr/${filename}`);
console.log(`📝 Título: ${title}`);
console.log(`📅 Fecha: ${date}`);
console.log(`🔢 Número: ${number}`);
}

const title = process.argv[2];
createAdr(title);

// --- README.md ---

# 🧾 Facturación Autónomos - Monorepo

Sistema completo de gestión de facturación para autónomos y freelancers, construido con arquitectura moderna de microservicios.

## 🎯 Visión del Proyecto

Crear una plataforma integral que permita a autónomos y freelancers gestionar su facturación, calcular impuestos, y mantener control financiero completo de manera automatizada y eficiente.

### 🎯 Objetivos

- **Simplificar** la gestión de facturación para autónomos
- **Automatizar** cálculos fiscales y tributarios
- **Centralizar** la información financiera
- **Optimizar** los procesos contables
- **Facilitar** el cumplimiento fiscal

## 🏗️ Arquitectura

Este monorepo utiliza **TurboRepo** con **Yarn 4 PnP** para máximo rendimiento y gestión eficiente de dependencias.

```
📦 facturacion-autonomos-monorepo
├── 🌐 apps/
│   ├── web/                    # Frontend Next.js 15
│   ├── api-facturas/          # API de facturación
│   └── api-tax-calculator/    # API de cálculos fiscales
├── 📚 packages/
│   ├── core/                  # Lógica de negocio central
│   ├── services/              # Servicios externos
│   ├── ui/                    # Componentes UI compartidos
│   └── types/                 # Tipos TypeScript
├── 🗄️ prisma/                 # Esquemas de base de datos
├── 📖 docs/                   # Documentación
├── 🏛️ adr/                    # Architecture Decision Records
└── ⚙️ scripts/               # Scripts de automatización
```

## 🚀 Comandos Básicos

### Desarrollo

```bash
# Instalar dependencias
yarn install

# Desarrollo completo (todos los servicios)
yarn dev

# Desarrollo individual
yarn workspace @facturacion/web dev
yarn workspace @facturacion/api-facturas dev
yarn workspace @facturacion/api-tax-calculator dev
```

### Testing

```bash
# Todos los tests
yarn test

# Tests específicos
yarn workspace @facturacion/core test
yarn workspace @facturacion/web test

# E2E Tests
yarn test:e2e
```

### Build y Deploy

```bash
# Build completo
yarn build

# Build individual
yarn workspace @facturacion/web build

# Linting y formato
yarn lint
yarn format
```

### Base de Datos

```bash
# Generar cliente Prisma
yarn db:generate

# Aplicar cambios a la BD
yarn db:push

# Abrir Prisma Studio
yarn db:studio
```

## 🌳 Flujo de Ramas Git

### Ramas Principales

- `main` - Producción estable
- `develop` - Integración y desarrollo
- `feature/*` - Nuevas funcionalidades
- `hotfix/*` - Correcciones urgentes
- `release/*` - Preparación de releases

### Workflow Recomendado

1. **Feature**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollo**: Commits atómicos y descriptivos
3. **Testing**: `yarn test` antes de PR
4. **Pull Request**: A `develop`
5. **Review**: Revisión de código obligatoria
6. **Merge**: Squash merge a `develop`
7. **Release**: Merge de `develop` a `main`

## 🏛️ Architecture Decision Records (ADR)

Los ADR documentan decisiones arquitectónicas importantes:

```bash
# Crear nuevo ADR
yarn adr:new "Título de la Decisión"

# Ver ADRs existentes
ls adr/
```

### ADRs Actuales

- [Ver todos los ADRs](./adr/)

## 📋 Fases de Desarrollo con Copilot Agent

### 🚀 Fase 1 - Bootstrapping

**Objetivo**: Configuración inicial y estructura base

**Tareas Copilot**:

```bash
# Configuración inicial
yarn install
yarn build
git add . && git commit -m "feat: initial project setup"

# Verificar estructura
yarn workspace @facturacion/core build
yarn workspace @facturacion/web dev
```

**Entregables**:

- ✅ Estructura de monorepo configurada
- ✅ Dependencias instaladas
- ✅ Build inicial exitoso
- ✅ Commit inicial realizado

---

### 📋 Fase 2 - Especificaciones

**Objetivo**: Definir contratos y arquitectura

**Tareas Copilot**:

```bash
# Crear ADRs fundamentales
yarn adr:new "Elección de Stack Tecnológico"
yarn adr:new "Arquitectura de Microservicios"
yarn adr:new "Estrategia de Base de Datos"

# Definir contratos OpenAPI
# Copilot generará esquemas basados en requirements
```

**Entregables**:

- 📋 ADRs de decisiones arquitectónicas
- 📊 Contratos OpenAPI definidos
- 🗄️ Esquemas de base de datos
- 📖 Documentación técnica inicial

---

### 🛠️ Fase 3 - Implementación

**Objetivo**: Desarrollo con TDD y scaffolding automático

**Tareas Copilot**:

```bash
# Scaffolding automático
yarn copilot:task scaffold:service "invoicing"
yarn copilot:task scaffold:hook "useInvoices"

# TDD con Copilot
yarn workspace @facturacion/core test --watch
# Copilot sugiere tests basados en especificaciones
```

**Entregables**:

- 🧪 Tests unitarios completos
- 🔧 Servicios scaffolded
- ⚛️ Hooks React generados
- 🎯 Implementación guiada por tests

---

### 🔄 Fase 4 - Integración Continua

**Objetivo**: CI/CD y automatización

**Tareas Copilot**:

```bash
# Configurar GitHub Actions
# Copilot generará workflows optimizados para Yarn PnP

# Tests automatizados
yarn copilot:task test:all

# Deploy automatizado
yarn build && yarn test
```

**Entregables**:

- ⚙️ GitHub Actions configurado
- 🧪 Pipeline de testing
- 🚀 Deploy automatizado
- 📊 Métricas de calidad

---

### ⚡ Fase 5 - Optimización

**Objetivo**: Performance, seguridad y mantenibilidad

**Tareas Copilot**:

```bash
# Análisis de performance
yarn build --analyze

# Auditoría de seguridad
yarn audit

# Refactoring asistido
# Copilot sugiere mejoras basadas en patterns
```

**Entregables**:

- 📈 Optimizaciones de performance
- 🔒 Auditorías de seguridad
- 🔄 Refactoring automatizado
- 📊 Métricas de calidad mejoradas

## 🤖 Tareas Copilot Agent Predefinidas

### Generar ADR

```bash
yarn copilot:task generate:adr
# Prompt: "Migración a microservicios"
# Output: adr/0005-migracion-microservicios.md
```

### Scaffold Service

```bash
yarn copilot:task scaffold:service
# Prompt: "payment-processor"
# Output: apps/api-payment-processor/ con Express + Prisma
```

### Scaffold Hook

```bash
yarn copilot:task scaffold:hook
# Prompt: "Invoice"
# Output: packages/ui/src/hooks/useInvoice.ts con SWR + Zod
```

### Test Suite Completa

```bash
yarn copilot:task test:all
# Ejecuta: Jest + Cypress + Playwright en paralelo
```

## 📚 Recursos Adicionales

- [📖 Documentación Completa](./docs/)
- [🏛️ Architecture Decision Records](./adr/)
- [🧪 Guía de Testing](./docs/testing.md)
- [🚀 Guía de Deploy](./docs/deployment.md)
- [🔧 Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0 - ver [LICENSE](LICENSE) para detalles.

---

**🤖 Optimizado para GitHub Copilot Agent** | **⚡ Powered by TurboRepo + Yarn 4 PnP**
