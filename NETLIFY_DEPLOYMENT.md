# 🚀 NETLIFY DEPLOYMENT SETUP

## 📋 Configuración para Netlify:

### 🎯 **Build Settings:**
```
Build command: cd apps/web && npm install --legacy-peer-deps && npm run build
Publish directory: apps/web/.next
Base directory: (dejar vacío)
```

### 🌐 **Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-app.netlify.app
NEXT_PUBLIC_API_BASE_URL=https://tu-app.netlify.app/api
```

### ✅ **Ventajas de Netlify:**
- ✅ Mejor soporte para monorepos
- ✅ Build commands más flexibles  
- ✅ Deployment más rápido
- ✅ Gratis para proyectos pequeños
- ✅ Mejor debugging de builds

### 🔗 **Pasos:**
1. Ve a https://netlify.com
2. Connect with GitHub
3. Selecciona tu repo
4. Usa la configuración de arriba
