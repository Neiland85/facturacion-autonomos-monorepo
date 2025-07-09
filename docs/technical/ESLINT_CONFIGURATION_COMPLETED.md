# Configuración de ESLint - Monorepo Facturación Autónomos

## ✅ Configuración Completada

### ESLint v9 + TypeScript + Prettier Integration

Se ha implementado una configuración moderna de ESLint v9 usando el formato `eslint.config.mjs` según los ADRs del proyecto.

## 📋 Características Implementadas

### 1. **Configuración Base (eslint.config.mjs)**
- ✅ ESLint v9 con formato de configuración flat config
- ✅ Integración completa con TypeScript y @typescript-eslint
- ✅ Integración con Prettier para formateo automático
- ✅ Configuraciones específicas por tipo de archivo y workspace

### 2. **Reglas de Linting por Contexto**

#### TypeScript General:
- `@typescript-eslint/no-unused-vars`: Error (con excepciones para `_`)
- `@typescript-eslint/no-explicit-any`: Warning
- `@typescript-eslint/prefer-nullish-coalescing`: Error
- `@typescript-eslint/prefer-optional-chain`: Error

#### APIs (Express/Node.js):
- `no-console`: Off (permitido para logging)
- `@typescript-eslint/no-explicit-any`: Error (más estricto)

#### Tests:
- `@typescript-eslint/no-explicit-any`: Off (más permisivo)
- `no-console`: Off

### 3. **Integración con VS Code**

#### Configuración del Workspace:
```json
{
  "eslint.experimental.useFlatConfig": true,
  "eslint.workingDirectories": [
    ".",
    "./apps/web",
    "./apps/api-facturas", 
    "./apps/api-tax-calculator",
    "./packages/database",
    "./packages/core",
    "./packages/services", 
    "./packages/types",
    "./packages/ui",
    "./frontend"
  ],
  "eslint.validate": [
    "javascript",
    "javascriptreact", 
    "typescript",
    "typescriptreact"
  ]
}
```

### 4. **Tareas Configuradas**

#### Scripts en package.json:
- `yarn lint`: Linting completo del monorepo
- `yarn lint:fix`: Aplicar fixes automáticos
- `yarn lint:check`: Validación estricta (0 warnings)
- `yarn lint:ci`: Generar reporte JSON para CI

#### Tareas de VS Code:
- 🔍 **Lint - Todo el monorepo**
- 🔧 **Lint Fix - Todo el monorepo** 
- ✅ **Lint Check - Validación estricta**

### 5. **Configuración de Turbo.json**
```json
{
  "lint": {
    "dependsOn": ["^lint"],
    "outputs": ["eslint-report.json"]
  },
  "lint:fix": {
    "dependsOn": ["^lint:fix"],
    "cache": false
  },
  "lint:check": {
    "dependsOn": ["^lint:check"],
    "outputs": ["eslint-report.json"]
  }
}
```

## 🎯 Archivos Ignorados

La configuración ignora automáticamente:
- `node_modules/**`
- `dist/**`, `build/**`, `.next/**`
- `coverage/**`, `.turbo/**`
- `**/*.d.ts`
- `**/generated/**`
- `**/prisma/generated/**`

## 🚀 Uso Recomendado

### En Desarrollo:
```bash
# Linting automático en save (VS Code)
# O ejecutar manualmente:
yarn lint:fix
```

### Pre-commit:
```bash
yarn lint:check
```

### CI/CD:
```bash
yarn lint:ci
```

## 📦 Dependencias Instaladas

- `eslint@^9.30.1`
- `@typescript-eslint/eslint-plugin@^8.18.2`
- `@typescript-eslint/parser@^8.18.2`
- `@typescript-eslint/types` (agregada)
- `eslint-config-prettier@^9.1.0`
- `eslint-plugin-prettier@^5.2.1`

## ✨ Beneficios

1. **Consistencia**: Reglas uniformes en todo el monorepo
2. **Flexibilidad**: Configuraciones específicas por contexto (API, Frontend, Tests)
3. **Integración**: Funciona perfectamente con VS Code y Prettier
4. **Performance**: Optimizado para monorepos con Turbo
5. **Modernidad**: Usa ESLint v9 flat config format

## 🔄 Próximos Pasos

- [ ] Configurar pre-commit hooks con husky
- [ ] Añadir reglas específicas para React/Next.js cuando sea necesario
- [ ] Integrar con CI/CD pipeline
- [ ] Configurar reportes de calidad de código

¡La configuración de ESLint está lista para la siguiente fase del desarrollo! 🎉
