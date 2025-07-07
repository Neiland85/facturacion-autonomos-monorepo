# Facturación Autónomos - Monorepo

🚀 **Plataforma moderna de facturación para autónomos construida con TurboRepo, TypeScript y tecnologías de vanguardia.**

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Desarrollo](#desarrollo)
- [ADR (Architecture Decision Records)](#adr-architecture-decision-records)
- [Configuración de VS Code](#configuración-de-vs-code)
- [Copilot Agent](#copilot-agent)
- [Tecnologías](#tecnologías)
- [Contribuir](#contribuir)

## ✨ Características

- 🏗️ **Monorepo con TurboRepo** - Optimización de builds y caching inteligente
- ⚡ **Next.js 14** - App Router, Server Components y React 18
- 🔐 **APIs RESTful** - Microservicios con Express, JWT y rate limiting
- 📊 **Base de Datos** - Prisma ORM con PostgreSQL
- 🎨 **UI Moderna** - Tailwind CSS, Headless UI y Framer Motion
- 🧪 **Testing Completo** - Jest, Cypress y Playwright
- 📝 **TypeScript** - Type safety en todo el stack
- 🔍 **Linting & Formatting** - ESLint + Prettier con configuración compartida
- 🤖 **GitHub Copilot** - Configuración optimizada para AI-assisted development
- 📚 **ADR** - Architecture Decision Records automatizados

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
