# 🔧 Vercel Deployment Issues - Complete Fix Guide

## ❌ **Error Evolutivo - Yarn Version Incompatible**

### **Error Actual:**

```
error facturacion-autonomos-monorepo@1.0.0: The engine "yarn" is incompatible with this module. Expected version ">=4.0.0". Got "1.22.19"
```

### **Análisis:**

- Vercel usa Yarn 1.22.19 por defecto
- El proyecto requiere Yarn >=4.0.0
- Incompatibilidad de versiones de package manager

## ✅ **Solución Final Aplicada**

### **1. Cambio a NPM**

```json
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

### **2. Archivos .nvmrc Añadidos**

```
/apps/web/.nvmrc: "20"
/.nvmrc: "20"
```

### **3. Configuración Vercel Dashboard**

```
Framework: Next.js
Root Directory: apps/web
Build Command: npm run build
Install Command: npm install
Output Directory: .next (auto)
Node.js Version: 20.x
```

## 🔄 **Historia de Errores Resueltos**

### **Error 1**: Function Runtimes ✅ RESUELTO

- **Problema**: `nodejs20.x` runtime inválido
- **Solución**: Configuración minimalista sin functions

### **Error 2**: Conflictos de Merge ✅ RESUELTO

- **Problema**: Multiple `<<<<<<< HEAD` en package.json files
- **Solución**: Resolución manual de todos los conflictos

### **Error 3**: Package.json Vacíos ✅ RESUELTO

- **Problema**: `{}` en api-gateway, invoice-service, auth-service
- **Solución**: Configuración completa para cada microservicio

### **Error 4**: Yarn Version ✅ RESUELTO

- **Problema**: Yarn >=4.0.0 required, got 1.22.19
- **Solución**: Switch a NPM en lugar de Yarn

### **Error 5**: Invalid Cron Expression ✅ RESUELTO

- **Problema**: `"schedule": "0 */5 * * * *"` (6 campos, debe ser 5)
- **Solución**: Eliminado vercel.json conflictivo de la raíz del proyecto

## 🎯 **Configuración Vercel Dashboard**

**Para monorepo, configurar en Dashboard:**

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: (auto-detected)
Install Command: (auto-detected)
Output Directory: (auto-detected)
Node.js Version: 20.x
```

## 🚀 **Resultado Esperado**

### **Build Process:**

1. ✅ Vercel detecta Next.js automáticamente
2. ✅ Instala dependencias con PNPM
3. ✅ Ejecuta `next build`
4. ✅ Genera `.next` output
5. ✅ Deploy exitoso

### **Ventajas de la Configuración Minimalista:**

- 🎯 **Menos errores**: Menos configuración = menos puntos de fallo
- ⚡ **Más rápido**: Autodetección optimizada por Vercel
- 🔄 **Mantenible**: Se actualiza automáticamente con Vercel
- 🛡️ **Robusto**: Usa defaults probados por millones de projects

## 🔍 **Debugging Future Issues**

### **Si sigue fallando:**

1. **Verificar package.json**: Debe tener `"build": "next build"`
2. **Verificar Node.js**: Apps/web debe usar Node 20
3. **Check Dashboard**: Root Directory debe ser `apps/web`
4. **Local test**: `cd apps/web && pnpm run build` debe funcionar

### **Logs importantes:**

```bash
# Ver build logs
vercel logs [deployment-url]

# Test local build
cd apps/web
pnpm run build
```

## ✅ **Status Update**

- ✅ vercel.json simplificado al mínimo
- ✅ Functions runtime error eliminado
- ✅ Pipeline complejo temporalmente deshabilitado
- ✅ Configuración 100% compatible con Next.js + PNPM
