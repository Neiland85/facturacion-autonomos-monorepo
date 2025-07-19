# 🚀 NETLIFY DEPLOYMENT - CONFIGURACIÓN COMPLETA

## ✅ **CONFIGURACIÓN YA APLICADA:**

### � **Archivos configurados:**
- ✅ `netlify.toml` - Configuración principal
- ✅ `apps/web/next.config.mjs` - Optimizado para Netlify
- ✅ `apps/web/package.json` - Scripts de deployment
- ❌ Eliminados todos los archivos Vercel

### 🎯 **Build Settings (Automáticos desde netlify.toml):**
```
Build command: cd apps/web && npm install --legacy-peer-deps && npm run build
Publish directory: apps/web/.next
Base directory: (vacío)
Node version: 20
```

### 🌐 **Environment Variables (Pre-configuradas):**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://facturacion-autonomos.netlify.app
NEXT_PUBLIC_API_BASE_URL=https://facturacion-autonomos.netlify.app/api
```

### 🔗 **DEPLOY EN NETLIFY:**

1. **Ve a https://netlify.com**
2. **New site from Git → GitHub**
3. **Selecciona: `facturacion-autonomos-monorepo`**
4. **Deploy site** (configuración automática desde netlify.toml)

### 🎉 **VENTAJAS APLICADAS:**
- ✅ Static export optimizado
- ✅ Headers de seguridad configurados
- ✅ Cache de assets estáticos
- ✅ Variables de entorno por environment
- ✅ Preview deployments automáticos
- ✅ Mejor soporte para monorepos
