# 🔧 VERCEL WORKSPACE PROTOCOL FIX

## ❌ **Problema Identificado**

**Error**: `npm error Unsupported URL Type "workspace:": workspace:*`

Vercel estaba intentando usar `npm install` pero nuestro monorepo usa **Yarn workspaces** con el protocolo `workspace:*` que npm no soporta nativamente.

---

## ✅ **Solución Implementada**

### 1. **Actualizada configuración Vercel** (`apps/web/vercel.json`)

```json
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "corepack enable && yarn install --immutable",
  "buildCommand": "yarn workspace @facturacion/web build",
  "outputDirectory": ".next",
  "rootDirectory": ".",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ."
}
```

### 2. **Configurado workspace** (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'frontend'
```

### 3. **Optimizado deployment** (`.vercelignore`)

- Exclude otros microservices del deployment web
- Ignore archivos innecesarios para optimizar build
- Reduce tiempo de deployment

---

## 🎯 **Cambios Clave**

1. **Package Manager**: npm → **Yarn** (con `corepack enable`)
2. **Install Command**: Usa `yarn install --immutable` para lockfile
3. **Build Command**: Usa workspace específico `yarn workspace @facturacion/web build`
4. **Root Directory**: Configurado para manejar monorepo correctamente
5. **Ignore Command**: Optimiza rebuilds cuando no hay cambios en web app

---

## 🚀 **Resultado Esperado**

- ✅ **Yarn workspaces** correctamente soportados
- ✅ **Protocolo workspace:\*** resuelto
- ✅ **Build optimizado** solo para web app
- ✅ **Deployment más rápido** con .vercelignore

---

**Commit**: `8568b46` - fix: configure Vercel for monorepo with Yarn workspaces

**Status**: 🔄 **Testing** - Vercel debería deployar exitosamente ahora
