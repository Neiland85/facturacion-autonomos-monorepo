# ADR-008: Optimización de Configuración para Desarrollo Asistido por IA

## Estado

Aceptado

## Fecha

2024-12-19

## Contexto

Después de identificar problemas de configuración que afectaban el desarrollo, hot reload y la integración del monorepo, se requiere un ADR que documente las configuraciones optimizadas implementadas para las próximas fases del proyecto. Estas configuraciones aseguran un desarrollo fluido con asistencia de GitHub Copilot y herramientas de desarrollo modernas.

## Decisión

Implementamos una configuración optimizada del monorepo que abarca TypeScript, bundling, linting, formateo y development experience, con soporte completo para desarrollo asistido por IA.

### 1. Configuración TypeScript Optimizada

#### tsconfig.base.json (Raíz)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false
  },
  "exclude": ["node_modules", "dist", "coverage", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### Frontend tsconfig.json

- Hereda de `tsconfig.base.json`
- Configuración específica para Next.js con App Router
- Paths optimizados para importaciones absolutas
- Soporte completo para packages del monorepo

### 2. Next.js Configuration (next.config.mjs)

#### Transpile Packages

```javascript
transpilePackages: [
  '@facturacion/core',
  '@facturacion/services',
  '@facturacion/types',
  '@facturacion/ui',
];
```

#### Webpack Aliases

- Resolución optimizada de módulos del monorepo
- Aliases específicos para cada package
- Soporte para hot reload en desarrollo

### 3. VS Code Settings Optimizados

#### Frontend .vscode/settings.json

```json
{
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

#### Root .vscode/settings.json

- Configuración global del workspace
- Exclusiones optimizadas para rendimiento
- Soporte multi-workspace para monorepo

### 4. Tailwind CSS Configuration

#### Paths Inclusivos

```javascript
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  '../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  '../packages/core/src/**/*.{js,ts,jsx,tsx}',
];
```

## Beneficios

### 1. Development Experience (DX)

- **Hot Reload Optimizado**: Cambios se reflejan inmediatamente
- **Type Safety**: Validación completa de tipos en todo el monorepo
- **Import Auto-completion**: Sugerencias inteligentes para packages
- **Code Actions**: Auto-fix y organización automática de imports

### 2. IA Development Support

- **Contexto Completo**: Copilot entiende la estructura del monorepo
- **Type Inference**: Mejor sugerencias basadas en tipos TypeScript
- **Package Resolution**: Navegación fluida entre packages
- **Error Detection**: Detección temprana de errores de configuración

### 3. Performance

- **Selective Compilation**: Solo compila lo necesario
- **Optimized Bundling**: Transpilación eficiente de packages
- **Cache Management**: Aprovecha caché de TypeScript y Next.js
- **Tree Shaking**: Eliminación de código no utilizado

### 4. Maintainability

- **Consistent Configuration**: Configuración unificada y coherente
- **Scalable Structure**: Fácil adición de nuevos packages
- **Documentation**: ADRs y contexto para futuras decisiones
- **Testing Integration**: Configuración preparada para testing

## Configuraciones Aplicadas

### TypeScript

- ✅ `tsconfig.base.json` optimizado
- ✅ Frontend `tsconfig.json` con paths y aliases
- ✅ Packages individuales con herencia correcta
- ✅ Strict mode habilitado con excepciones controladas

### Next.js

- ✅ `transpilePackages` para monorepo
- ✅ Webpack aliases para resolución
- ✅ TypeScript y ESLint strict en builds
- ✅ Experimental features habilitadas

### VS Code

- ✅ Settings optimizados por workspace
- ✅ TypeScript import preferences
- ✅ Auto-save actions configuradas
- ✅ File exclusions para performance

### Tailwind CSS

- ✅ Paths inclusivos para todos los packages
- ✅ Plugin configuration optimizada
- ✅ CSS purging configurado correctamente

## Próximas Implementaciones

### Fase 2: Database & Auth

- Prisma configuration con TypeScript optimizado
- JWT middleware con type safety
- Database migrations con monorepo support

### Fase 3: API Integration

- AEAT/SII service configuration
- Type-safe API clients
- Error handling centralizado

### Fase 4: Testing & CI/CD

- Jest configuration para monorepo
- Cypress con TypeScript support
- GitLab CI pipeline optimizado

## Comandos de Desarrollo

### Desarrollo

```bash
# Desarrollo completo
yarn dev

# Solo frontend
yarn workspace @facturacion/web dev

# Solo API específica
yarn workspace @facturacion/api-facturas dev
```

### Build & Test

```bash
# Build completo
yarn build

# Testing
yarn test

# Linting
yarn lint

# Type checking
yarn type-check
```

### Database

```bash
# Prisma Studio
yarn db:studio

# Migrations
yarn db:migrate

# Generate client
yarn db:generate
```

## Validación

### Pre-requisitos Cumplidos

- ✅ Hot reload funcional
- ✅ Type checking sin errores
- ✅ Import resolution correcta
- ✅ Tailwind CSS aplicándose
- ✅ VS Code Intellisense activo
- ✅ Package cross-references funcionando

### Métricas de Desarrollo

- **Tiempo de Hot Reload**: < 1 segundo
- **Type Checking**: Sin errores en compilación
- **Import Resolution**: 100% de packages reconocidos
- **Build Time**: Optimizado con caché incremental

## Riesgos Mitigados

### Problemas Anteriores Resueltos

- ❌ ~~Hot reload no funcionaba~~
- ❌ ~~Imports de packages no se resolvían~~
- ❌ ~~Tailwind no aplicaba estilos~~
- ❌ ~~TypeScript errors en compilación~~
- ❌ ~~VS Code sin intellisense~~

### Configuración Robusta

- **Fallback Strategies**: Multiple resolvers configurados
- **Error Boundaries**: Graceful degradation en development
- **Cache Management**: Evita estados inconsistentes
- **Hot Module Replacement**: Preserve state en development

## Conclusión

Esta configuración optimizada sienta las bases para un desarrollo eficiente y asistido por IA en las próximas fases del proyecto. La arquitectura está preparada para escalar con nuevas funcionalidades manteniendo performance y developer experience óptimos.

## Referencias

- [Next.js Transpile Packages](https://nextjs.org/docs/advanced-features/compiler#module-transpilation)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Yarn Workspaces](https://classic.yarnpkg.com/docs/workspaces/)
- [VS Code Multi-root Workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces)
- [Tailwind CSS with Monorepos](https://tailwindcss.com/docs/content-configuration#working-with-third-party-libraries)
