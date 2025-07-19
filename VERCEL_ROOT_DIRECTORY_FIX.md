# 🚨 CONFIGURACIÓN CRÍTICA VERCEL

## ❌ **PROBLEMA IDENTIFICADO:**
Vercel ejecuta `yarn install` en la raíz del proyecto, ignorando nuestras configuraciones.

## ✅ **SOLUCIÓN DEFINITIVA:**

### 🎯 **Cambiar Root Directory en Vercel Dashboard:**

1. **Ve a tu proyecto en Vercel**: https://vercel.com/dashboard
2. **Settings → General → Build & Development Settings**
3. **Cambia:**
   ```
   Root Directory: apps/web  ←← ¡ESTO ES CLAVE!
   ```

### 📋 **Configuración completa:**

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: npm run build  
Output Directory: .next
Install Command: npm install --legacy-peer-deps
```

## 🎯 **¿POR QUÉ FALLA?**

- Vercel ve el monorepo root (con yarn.lock y workspace:*)
- Ejecuta yarn install automáticamente 
- Encuentra dependencias `workspace:*` que no existen en npm registry
- ❌ FALLA

## ✅ **CON ROOT DIRECTORY = apps/web:**

- Vercel solo ve el directorio /web
- Ejecuta npm install en /web (sin workspace dependencies)  
- ✅ FUNCIONA

---

## 🚀 **ACCIÓN INMEDIATA:**

**¡Cambia el Root Directory a `apps/web` en Vercel Dashboard!**
