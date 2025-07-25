# 🔐 GUÍA DE SEGURIDAD: PROTECCIÓN DE CLAVES Y SECRETOS

## 📋 ÍNDICE

1. [Principios fundamentales](#principios-fundamentales)
2. [Variables de entorno](#variables-de-entorno)
3. [Separación cliente/servidor](#separación-clienteservidor)
4. [Implementación práctica](#implementación-práctica)
5. [Herramientas de detección](#herramientas-de-detección)
6. [CI/CD y despliegue](#cicd-y-despliegue)

---

## 🎯 PRINCIPIOS FUNDAMENTALES

### ✅ HACER

- **Nunca** commitear archivos `.env` reales
- **Siempre** usar `.env.example` con valores ficticios
- **Validar** variables de entorno en el servidor
- **Separar** claramente cliente vs servidor
- **Rotar** secretos comprometidos inmediatamente
- **Documentar** qué variables van dónde

### ❌ NO HACER

- Hardcodear claves de API en el código
- Usar `NEXT_PUBLIC_` para secretos
- Acceder a variables del servidor desde componentes React
- Commitear archivos `.env` con secretos reales
- Usar secretos de desarrollo en producción
- Exponer secretos en logs

---

## 🌍 VARIABLES DE ENTORNO

### Clasificación de Variables

#### 🔒 SOLO SERVIDOR (Sin `NEXT_PUBLIC_`)

```bash
# APIs externas
FAL_API_KEY=sk-xxxxx
OPENAI_API_KEY=sk-xxxxx
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/db

# Autenticación
JWT_SECRET=super-secret-key
JWT_ACCESS_SECRET=access-secret-key
JWT_REFRESH_SECRET=refresh-secret-key
SESSION_SECRET=session-secret-key

# Servicios externos
REDIS_PASSWORD=redis-password
SMTP_PASS=email-app-password
```

#### 🌐 CLIENTE (Con `NEXT_PUBLIC_`)

```bash
# URLs públicas
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración del cliente
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_VERSION=1.0.0
```

### Estructura de Archivos

```
proyecto/
├── .env.example          # ✅ Template con valores ficticios
├── .env                  # ❌ NUNCA commitear
├── .env.local            # ❌ NUNCA commitear
├── .env.development      # ❌ NUNCA commitear
├── .env.production       # ❌ NUNCA commitear
└── .gitignore           # ✅ Debe incluir .env*
```

---

## ⚖️ SEPARACIÓN CLIENTE/SERVIDOR

### 🖥️ Código del Servidor (API Routes)

```typescript
// ✅ CORRECTO: En /app/api/ejemplo/route.ts
import { validateServerEnvironment, getServerVar } from '@/utils/server-env-validation';

export async function POST(request: Request) {
  // 1. Validar que estamos en el servidor
  ensureServerSide('API Example');

  // 2. Obtener variables de forma segura
  const falApiKey = getServerVar('FAL_API_KEY');
  const openaiKey = getServerVar('OPENAI_API_KEY');

  // 3. Usar las claves de forma segura
  const result = await callExternalAPI(falApiKey, openaiKey);

  return Response.json(result);
}
```

### 🎨 Código del Cliente (Componentes React)

```typescript
// ✅ CORRECTO: En componentes React
'use client';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

export function MyComponent() {
  // Monitoreo de seguridad en desarrollo
  useSecurityMonitor();

  // Solo variables públicas
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ❌ NUNCA hacer esto:
  // const secretKey = process.env.FAL_API_KEY; // ¡Error!

  return <div>Component content</div>;
}
```

---

## 🛠️ IMPLEMENTACIÓN PRÁCTICA

### 1. Sistema de Validación

```typescript
// utils/server-env-validation.ts
export function validateServerEnvironment(): ValidatedServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('🚨 SERVER FUNCTION CALLED ON CLIENT!');
  }

  const requiredVars = ['FAL_API_KEY', 'OPENAI_API_KEY'];
  // ... validación completa
}
```

### 2. Hook de Monitoreo

```typescript
// hooks/useSecurityMonitor.ts
export function useSecurityMonitor() {
  useEffect(() => {
    // Detectar exposición de variables
    detectClientExposure();
  }, []);
}
```

### 3. Configuración de .gitignore

```gitignore
# Variables de entorno
.env
.env.*
!.env.example

# Logs que pueden contener secretos
*.log
logs/

# Archivos de configuración locales
.vscode/settings.json
.idea/
```

---

## 🔍 HERRAMIENTAS DE DETECCIÓN

### Script de Auditoría Automática

```bash
# Ejecutar auditoría completa
./scripts/security-audit.sh

# Verificar solo archivos .env
git ls-files | grep -E "\.env$"

# Buscar claves hardcodeadas
grep -r "sk-[a-zA-Z0-9]{20,}" --include="*.ts" --include="*.js" .
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### GitHub Actions

```yaml
# .github/workflows/security-check.yml
name: Security Audit
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Security Audit
        run: ./scripts/security-audit.sh
```

---

## 🚀 CI/CD Y DESPLIEGUE

### Variables en GitHub Actions

```yaml
# GitHub Secrets (no accesibles en forks)
secrets:
  FAL_API_KEY: ${{ secrets.FAL_API_KEY }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

# Variables de entorno públicas
env:
  NEXT_PUBLIC_API_URL: https://api.miapp.com
```

### Configuración de Vercel

```bash
# CLI de Vercel
vercel env add FAL_API_KEY production
vercel env add OPENAI_API_KEY production

# Variables públicas
vercel env add NEXT_PUBLIC_API_URL production
```

### Docker con Secretos

```dockerfile
# Dockerfile
FROM node:18-alpine

# NO hacer esto:
# ENV FAL_API_KEY=sk-xxxxx  ❌

# Usar ARG para build-time
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# O runtime secrets
COPY --from=secrets /run/secrets/api-key /etc/secrets/
```

---

## 🆘 PROTOCOLO DE INCIDENTES

### Si se expone un secreto:

1. **🚨 INMEDIATO** (< 5 minutos)
   - Rotar/invalidar el secreto comprometido
   - Evaluar el alcance de la exposición

2. **⚡ URGENTE** (< 1 hora)
   - Eliminar el secreto del historial de Git
   - Actualizar todas las instancias
   - Notificar al equipo

3. **📋 SEGUIMIENTO** (< 24 horas)
   - Investigar causa raíz
   - Implementar prevenciones adicionales
   - Documentar el incidente

### Comandos de emergencia:

```bash
# Eliminar archivo del historial de Git
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch archivo.env' \
  --prune-empty --tag-name-filter cat -- --all

# Limpiar referencias
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Desarrollo

- [ ] `.env` files están en `.gitignore`
- [ ] No hay archivos `.env` reales en Git
- [ ] Variables del servidor están validadas
- [ ] Hook de monitoreo activo en desarrollo
- [ ] API routes usan `validateServerEnvironment()`

### Despliegue

- [ ] Variables de producción configuradas
- [ ] Secretos no aparecen en logs
- [ ] Bundle del cliente verificado
- [ ] Auditoría de seguridad pasa
- [ ] Documentación actualizada

### Monitoreo

- [ ] Alertas de exposición configuradas
- [ ] Scripts de auditoría automatizados
- [ ] Pre-commit hooks activos
- [ ] CI/CD incluye verificaciones
- [ ] Protocolo de incidentes documentado

---

## 🎓 RECURSOS ADICIONALES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security-headers)
- [Vercel Security](https://vercel.com/docs/concepts/projects/environment-variables#security)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**🔒 Recuerda: La seguridad es responsabilidad de todo el equipo**
