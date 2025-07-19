# 🚀 Configuración de Vercel para Monorepo

## 📋 Configuración Requerida en el Dashboard de Vercel

Para desplegar correctamente este monorepo en Vercel, **DEBES** configurar manualmente los siguientes valores en el dashboard de Vercel:

### 🎯 Configuración Básica

| Campo | Valor | Descripción |
|-------|-------|-------------|
| **Root Directory** | `apps/web` | 🚨 **MUY IMPORTANTE**: Especifica el subdirectorio donde está el frontend |
| **Framework** | `Next.js` | Framework detectado automáticamente |
| **Node.js Version** | `20.x` | Versión de Node.js a utilizar |

### 🛠️ Comandos de Build

| Campo | Valor | Descripción |
|-------|-------|-------------|
| **Build Command** | `cd ../.. && pnpm install && pnpm run build --filter=web` | Comando personalizado para monorepo |
| **Output Directory** | `.next` | Directorio de salida de Next.js |
| **Install Command** | `pnpm install` | Comando de instalación de dependencias |

### 🔧 Variables de Entorno

Configura estas variables en `Settings > Environment Variables`:

```bash
NODE_VERSION=20
PNPM_VERSION=8
NODE_ENV=production

# Variables específicas de tu aplicación
DATABASE_URL=your_database_url_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🏗️ Estructura del Proyecto

```
monorepo/
├── apps/
│   └── web/                 👈 Root Directory en Vercel
│       ├── package.json
│       ├── next.config.js
│       └── ...
├── packages/
│   └── ...
├── vercel.json             👈 Configuración de Vercel
└── package.json            👈 Root package.json
```

## 🚨 Pasos de Configuración Manual

### 1. Importar Proyecto
- Ve a [vercel.com](https://vercel.com)
- Importa tu repositorio de GitHub

### 2. Configurar Root Directory
- En la pantalla de importación, busca **"Root Directory"**
- Selecciona `apps/web` en el dropdown
- ⚠️ **Si no configuras esto, el despliegue fallará**

### 3. Configurar Build Settings
- **Build Command**: `cd ../.. && pnpm install && pnpm run build --filter=web`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 4. Configurar Variables de Entorno
- Ve a `Settings > Environment Variables`
- Agrega todas las variables necesarias para tu aplicación

## 📚 Comandos de Desarrollo Local

```bash
# Desarrollo local del frontend
pnpm dev --filter=web

# Build del frontend
pnpm build --filter=web

# Preview local
pnpm preview --filter=web
```

## 🔄 Despliegue Automático

Una vez configurado correctamente, cada push a las ramas configuradas desencadenará un despliegue automático.

### Ramas de Despliegue
- `main` → Producción
- `develop` → Preview
- `feature/*` → Preview

## ⚡ Optimizaciones

El archivo `vercel.json` incluye:
- ✅ Configuración de headers CORS
- ✅ Rewrites para APIs externas
- ✅ Redirects automáticos
- ✅ Clean URLs
- ✅ Cron jobs para health checks

## 🆘 Troubleshooting

### ❌ Error: "No Build Output"
**Causa**: Root Directory no configurado correctamente
**Solución**: Configurar `Root Directory` como `apps/web`

### ❌ Error: "pnpm not found"
**Causa**: Vercel usa npm por defecto
**Solución**: Configurar `Install Command` como `pnpm install`

### ❌ Error: "Module not found"
**Causa**: Dependencias del monorepo no instaladas
**Solución**: Usar build command completo que incluye `cd ../.. && pnpm install`

## 📞 Soporte

Si encuentras problemas, verifica:
1. ✅ Root Directory configurado como `apps/web`
2. ✅ Build Command incluye navegación al root (`cd ../..`)
3. ✅ Variables de entorno configuradas
4. ✅ Archivo `vercel.json` en el root del proyecto

---

**💡 Tip**: Guarda este archivo como referencia para futuros despliegues.
