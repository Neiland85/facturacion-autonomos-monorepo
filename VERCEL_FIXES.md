# 🔧 Vercel Deployment Fixes

## ❌ **Problemas Identificados**

### 1. **Configuración Incorrecta del Monorepo**
- **Problema**: `vercel.json` en la raíz del proyecto con paths incorrectos
- **Error**: `buildCommand` ejecutando desde directorio incorrecto
- **Síntoma**: "Deployment failed" en checks de GitHub

### 2. **Estructura de Archivos Incorrecta**
- **Problema**: Vercel buscando archivos en rutas relativas incorrectas
- **Error**: `outputDirectory` apuntando a ubicación inexistente
- **Síntoma**: Build exitoso pero deployment fallido

## ✅ **Soluciones Implementadas**

### 1. **Movido vercel.json a apps/web/**
```bash
# Antes (INCORRECTO)
/vercel.json  # En la raíz

# Después (CORRECTO) 
/apps/web/vercel.json  # En la app específica
```

### 2. **Configuración Simplificada**
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install", 
  "outputDirectory": ".next"
}
```

### 3. **Root Directory en Vercel Dashboard**
```
Root Directory: apps/web
Build Command: pnpm run build  
Install Command: pnpm install
Output Directory: .next
```

## 🚀 **Configuración Recomendada**

### **Para Monorepos con PNPM:**

1. **vercel.json en la app específica** (`apps/web/vercel.json`)
2. **Root Directory configurado** en Vercel Dashboard
3. **Build commands simples** sin navegación de directorios
4. **Node.js 20.x** especificado en funciones

### **Comandos de Build Correctos:**
```bash
# En Vercel Dashboard
Build Command: pnpm run build
Install Command: pnpm install

# Local testing
cd apps/web
vercel build
```

## 🔍 **Debugging Vercel Deployments**

### **Verificar Configuración:**
```bash
# Ver configuración actual
vercel inspect

# Ver logs de build
vercel logs [deployment-url]

# Test build local
vercel build
```

### **Errores Comunes:**
1. **"Command failed"**: Verificar que `pnpm run build` funciona localmente
2. **"Output directory not found"**: Confirmar que `.next` se genera
3. **"Install failed"**: Verificar `package.json` en `apps/web`

## ✅ **Status Actual**
- ✅ `vercel.json` movido a `apps/web/`
- ✅ Configuración simplificada y validada
- ✅ `.vercelignore` creado para optimización
- ✅ Documentación actualizada

**Próximo paso**: Configurar Root Directory en Vercel Dashboard como `apps/web`
