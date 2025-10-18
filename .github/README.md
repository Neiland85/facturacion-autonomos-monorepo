# 🚀 CI/CD Workflows

Este directorio contiene los workflows de GitHub Actions para automatizar el proceso de CI/CD del proyecto.

## 📋 Workflows Disponibles

### 1. 🚀 CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push/PR a `main` y `develop`

**Jobs:**
- **🔍 Code Quality**: Type checking, linting, y validación de código
- **🧪 Tests**: Ejecución de tests con cobertura y reporte a Codecov
- **🏗️ Build**: Compilación de todos los paquetes y servicios
- **🚀 Deploy Staging**: Despliegue automático a staging (branch `develop`)
- **🎯 Deploy Production**: Despliegue automático a producción (branch `main`)

### 2. 🚀 Release & Version (`release.yml`)
**Triggers:** Push a `main` o manual

**Funcionalidades:**
- Versionado automático basado en conventional commits
- Generación de changelogs
- Creación de Git tags y GitHub releases
- Notificaciones a Slack (opcional)

### 3. 🤖 Dependabot Auto-Merge (`dependabot.yml`)
**Triggers:** PRs creados por Dependabot

**Funcionalidades:**
- Auto-merge de actualizaciones de parches
- Auto-approve de dependencias directas
- Comentarios en PRs que requieren revisión manual

### 4. 💅 Code Formatting (`formatting.yml`)
**Triggers:** Push/PR a `main` y `develop`

**Funcionalidades:**
- Verificación automática de formato de código
- Auto-fix de problemas de formato en PRs
- Comentarios informativos en PRs

## ⚙️ Configuración

### Dependabot
El archivo `.github/dependabot.yml` configura las actualizaciones automáticas de dependencias:
- **Frecuencia:** Semanal (lunes 9:00 Madrid)
- **Grupos:** TypeScript, Testing, ESLint
- **Límite:** 10 PRs abiertas máximo

### Environments
Para los despliegues, se requieren los siguientes environments en GitHub:
- `staging`: Para despliegues de desarrollo
- `production`: Para despliegues de producción

### Secrets Requeridos
```
GITHUB_TOKEN          # Proporcionado automáticamente
SLACK_WEBHOOK_URL     # Para notificaciones de release (opcional)
```

## 🔧 Comandos Útiles

### Ejecutar workflows localmente
```bash
# Ver estado de workflows
gh workflow list

# Ver runs recientes
gh run list

# Ver logs de un run específico
gh run view <run-id> --log
```

### Triggers manuales
```bash
# Trigger release manual
gh workflow run release.yml -f version_type=minor
```

## 📊 Monitoreo

### Métricas importantes
- ✅ **Tasa de éxito de builds**: > 95%
- ✅ **Cobertura de tests**: > 80%
- ✅ **Tiempo de build**: < 15 minutos
- ✅ **Tiempo de test**: < 10 minutos

### Alertas
- Falla en build de `main`
- Cobertura de tests < 80%
- Build time > 20 minutos

## 🚨 Troubleshooting

### Problemas comunes

1. **Cache issues**: Limpiar cache de pnpm
   ```bash
   gh cache delete <cache-id>
   ```

2. **Permission issues**: Verificar que `GITHUB_TOKEN` tenga los permisos necesarios

3. **Timeout issues**: Aumentar `timeout-minutes` en el workflow

4. **Dependency conflicts**: Verificar `pnpm-lock.yaml` y rebase con `main`

### Debug mode
Para debugging, agregar `debug: true` al job:
```yaml
jobs:
  my-job:
    steps:
      - run: echo "Debug mode enabled"
        if: runner.debug == '1'
```

## 📝 Mejoras Futuras

- [ ] Integración con Docker registry
- [ ] Despliegues a Kubernetes
- [ ] Tests de integración end-to-end
- [ ] Security scanning con Snyk/CodeQL
- [ ] Performance monitoring
- [ ] Rollback automático en fallos