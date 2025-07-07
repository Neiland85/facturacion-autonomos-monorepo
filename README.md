# 📊 Facturación Autónomos - Monorepo

> Plataforma unificada para gestión y facturación de autónomos, organizada como monorepo modular con backend Node.js y frontend React. Arquitectura escalable, pruebas automáticas y CI/CD integrado.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org/)
[![Yarn](https://img.shields.io/badge/Yarn-4.9%2B-blue.svg)](https://yarnpkg.com/)
[![Turbo](https://img.shields.io/badge/Turbo-2.3%2B-red.svg)](https://turbo.build/)

## 🎯 Visión del Proyecto

Esta plataforma está diseñada para simplificar la gestión administrativa y fiscal de autónomos, proporcionando herramientas integradas para facturación, cálculo de impuestos, y cumplimiento con las obligaciones fiscales españolas.

### 🌟 Características Principales

- **💼 Gestión de Facturas**: Creación, edición y seguimiento de facturas
- **🧮 Cálculo Fiscal**: Automatización de cálculos de IVA, IRPF y retenciones
- **📊 Reporting**: Informes detallados y exportación de datos
- **🔐 Seguridad**: Autenticación robusta y protección de datos
- **📱 Responsive**: Interfaz adaptada para escritorio y móvil
- **🤖 Copilot Ready**: Optimizado para GitHub Copilot Agent

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

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Web App** | 3000 | http://localhost:3000 | Frontend principal |
| **API Facturas** | 3001 | http://localhost:3001 | API de gestión de facturas |
| **API Tax Calculator** | 3002 | http://localhost:3002 | API de cálculos fiscales |
| **Prisma Studio** | 5555 | http://localhost:5555 | Gestor visual de BD |

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

| Tipo | Mínimo | Objetivo |
|------|--------|----------|
| Statements | 70% | 85% |
| Branches | 70% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

## 🚢 Deployment

### Environments

- **Development** - Local + feature branches
- **Staging** - Branch `develop`
- **Production** - Branch `main`

### Docker

```bash
# Build completo
docker-compose build

# Desarrollo
docker-compose up -d

# Solo servicios de soporte (BD, Redis)
docker-compose up -d postgres redis
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