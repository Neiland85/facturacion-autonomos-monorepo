# 🚀 GUÍA COMPLETA NETLIFY - FACTURACIÓN AUTÓNOMOS

## 🎯 CONFIGURACIÓN COMPLETA NETLIFY

### 1. CONFIGURACIÓN DE SITIO NETLIFY

#### 📋 **Configuración Básica**

```
Site name: facturacion-autonomos-monorepo
Domain: facturacion-autonomos-monorepo.netlify.app
Repository: https://github.com/tu-usuario/facturacion-autonomos-monorepo
Branch: feature/security-validation-system
```

#### 🏗️ **Build Settings**

```bash
Base directory: (vacío - raíz del repo)
Build command: corepack enable && corepack prepare yarn@4.9.2 --activate && yarn install --immutable && yarn workspace @facturacion/web build
Publish directory: apps/web/.next
Functions directory: apps/web/functions
```

#### 🔧 **Environment Variables**

En Netlify Dashboard > Site settings > Environment variables:

```bash
NODE_ENV=production
NODE_VERSION=20
COREPACK_ENABLE_STRICT=0
YARN_ENABLE_IMMUTABLE_INSTALLS=true
NEXT_PUBLIC_APP_URL=https://facturacion-autonomos-monorepo.netlify.app
NEXT_PUBLIC_API_BASE_URL=https://facturacion-autonomos-monorepo.netlify.app/api
```

### 2. CONFIGURACIÓN EN netlify.toml ✅

El archivo `netlify.toml` ya está configurado con:

- ✅ Build command optimizado para Yarn 4.9.2
- ✅ Variables de entorno correctas
- ✅ Headers de seguridad (X-Frame-Options, CSP, etc.)
- ✅ Plugin @netlify/plugin-nextjs
- ✅ Redirects para API
- ✅ Cache headers optimizados

### 3. PASOS EN NETLIFY DASHBOARD

#### **Paso 1: Acceder a Netlify**

1. Ve a https://app.netlify.com
2. Inicia sesión con tu cuenta
3. Selecciona tu sitio "facturacion-autonomos-monorepo"

#### **Paso 2: Deploy Settings**

```bash
Site settings > Build & deploy > Continuous Deployment

✅ Repository: Conectado a GitHub
✅ Branch to deploy: feature/security-validation-system
✅ Build settings:
   - Base directory: (vacío)
   - Build command: (se lee automáticamente de netlify.toml)
   - Publish directory: (se lee automáticamente de netlify.toml)
```

#### **Paso 3: Environment Variables**

```bash
Site settings > Environment variables > Add variable

NODE_ENV               → production
NODE_VERSION           → 20
COREPACK_ENABLE_STRICT → 0
YARN_ENABLE_IMMUTABLE_INSTALLS → true
```

#### **Paso 4: Plugin Configuration**

```bash
Site settings > Build & deploy > Build plugins

✅ @netlify/plugin-nextjs debe aparecer automáticamente
   (se lee desde netlify.toml)
```

### 4. VERIFICACIÓN DE DEPLOY

#### **Deploy Manual**

1. Ve a "Deploys" tab
2. Click "Trigger deploy" > "Deploy site"
3. Monitorea el log de build

#### **Log de Build Esperado**

```bash
2:14:20 PM: Started building repository
2:14:20 PM: corepack enable
2:14:21 PM: corepack prepare yarn@4.9.2 --activate
2:14:22 PM: yarn install --immutable
2:14:45 PM: yarn workspace @facturacion/web build
2:15:30 PM: ✨ Build completed successfully
2:15:31 PM: Site is live ✨
```

### 5. TROUBLESHOOTING

#### **Error: "Build failed"**

```bash
# Si falla, revisar:
1. Build logs en Netlify dashboard
2. Verificar que todas las dependencias estén en package.json
3. Verificar que no hay conflictos de merge
4. Verificar variables de entorno
```

#### **Error: "Function size exceeded"**

```bash
# Si las funciones son muy grandes:
1. Site settings > Functions > Function bundling
2. Activar "Optimize bundling for performance"
```

#### **Error: "Module not found"**

```bash
# Si faltan módulos:
1. Verificar workspace dependencies en package.json
2. Limpiar node_modules: rm -rf node_modules && yarn install
3. Verificar paths en tsconfig.json
```

### 6. COMANDOS ÚTILES

#### **Local Testing**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login a Netlify
netlify login

# Test local
netlify dev

# Build preview
netlify build

# Deploy preview
netlify deploy --dir=apps/web/.next --functions=apps/web/functions
```

#### **Git Workflow**

```bash
# Commit final
git add -A
git commit -m "fix: Configuración completa Netlify con seguridad"
git push origin feature/security-validation-system

# Si todo funciona, merge a main
git checkout main
git merge feature/security-validation-system
git push origin main
```

### 7. MONITOREO POST-DEPLOY

#### **URLs a Verificar**

```bash
✅ https://facturacion-autonomos-monorepo.netlify.app
✅ https://facturacion-autonomos-monorepo.netlify.app/health
✅ https://facturacion-autonomos-monorepo.netlify.app/api/invoices/stats
```

#### **Headers de Seguridad**

```bash
# Verificar con curl
curl -I https://facturacion-autonomos-monorepo.netlify.app

# Deben aparecer:
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Content-Security-Policy: ...
```

### 8. PERFORMANCE OPTIMIZATION

#### **Next.js Optimizations**

```bash
# En netlify.toml ya configurado:
✅ Static file caching (31536000 seconds)
✅ Image optimization habilitado
✅ Bundle optimization
✅ Edge functions ready
```

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Tu aplicación está configurada con:

- ✅ **Seguridad**: Headers CSP, XSS protection, frame options
- ✅ **Performance**: Cache optimization, bundle splitting
- ✅ **Monorepo**: Yarn workspaces completamente funcional
- ✅ **TypeScript**: Build optimizado y validaciones
- ✅ **CI/CD**: Deploy automático desde GitHub

### 🚀 NEXT STEPS

1. Hacer el deploy inicial
2. Configurar custom domain (opcional)
3. Configurar alertas de monitoring
4. Setup analytics (opcional)

**¡Tu aplicación de facturación está lista para conquistar el mundo! 🌍💫**
