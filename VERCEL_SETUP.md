# 🚀 Guía de Configuración Vercel - Monorepo

## 📋 **CONFIGURACIÓN ACTUALIZADA**

### ✅ **Archivos de Configuración**
- ❌ **Root `vercel.json`**: Eliminado (no necesario para monorepo)
- ✅ **`apps/web/vercel.json`**: Configuración específica para la app web

### 🎯 **Configuración en Dashboard de Vercel**

1. **Import Project**: Conecta tu repositorio GitHub
2. **Configure Project**:
   ```
   Project Name: facturacion-autonomos-web
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: pnpm run build
   Install Command: pnpm install
   Output Directory: .next (default)
   Node.js Version: 20.x
   ```

3. **Environment Variables** (si es necesario):
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

### 🔧 **Configuración Manual via CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurar proyecto desde apps/web
cd apps/web
vercel

# Seguir prompts:
# Set up and deploy "~/path/apps/web"? [Y/n] y
# Which scope do you want to deploy to? [tu-usuario]
# Link to existing project? [y/N] n
# What's your project's name? facturacion-autonomos-web
# In which directory is your code located? ./
```

### 🏗️ **Build Commands Correctos**

**Para Monorepo desde root:**
```bash
# Opción 1: Build específico
cd apps/web && pnpm install && pnpm run build

# Opción 2: Con turbo (recomendado)
pnpm install && pnpm turbo run build --filter=web
```

**Para App específica desde apps/web:**
```bash
# Más simple y directo
pnpm install && pnpm run build
```
