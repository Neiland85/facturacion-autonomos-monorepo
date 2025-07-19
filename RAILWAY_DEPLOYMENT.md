# 🚆 RAILWAY DEPLOYMENT SETUP

## 📋 Configuración para Railway:

### 🎯 **railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/web && npm install --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "cd apps/web && npm start",
    "healthcheckPath": "/"
  }
}
```

### ✅ **Ventajas de Railway:**
- ✅ Excelente para Next.js
- ✅ Auto-deploy desde GitHub
- ✅ Soporte nativo para monorepos
- ✅ Muy fácil configuración
- ✅ $5/mes con buen tier gratuito

### 🔗 **Pasos:**
1. Ve a https://railway.app
2. Deploy from GitHub
3. Selecciona tu repo  
4. Railway detecta Next.js automáticamente
