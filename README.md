# 📊 Facturación Autónomos - Monorepo

> Plataforma unificada para gestión y facturación de autónomos, organizada como monorepo modular con backend Node.js y frontend React. Arquitectura escalable, pruebas automáticas y CI/CD integrado.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org/)
[![Yarn](https://img.shields.io/badge/Yarn-4.9%2B-blue.svg)](https://yarnpkg.com/)
[![Turbo](https://img.shields.io/badge/Turbo-2.3%2B-red.svg)](https://turbo.build/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://docker.com/)

## 🎯 Visión del Proyecto

Esta plataforma está diseñada para simplificar la gestión administrativa y fiscal de autónomos, proporcionando herramientas integradas para facturación, cálculo de impuestos, y cumplimiento con las obligaciones fiscales españolas.

### 🌟 Características Principales

- **💼 Gestión de Facturas**: Creación, edición y seguimiento de facturas
- **🧮 Cálculo Fiscal**: Automatización de cálculos de IVA, IRPF y retenciones
- **📊 Reporting**: Informes detallados y exportación de datos
- **🔄 CI/CD Pipeline**: Despliegue automático en Vercel
- **📈 Monitoreo**: Logs integrados en Vercel
- **🔒 Seguridad**: Autenticación JWT y validación de datos
- **🌐 API RESTful**: Documentación completa con OpenAPI/Swagger

## 🚀 Pipeline CI/CD

### Automatización Completa

- ✅ **Build automático** del monorepo con Turbo
- ✅ **Tests unitarios** y de integración
- ✅ **Linting** y validación de código
- ✅ **Despliegue automático** a Vercel (Staging/Producción)
- ✅ **Preview deployments** para Pull Requests
- ✅ **Monitoreo** integrado en Vercel

### Infraestructura Vercel

- 🎯 **Multi-ambiente**: Preview, Staging y Producción
- 🔄 **Auto-scaling**: Escalado automático según demanda
- 📊 **Observabilidad**: Logs, métricas y analytics integrados
- 🛡️ **Seguridad**: SSL automático y protección DDoS
- 💾 **Global CDN**: Distribución global optimizada
- 🌐 **Edge Functions**: Funciones serverless en el edge

## 🏗️ Arquitectura del Monorepo

```
🏠 Monorepo Root/
├── 🌐 apps/
│   ├── web/              # Next.js - Frontend principal
│   ├── api-facturas/     # Express.js - API de facturas
│   └── api-tax-calculator/ # Express.js - API de cálculos fiscales
├── 📦 packages/
│   ├── ui/               # Componentes UI compartidos
│   ├── core/             # Lógica de negocio central
│   ├── services/         # Servicios externos (AEAT, bancos)
│   └── types/            # Tipos TypeScript compartidos
├── 🗄️ prisma/            # Schema de base de datos
└── 📚 docs/              # Documentación y ADRs
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 20+ ([Descargar](https://nodejs.org/))
- **Yarn** 4.9+ (se instala automáticamente)
- **PostgreSQL** 14+ (o usar Docker)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/facturacion-autonomos-monorepo.git
cd facturacion-autonomos-monorepo

# 2. Configurar el entorno
yarn setup

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# 4. Ejecutar migraciones de BD
yarn db:push

# 5. Iniciar todos los servicios
yarn dev
```

### 🎪 Servicios Disponibles

| Servicio               | Puerto | URL                   | Descripción                |
| ---------------------- | ------ | --------------------- | -------------------------- |
| **Web App**            | 3000   | http://localhost:3000 | Frontend principal         |
| **API Facturas**       | 3001   | http://localhost:3001 | API de gestión de facturas |
| **API Tax Calculator** | 3002   | http://localhost:3002 | API de cálculos fiscales   |
| **Prisma Studio**      | 5555   | http://localhost:5555 | Gestor visual de BD        |

## 🛠️ Stack Tecnológico

### Frontend

- **⚛️ React 18** - UI library
- **🔄 Next.js 15** - Framework fullstack
- **🎨 Tailwind CSS** - Styling
- **📊 SWR** - Data fetching
- **🔍 Zod** - Schema validation
- **🧪 Jest + Testing Library** - Testing

### Backend

- **🚀 Node.js 20** - Runtime
- **⚡ Express.js** - Web framework
- **🗄️ Prisma** - ORM
- **🐘 PostgreSQL** - Database
- **🔐 JWT** - Authentication
- **📝 Zod** - Schema validation

### DevOps & Tooling

- **📦 Yarn 4 PnP** - Package manager
- **⚡ Turbo** - Monorepo build system
- **🔧 TypeScript** - Type safety
- **✨ ESLint + Prettier** - Code quality
- **🐶 Husky + lint-staged** - Git hooks
- **🧪 Jest + Cypress + Playwright** - Testing
- **🐳 Docker** - Containerization

## 📋 Comandos Disponibles

### Desarrollo

```bash
yarn dev              # Iniciar todos los servicios
yarn dev:web          # Solo frontend
yarn build            # Build de producción
yarn type-check       # Verificación de tipos
```

### Testing

```bash
yarn test             # Tests unitarios
yarn test:watch       # Tests en modo watch
yarn test:e2e         # Tests E2E con Playwright
yarn test:e2e:ui      # Tests E2E con UI
yarn copilot:test-all # Todos los tests (Copilot)
```

### Base de Datos

```bash
yarn db:generate     # Generar cliente Prisma
yarn db:push         # Aplicar cambios al schema
yarn db:studio       # Abrir Prisma Studio
yarn db:migrate      # Crear migración
yarn db:reset        # Reset completo de BD
```

### Calidad de Código

```bash
yarn lint             # Linting
yarn lint:fix         # Linting con auto-fix
yarn format          # Formatear código
yarn format:check     # Verificar formato
```

### Documentación

```bash
yarn adr:new "Título" # Crear nuevo ADR
```

## 🤖 GitHub Copilot Agent

Este proyecto está optimizado para trabajar con GitHub Copilot Agent. Utiliza los siguientes comandos:

```bash
# Generar un nuevo ADR
@copilot /task generate:adr "Usar Redis para caché"

# Crear un microservicio
@copilot /task scaffold:service "auth" 3003

# Crear un hook React
@copilot /task scaffold:hook "Usuarios" "/api/usuarios"

# Ejecutar todos los tests
@copilot /task test:all
```

## 🌿 Flujo de Ramas

```
main         ──●──●──●──●── (Producción)
              ╱  ╱  ╱  ╱
develop    ──●──●──●──●──── (Integración)
            ╱  ╱  ╱  ╱
features  ──●──●  ●──●──── (Desarrollo)
```

### Flujo de Trabajo

1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Commits frecuentes con mensajes descriptivos
3. **Testing**: `yarn test && yarn lint`
4. **Pull Request**: Hacia `develop`
5. **Review & Merge**: Squash merge preferido
6. **Deploy**: `develop` → `main` para releases

## 📁 Estructura de Directorios

<details>
<summary>👆 Click para expandir estructura completa</summary>

```
facturacion-autonomos-monorepo/
├── .copilot/                 # Configuración Copilot Agent
│   ├── tasks.json           # Definición de tareas
│   └── tasks/               # Scripts de tareas
├── .github/                 # GitHub workflows
├── .vscode/                 # Configuración VS Code
├── apps/
│   ├── web/                 # Next.js App
│   │   ├── src/
│   │   │   ├── app/         # App Router
│   │   │   ├── components/  # Componentes React
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── lib/         # Utilidades
│   │   │   └── schemas/     # Esquemas Zod
│   │   └── public/          # Assets estáticos
│   ├── api-facturas/        # API Facturas
│   │   └── src/
│   │       ├── routes/      # Endpoints
│   │       ├── middleware/  # Express middleware
│   │       └── services/    # Lógica de negocio
│   └── api-tax-calculator/  # API Cálculos Fiscales
├── packages/
│   ├── ui/                  # Librería de componentes
│   ├── core/                # Lógica de negocio
│   ├── services/            # Servicios externos
│   └── types/               # Tipos compartidos
├── prisma/                  # Base de datos
│   ├── schema.prisma        # Schema Prisma
│   └── migrations/          # Migraciones
├── docs/                    # Documentación
│   ├── adr/                 # Architecture Decision Records
│   └── api/                 # Documentación API
├── scripts/                 # Scripts de utilidad
└── tests/                   # Tests E2E globales
```

</details>

## 🧪 Testing Strategy

### Niveles de Testing

1. **Unit Tests** - Jest + Testing Library
   - Lógica de negocio (`packages/core`)
   - Servicios (`packages/services`)
   - Hooks React (`apps/web/src/hooks`)

2. **Integration Tests** - Supertest + Jest
   - Endpoints API
   - Conectividad de base de datos

3. **E2E Tests** - Playwright + Cypress
   - Flujos completos de usuario
   - Cross-browser testing

### Coverage Goals

| Tipo       | Mínimo | Objetivo |
| ---------- | ------ | -------- |
| Statements | 70%    | 85%      |
| Branches   | 70%    | 80%      |
| Functions  | 70%    | 85%      |
| Lines      | 70%    | 85%      |

## 🚢 Deployment

### Environments

- **Development** - Local + feature branches
- **Staging** - Branch `develop` (Vercel)
- **Production** - Branch `main` (Vercel)

### Vercel Deployment

La aplicación se despliega automáticamente en Vercel usando GitHub Actions.

#### Configuración de GitHub Actions Secrets

Antes de poder desplegar automáticamente, necesitas configurar las secrets de Vercel en GitHub:

##### Configuración Automática de Secrets

```bash
# 1. Instalar GitHub CLI si no lo tienes
brew install gh  # macOS
# winget install --id GitHub.cli  # Windows
# sudo apt install gh  # Ubuntu/Debian

# 2. Autenticarte en GitHub
gh auth login

# 3. Ejecutar el script de configuración
./setup-github-secrets.sh
```

##### Configuración Manual de Secrets

Ve a [GitHub Repository Settings](https://github.com/Neiland85/facturacion-autonomos-monorepo/settings/secrets/actions) y agrega estas secrets:

- `VERCEL_TOKEN`: `8MaMflyLy6c8A7prEMRKv5BY`
- `VERCEL_PROJECT_ID`: `prj_asVGzmIka4hgkSsLIDcEHEZ5syLw`
- `VERCEL_ORG_ID`: `ciSmJvy2ITmzaape3bWxMkcw`

##### Sistema de Entornos

El proyecto usa un sistema de archivos `.env` separados por entorno:

- **`.env.production`** - Variables para producción
- **`.env.staging`** - Variables para staging
- **`.env.development`** - Variables para desarrollo

Para cargar un entorno específico:

```bash
# Cargar entorno de producción
ENVIRONMENT=production source ./load-env.sh

# O usar el script de npm
npm run env:load
```

##### Variables por Entorno en GitHub Secrets

Configura estas variables específicas del entorno en GitHub Actions secrets:

**Base (comunes):**

- `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`

**Producción:**

- `DATABASE_URL_PROD`, `JWT_SECRET_PROD`, `REDIS_URL_PROD`

**Staging:**

- `DATABASE_URL_STAGING`, `JWT_SECRET_STAGING`, `REDIS_URL_STAGING`

**Desarrollo:**

- `DATABASE_URL_DEV`, `JWT_SECRET_DEV`, `REDIS_URL_DEV`

**Desarrollo:**
- `DATABASE_URL_DEV`, `JWT_SECRET_DEV`, `REDIS_URL_DEV`

##### Servicios Recomendados

**🐘 PostgreSQL:**
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - PostgreSQL + Auth
- [Railway](https://railway.app) - PostgreSQL integrado

**🔴 Redis:**
- [Upstash](https://upstash.com) - Redis serverless
- [Redis Labs](https://redis.com) - Redis Cloud

##### Configuración Automática

```bash
# Configurar todos los secrets básicos
npm run github:secrets

# Actualizar JWT secrets con valores seguros
npm run github:secrets:update
```

##### Configuración Manual

Ve a [GitHub Repository Settings](https://github.com/Neiland85/facturacion-autonomos-monorepo/settings/secrets/actions) y actualiza:

1. **DATABASE_URL_PROD**: `postgresql://user:pass@host:5432/db?sslmode=require`
2. **REDIS_URL_PROD**: `redis://user:pass@host:port/db`
3. Mantén los JWT secrets generados automáticamente

#### Variables de Entorno Requeridas en Vercel

##### Configuración Automática (Recomendado)

Usa el script de configuración automática para configurar todas las variables de entorno:

```bash
# 1. Instalar Vercel CLI si no lo tienes
npm install -g vercel

# 2. Autenticarte en Vercel
vercel login

# 3. Ejecutar el script de configuración
./setup-vercel-env.sh
```

El script configurará automáticamente las variables básicas con valores de ejemplo que deberás actualizar manualmente.

##### Configuración Manual

Si prefieres configurar manualmente, ve a [Vercel Dashboard](https://vercel.com/dashboard) > Tu Proyecto > Settings > Environment Variables y configura:

```bash
# 🔧 Configuración de Vercel (requerido para CI/CD)
VERCEL_TOKEN=<tu-vercel-token>           # Token de acceso de Vercel
VERCEL_PROJECT_ID=<tu-project-id>        # ID del proyecto en Vercel
VERCEL_ORG_ID=<tu-org-id>                # ID de la organización en Vercel

# 🗄️ Base de Datos (requerido)
DATABASE_URL=<postgresql-connection-string>
# Ejemplo: postgresql://usuario:password@host:5432/database?sslmode=require

# 🔐 Autenticación (requerido)
JWT_SECRET=<jwt-secret-super-seguro-min-32-caracteres>
JWT_EXPIRES_IN=24h

# ⚡ Redis (requerido para rate limiting y cache)
REDIS_URL=<redis-connection-string>
# Ejemplo: redis://username:password@host:port/database

# 📧 Email (opcional - para notificaciones)
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>

# 🔗 Webhooks (opcional - para integraciones externas)
WEBHOOK_SECRET=<webhook-secret>
```

##### Cómo Obtener los Valores

1. **VERCEL_TOKEN**: Ve a [Vercel Account Settings](https://vercel.com/account/tokens) > Create Token
2. **VERCEL_PROJECT_ID & VERCEL_ORG_ID**: En tu proyecto Vercel > Settings > General
3. **DATABASE_URL**: Configura una base de datos PostgreSQL (Neon, Supabase, Railway, etc.)
4. **JWT_SECRET**: Genera un string aleatorio seguro de al menos 32 caracteres
5. **REDIS_URL**: Configura Redis (Upstash, Redis Labs, etc.)
6. **SMTP\_\***: Configura un servicio de email (SendGrid, Mailgun, etc.)

##### Variables por Entorno

Configura las variables en los siguientes entornos:

- **Production**: Todas las variables con valores reales
- **Preview**: Variables de desarrollo/testing
- **Development**: Variables locales (opcional)

#### Despliegue Automático

- **Push a `main`**: Despliegue automático a producción
- **Push a `develop`**: Despliegue automático a staging
- **Pull Requests**: Despliegue de preview

#### Despliegue Manual

```bash
# Despliegue a Vercel (detecta automáticamente el entorno)
./deploy-to-vercel.sh

# O usando Vercel CLI directamente
npm install -g vercel
vercel --prod --yes  # Producción
vercel --yes         # Staging/Preview
```

### Docker

```bash
# Build completo
docker-compose build

# Desarrollo
docker-compose up -d

# Solo servicios de soporte (BD, Redis)
docker-compose up -d postgres redis
```

## 🔄 Desarrollo y Despliegue

### Entorno Local con Docker

```bash
# Iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Verificar servicios
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Pipeline CI/CD

#### Configuración de Variables (GitHub Actions + Vercel)

```bash
# Vercel (GitHub Secrets)
VERCEL_TOKEN=<vercel-token>
VERCEL_PROJECT_ID=<vercel-project-id>
VERCEL_ORG_ID=<vercel-org-id>

# Database
DATABASE_URL=<postgresql-connection-string>

# Authentication
JWT_SECRET=<jwt-secret>
JWT_EXPIRES_IN=24h

# Redis (para rate limiting y cache)
REDIS_URL=<redis-connection-string>
```

#### Despliegue Automático

- ✅ **Build automático** del monorepo con Turbo
- ✅ **Tests unitarios** y de integración
- ✅ **Linting** y validación de código
- ✅ **Despliegue automático** a Vercel (Staging/Producción)
- ✅ **Preview deployments** para Pull Requests

### Monitoreo y Observabilidad

#### URLs de Acceso

- **Aplicación**: `https://[tu-proyecto].vercel.app`
- **API Docs**: `https://[tu-proyecto].vercel.app/api/docs`
- **Staging**: `https://[tu-proyecto]-develop.vercel.app`
- **Preview**: `https://[tu-proyecto]-git-[branch].vercel.app`

#### Health Checks

```bash
# API Facturas
curl https://api-facturacion.tu-dominio.com/health

# API Tax Calculator
curl https://api-facturacion.tu-dominio.com/api/tax-calculator/health
```

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear** rama feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

### Convenciones

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`
- **PRs**: Template obligatorio + review requerido

## 📊 Monitoring & Analytics

- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics
- **Logs**: Winston + structured logging
- **Health Checks**: `/api/health` endpoints

## 🔒 Security

- **Authentication**: NextAuth.js
- **Authorization**: Role-based (RBAC)
- **Data Validation**: Zod schemas
- **SQL Injection**: Prisma ORM
- **XSS Protection**: CSP headers
- **HTTPS**: Force in production

## 📚 Recursos

- [📖 Documentación Técnica](./docs/INFORME_TECNICO_DETALLADO.md)
- [🏗️ ADRs](./docs/adr/)
- [🐛 Issue Tracker](https://github.com/tu-usuario/facturacion-autonomos-monorepo/issues)
- [💬 Discusiones](https://github.com/tu-usuario/facturacion-autonomos-monorepo/discussions)

## 📄 Licencia

Este proyecto está licenciado bajo Apache License 2.0 - ver [LICENSE](LICENSE) para detalles.

---

<div align="center">

**[⬆ Volver arriba](#-facturación-autónomos---monorepo)**

Hecho con ❤️ y ☕ por el equipo de desarrollo

</div>

---

## 🌟 Características Adicionales

## 🏛️ Arquitectura

```
facturacion-autonomos-monorepo/
├── apps/                    # Aplicaciones
│   ├── web/                # Frontend Next.js
│   ├── api-facturas/       # API de facturación
│   └── api-tax-calculator/ # API calculadora de impuestos
├── packages/               # Packages compartidos
│   ├── core/              # Lógica de negocio central
│   ├── services/          # Servicios compartidos
│   ├── types/             # Tipos TypeScript
│   └── ui/                # Componentes UI reutilizables
└── prisma/                # Schema de base de datos
```

## 📁 Estructura del Proyecto

### Apps

- **`apps/web`** - Aplicación frontend Next.js 14 con App Router
- **`apps/api-facturas`** - API RESTful para gestión de facturas (Express + Prisma)
- **`apps/api-tax-calculator`** - Microservicio para cálculos fiscales

### Packages

- **`packages/core`** - Lógica de negocio y utilidades centrales
- **`packages/services`** - Servicios y clientes API compartidos
- **`packages/types`** - Definiciones de tipos TypeScript
- **`packages/ui`** - Librería de componentes UI con Tailwind CSS

## 📋 Requisitos Previos

- **Node.js** >=20.0.0
- **Yarn** >=4.0.0 (administrado por corepack)
- **PostgreSQL** (para desarrollo local)

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd facturacion-autonomos-monorepo
   ```

2. **Habilitar corepack**

   ```bash
   corepack enable
   ```

3. **Instalar dependencias**

   ```bash
   yarn install
   ```

4. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Configurar base de datos**
   ```bash
   yarn db:push
   yarn db:generate
   ```

## � Scripts Disponibles

### Scripts Globales (TurboRepo)

```bash
# Desarrollo
yarn dev              # Inicia todos los servicios en modo desarrollo
yarn build            # Construye todas las aplicaciones
yarn test             # Ejecuta todos los tests
yarn lint             # Ejecuta linting en todo el monorepo
yarn type-check       # Verifica tipos TypeScript
yarn clean            # Limpia archivos generados

# Formateo
yarn format           # Formatea código con Prettier

# Base de datos
yarn db:generate      # Genera cliente Prisma
yarn db:push          # Aplica cambios al schema
yarn db:studio        # Abre Prisma Studio

# ADR (Architecture Decision Records)
yarn adr:new "Título" # Crea un nuevo ADR
```

### Scripts por Workspace

```bash
# Desarrollo de aplicaciones específicas
yarn workspace @facturacion/web dev
yarn workspace @facturacion/api-facturas dev
yarn workspace @facturacion/api-tax-calculator dev

# Build de packages específicos
yarn workspace @facturacion/ui build
yarn workspace @facturacion/core build
```

## 💻 Desarrollo

### Iniciar Desarrollo Local

```bash
# Inicia todos los servicios
yarn dev
```

Esto iniciará:

- 🌐 **Frontend (web)**: http://localhost:3000
- 🔌 **API Facturas**: http://localhost:3001
- 📊 **API Tax Calculator**: http://localhost:3002

### Desarrollar Componentes UI

```bash
cd packages/ui
yarn dev
```

### Ejecutar Tests

```bash
# Todos los tests
yarn test

# Tests específicos
yarn workspace @facturacion/core test
yarn workspace @facturacion/web test:e2e
```

## 📝 ADR (Architecture Decision Records)

Este proyecto utiliza ADRs para documentar decisiones arquitectónicas importantes.

### Crear un nuevo ADR

```bash
yarn adr:new "Título de la decisión"
```

### Ver ADRs existentes

Los ADRs se encuentran en `adr/` y siguen el formato [MADR 2.1](https://adr.github.io/madr/).

## ⚙️ Configuración de VS Code

### Workspace Aislado (Recomendado) 🔒

Este proyecto incluye un **workspace aislado** que te permite tener todas las configuraciones específicas sin afectar tu configuración global de VS Code.

#### Cómo usar el Workspace Aislado:

```bash
# Opción 1: Script automatizado (Recomendado)
./open-workspace.sh        # En macOS/Linux
open-workspace.bat         # En Windows

# Opción 2: Desde terminal
code facturacion-autonomos.code-workspace

# Opción 3: Desde VS Code
# File → Open Workspace from File → Seleccionar facturacion-autonomos.code-workspace
```

#### Características del Workspace:

- 📁 **Folders organizados** por apps y packages
- ⚙️ **Settings específicos** para el proyecto
- 🧩 **Extensiones aisladas** que no afectan otros proyectos
- 🔧 **Tasks predefinidas** para desarrollo
- 🐛 **Debug configurations** listas para usar

👉 **Ver guía completa**: [docs/WORKSPACE_AISLADO.md](./docs/WORKSPACE_AISLADO.md)

### Extensiones Recomendadas

El workspace incluye configuración automática para estas extensiones:

- GitHub Copilot & Copilot Chat
- TypeScript y JavaScript
- Tailwind CSS IntelliSense
- Prisma
- ESLint & Prettier
- Jest & Playwright
- GraphQL

### Settings Optimizados

- Formateo automático al guardar
- Configuración de TypeScript optimizada
- Integración con Copilot Agent
- Configuración de debugging

## 🤖 Copilot Agent

El proyecto está optimizado para GitHub Copilot Agent con tareas predefinidas:

### Tareas Disponibles

- **`generate:adr`** - Genera nuevos ADRs
- **`scaffold:service`** - Crea nuevos microservicios
- **`scaffold:component`** - Genera componentes UI
- **`scaffold:page`** - Crea páginas Next.js
- **`analyze:bundle`** - Analiza bundle sizes
- **`audit:security`** - Auditoría de seguridad

### Usar Copilot Agent

1. Abre VS Code con la extensión GitHub Copilot
2. Accede al panel de Copilot Agent
3. Selecciona una tarea predefinida o haz preguntas sobre el código

## 🛠️ Tecnologías

### Frontend

- **Next.js 14** - React framework con App Router
- **React 18** - Librería UI con Server Components
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Componentes accesibles
- **Framer Motion** - Animaciones declarativas

### Backend

- **Express.js** - Framework web para Node.js
- **Prisma** - ORM moderno para bases de datos
- **JWT** - Autenticación basada en tokens
- **Helmet** - Middleware de seguridad
- **Winston** - Logging estructurado

### DevTools

- **TurboRepo** - Monorepo con caching inteligente
- **TypeScript** - Superset tipado de JavaScript
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formateador de código
- **Jest** - Framework de testing
- **Cypress** - E2E testing
- **Playwright** - Cross-browser testing

### Package Management

- **Yarn 4** - Package manager con node-modules linker
- **corepack** - Gestor de package managers

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crear** una rama feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### Flujo de Desarrollo

1. Asegúrate de que los tests pasen: `yarn test`
2. Verifica el linting: `yarn lint`
3. Ejecuta type checking: `yarn type-check`
4. Documenta decisiones importantes con ADRs

### Commits Convenionales

Este proyecto utiliza [Conventional Commits](https://conventionalcommits.org/):

```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🔗 Enlaces Útiles

- [TurboRepo Documentation](https://turbo.build/repo/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MADR Template](https://adr.github.io/madr/)

---

**¿Necesitas ayuda?** Abre un issue o contacta al equipo de desarrollo.

---

© 2025 Neil Muñoz Lago ([Neiland85](https://github.com/Neiland85)). Todos los derechos reservados.
