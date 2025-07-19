# 🔧 CONFIGURACIÓN VARIABLES DE ENTORNO EN VERCEL

## 📋 Variables que debes configurar en Vercel Dashboard:

### 🌐 **Environment Variables (Vercel Project Settings)**

```bash
# ✅ URLs Públicas (ya configuradas automáticamente)
NEXT_PUBLIC_API_BASE_URL=https://facturacion-autonomos-monorepo.vercel.app/api
NEXT_PUBLIC_APP_URL=https://facturacion-autonomos-monorepo.vercel.app

# 🔐 Secrets (OBLIGATORIAS - configurar manualmente)
NEXTAUTH_SECRET="tu-secret-super-seguro-de-32-chars"
NEXTAUTH_URL="https://facturacion-autonomos-monorepo.vercel.app"

# 🗄️ Database (si tienes una)
DATABASE_URL="postgresql://user:pass@host:port/db"

# 📧 Email (opcional por ahora)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
```

## 🎯 **Pasos a seguir:**

1. **Ve a [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Selecciona tu proyecto**: `facturacion-autonomos-monorepo`
3. **Ve a Settings → Environment Variables**
4. **Añade las variables obligatorias:**

### Variables CRÍTICAS:
```
NEXTAUTH_SECRET = [genera un string aleatorio de 32 caracteres]
NEXTAUTH_URL = https://facturacion-autonomos-monorepo.vercel.app
NODE_ENV = production
```

## 🚨 **¿El problema podría ser NextAuth sin configurar?**

Si no tienes configurado `NEXTAUTH_SECRET`, Next.js fallará en build/runtime.
