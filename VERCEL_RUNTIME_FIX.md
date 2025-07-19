# 🔧 Vercel Function Runtime Error Fix

## ❌ **Error Específico**
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

## 🔍 **Análisis del Problema**

### **Causa Raíz:**
- Vercel no reconoce `nodejs20.x` como runtime válido en funciones
- El formato de versión debe seguir el patrón `runtime@version`
- Para Next.js, no es necesario especificar runtimes de funciones

### **Síntomas:**
- Build falla en "Running vercel build"
- Error: "Function Runtimes must have a valid version"
- Deployment stops before compilation

## ✅ **Solución Aplicada**

### **1. Configuración Minimalista**
```json
{
  "version": 2,
  "framework": "nextjs"
}
```

### **2. Por qué Funciona:**
- **Autodetección**: Vercel detecta automáticamente Next.js
- **Runtime por defecto**: Next.js usa Node.js 20 por defecto
- **Sin configuración manual**: Evita errores de versioning

### **3. Configuraciones Eliminadas:**
- ❌ `functions` con runtimes específicos
- ❌ `buildCommand` personalizado
- ❌ `installCommand` personalizado
- ❌ `outputDirectory` manual

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
