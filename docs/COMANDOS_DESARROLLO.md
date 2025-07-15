# 🚀 DASHBOARD DE COMANDOS DE DESARROLLO

## 📋 Comandos de Auditoría y Monitoreo

### Auditoría Completa Automática

```bash
# Ejecutar auditoría completa del proyecto
./scripts/audit.sh

# Ver último reporte de auditoría
ls -la docs/audit/ | tail -1
cat docs/audit/audit-*.md | tail -1
```

### Monitoreo Continuo

```bash
# Monitoreo cada 5 minutos (default)
./scripts/monitor.sh

# Monitoreo cada 30 segundos (desarrollo activo)
./scripts/monitor.sh 30

# Monitoreo cada 10 minutos (background)
./scripts/monitor.sh 600
```

## 🔍 Comandos de Diagnóstico Manual

### Estado del Repositorio

```bash
# Estado completo de Git
git status --porcelain
git log --oneline -10
git branch -a

# Verificar cambios recientes
git diff --name-only HEAD~5 HEAD
git show --stat HEAD

# Verificar conflictos pendientes
git status | grep "merge conflict"
```

### Análisis de Estructura

```bash
# Estructura del proyecto
tree -L 3 -I node_modules

# Tamaños de directorios
du -sh . backend/ frontend/ packages/ .yarn/

# Archivos más grandes
find . -type f -size +10M -not -path "./.yarn/*" -not -path "./node_modules/*"

# Contar archivos por tipo
find . -name "*.ts" -o -name "*.tsx" | wc -l
find . -name "*.js" -o -name "*.jsx" | wc -l
find . -name "*.json" | wc -l
```

### Análisis de Dependencias

```bash
# Verificar workspaces
yarn workspaces list
yarn workspaces info

# Verificar dependencias desactualizadas
yarn outdated

# Análisis de duplicados
yarn dedupe --check

# Verificar integridad
yarn install --check-files
```

## 🧪 Comandos de Testing

### Tests por Workspace

```bash
# Todos los tests
yarn workspace facturacion-autonomos-backend test
yarn workspace facturacion-autonomos-frontend test
yarn workspace core test
yarn workspace services test

# Tests con cobertura
yarn workspace facturacion-autonomos-backend test --coverage
yarn workspace facturacion-autonomos-frontend test --coverage

# Tests en modo watch
yarn workspace facturacion-autonomos-backend test --watch
yarn workspace facturacion-autonomos-frontend test --watch

# Tests específicos
yarn workspace facturacion-autonomos-backend test controllers
yarn workspace facturacion-autonomos-frontend test components
```

### E2E Tests

```bash
# Playwright tests
yarn test:e2e

# Cypress tests (si está configurado)
yarn workspace facturacion-autonomos-frontend cypress:run
yarn workspace facturacion-autonomos-frontend cypress:open
```

## 🏗️ Comandos de Build y Deploy

### Builds de Desarrollo

```bash
# Build completo
yarn workspace facturacion-autonomos-backend build
yarn workspace facturacion-autonomos-frontend build

# Build con análisis
yarn workspace facturacion-autonomos-frontend build --analyze

# Verificar tipos TypeScript
yarn workspace facturacion-autonomos-backend tsc --noEmit
yarn workspace facturacion-autonomos-frontend tsc --noEmit
```

### Desarrollo Local

```bash
# Desarrollo completo (backend + frontend)
yarn dev

# Solo backend
yarn dev:backend

# Solo frontend
yarn dev:frontend

# Con logs detallados
DEBUG=* yarn dev:backend
```

## 🔧 Comandos de Mantenimiento

### Linting y Formato

```bash
# Linting completo
yarn lint

# Fix automático
yarn lint:fix

# Linting por workspace
yarn workspace facturacion-autonomos-backend lint
yarn workspace facturacion-autonomos-frontend lint

# Formato con Prettier
yarn prettier --write .
```

### Limpieza del Proyecto

```bash
# Limpiar builds
rm -rf backend/dist frontend/.next packages/*/dist

# Limpiar logs
rm -f backend/*.log

# Reinstalar dependencias
yarn install --force

# Limpiar cache de Yarn
yarn cache clean
```

### Base de Datos (Prisma)

```bash
# Generar cliente Prisma
yarn workspace facturacion-autonomos-backend prisma generate

# Aplicar migraciones
yarn workspace facturacion-autonomos-backend prisma migrate dev

# Reset de base de datos
yarn workspace facturacion-autonomos-backend prisma migrate reset

# Prisma Studio
yarn workspace facturacion-autonomos-backend prisma studio
```

## 🔒 Comandos de Seguridad

### Auditoría de Seguridad

```bash
# Auditoría completa
yarn audit

# Auditoría por nivel
yarn audit --level moderate
yarn audit --level high
yarn audit --level critical

# Fix automático de vulnerabilidades
yarn audit --fix
```

### Análisis de Vulnerabilidades

```bash
# Con npm audit (si está disponible)
npm audit

# Verificar dependencias conocidas
yarn audit --json > security-report.json
```

## 📊 Comandos de Métricas

### Análisis de Performance

```bash
# Bundle analyzer (frontend)
yarn workspace facturacion-autonomos-frontend analyze

# Lighthouse CI (si está configurado)
lhci autorun

# Análisis de dependencias
yarn workspace facturacion-autonomos-frontend webpack-bundle-analyzer
```

### Estadísticas del Código

```bash
# Líneas de código
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l

# Complejidad del código (si está configurado)
yarn complexity

# Análisis de duplicados
yarn jscpd
```

## 🐛 Comandos de Debugging

### Logs y Debugging

```bash
# Ver logs del backend
tail -f backend/combined.log
tail -f backend/error.log

# Debug mode para desarrollo
DEBUG=app:* yarn dev:backend
DEBUG=express:* yarn dev:backend

# Inspección con Node.js
node --inspect backend/src/index.js
```

### Análisis de Problemas

```bash
# Verificar puertos ocupados
lsof -i :3000
lsof -i :8000

# Procesos Node.js activos
ps aux | grep node

# Uso de memoria
top -p $(pgrep node)
```

## 📈 Comandos de CI/CD

### Preparación para Deploy

```bash
# Verificación pre-deploy
yarn lint && yarn test && yarn build

# Verificación de seguridad
yarn audit --level moderate

# Verificación de tipos
yarn workspace facturacion-autonomos-backend tsc --noEmit
yarn workspace facturacion-autonomos-frontend tsc --noEmit
```

### Docker (si está configurado)

```bash
# Build de imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Limpiar contenedores
docker-compose down
```

---

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Diario

1. `./scripts/monitor.sh` (en terminal separada)
2. `yarn dev` (desarrollo)
3. `yarn lint:fix` (antes de commit)
4. `yarn test` (verificar funcionalidad)

### Auditoría Semanal

1. `./scripts/audit.sh`
2. `yarn outdated`
3. `yarn audit`
4. Revisar reportes en `docs/audit/`

### Antes de Deploy

1. `./scripts/audit.sh`
2. `yarn build`
3. `yarn test`
4. `yarn audit --level moderate`

---

_Actualizado: 7 de julio de 2025_
