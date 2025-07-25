# 🚂 Railway Deployment Guide - Sistema de Seguridad Integral

## 🎯 Por qué Railway

Railway es superior a Netlify para nuestro sistema porque:

- ✅ **Full-Stack Support**: Backend + Frontend + Base de datos
- ✅ **Monorepo Compatible**: Maneja workspaces de Yarn perfectamente
- ✅ **PostgreSQL Integrado**: Base de datos lista para producción
- ✅ **Environment Variables**: Gestión segura de secretos
- ✅ **Docker Support**: Contenedores para mejor control
- ✅ **Auto-scaling**: Escala automáticamente según demanda
- ✅ **Logs en tiempo real**: Debug y monitoreo integrado

## 🚀 Deploy Rápido (5 minutos)

### 1. Instalación Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login a Railway
railway login
```

### 2. Setup Automático

```bash
# Ejecutar script de configuración
./setup-railway.sh
```

**¡Listo!** Tu aplicación estará en: `https://facturacion-autonomos-security.up.railway.app`

## 🔧 Setup Manual Detallado

### 1. Crear Proyecto Railway

```bash
# Crear nuevo proyecto
railway project create facturacion-autonomos-security

# Agregar PostgreSQL
railway add postgresql
```

### 2. Configurar Variables de Ambiente

```bash
# Variables básicas
railway variables set NODE_ENV=production
railway variables set NODE_VERSION=20

# Variables de seguridad
railway variables set ENABLE_CSP=true
railway variables set ENABLE_FRAME_GUARD=true
railway variables set ENABLE_METRICS=true
railway variables set ENABLE_SENTRY=true

# Variables críticas (generar secretos únicos)
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set CSRF_SECRET=$(openssl rand -base64 32)
railway variables set SESSION_SECRET=$(openssl rand -base64 32)

# Sentry (opcional pero recomendado)
railway variables set SENTRY_DSN=tu-sentry-dsn-aqui
```

### 3. Deploy

```bash
# Deploy inicial
railway up

# Ver logs
railway logs

# Ver estado
railway status
```

## 📋 Configuración Avanzada

### Variables de Ambiente Completas

```bash
# === CORE ===
NODE_ENV=production
NODE_VERSION=20
PORT=3000

# === SECURITY SYSTEM ===
ENABLE_CSP=true
ENABLE_FRAME_GUARD=true
ENABLE_METRICS=true
ENABLE_SENTRY=true

# === AUTHENTICATION ===
JWT_SECRET=tu-jwt-secret-ultra-seguro
JWT_EXPIRATION=1h
BCRYPT_ROUNDS=12
ENABLE_MFA=true

# === CSRF PROTECTION ===
CSRF_SECRET=tu-csrf-secret-ultra-seguro

# === SESSION SECURITY ===
SESSION_SECRET=tu-session-secret-ultra-seguro
SESSION_MAX_AGE=3600000

# === RATE LIMITING ===
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
ENABLE_DDOS_PROTECTION=true

# === MONITORING ===
SENTRY_DSN=https://tu-sentry-dsn
METRICS_INTERVAL=30000

# === DATABASE ===
DATABASE_URL=${{DATABASE_URL}}  # Auto-configurado por Railway

# === NEXT.JS ===
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_API_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}/api
```

## 🏗️ Estructura de Deployment

```
Railway Project: facturacion-autonomos-security
├── 🌐 Web Service (Node.js)
│   ├── Build: yarn workspace @facturacion/security build && yarn workspace @facturacion/web build
│   ├── Start: yarn workspace @facturacion/web start
│   ├── Port: 3000
│   └── Health Check: /api/health
│
├── 🗄️ PostgreSQL Database
│   ├── Version: 15
│   ├── Storage: Persistent volume
│   └── Backup: Automático
│
└── 🔒 Security Features
    ├── Environment Variables: Encrypted
    ├── SSL/TLS: Automático
    ├── Custom Headers: Configurados
    └── Rate Limiting: Activado
```

## 🛡️ Security Headers Railway

Railway automáticamente configura estos headers de seguridad:

```http
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-*'; ...
```

## 📊 Monitoreo Railway

### Dashboard de Aplicación

- **URL**: `https://facturacion-autonomos-security.up.railway.app`
- **Health Check**: `https://facturacion-autonomos-security.up.railway.app/api/health`
- **Security Dashboard**: `https://facturacion-autonomos-security.up.railway.app/admin/security-dashboard`

### Logs y Métricas

```bash
# Ver logs en tiempo real
railway logs

# Ver métricas de CPU/Memoria
railway metrics

# Conectar a base de datos
railway connect postgresql
```

## 🔄 CI/CD con GitHub Actions

El workflow `.github/workflows/railway-deploy.yml` incluye:

1. **🛡️ Validación de seguridad** - Tests del sistema de seguridad
2. **🔍 Tests backend** - PostgreSQL + migraciones
3. **🌐 Build frontend** - Next.js + linting
4. **🚂 Deploy Railway** - Deployment automático
5. **📢 Notificaciones** - Estado del deployment

### Configurar Secrets en GitHub

```bash
# En GitHub Repository Settings > Secrets
RAILWAY_TOKEN=tu-railway-token
RAILWAY_PROJECT_ID=tu-project-id
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Ver logs detallados
railway logs --tail

# Rebuild forzado
railway up --detach

# Conectar para debug
railway shell
```

### Database Issues

```bash
# Conectar a PostgreSQL
railway connect postgresql

# Verificar conexión
railway run 'echo $DATABASE_URL'

# Reset base de datos (CUIDADO!)
railway reset postgresql
```

### Performance Issues

```bash
# Ver métricas
railway metrics

# Escalar recursos
railway scale --cpu 2 --memory 4

# Ver procesos
railway ps
```

## 🚀 Comandos Útiles

```bash
# === DEPLOYMENT ===
railway up                    # Deploy cambios
railway up --detach          # Deploy en background
railway redeploy              # Re-deploy sin cambios

# === MONITORING ===
railway logs                  # Ver logs
railway logs --tail           # Logs en tiempo real
railway metrics               # Ver métricas
railway ps                    # Ver procesos

# === DATABASE ===
railway connect postgresql    # Conectar a DB
railway backup create         # Crear backup
railway backup list           # Listar backups

# === ENVIRONMENT ===
railway variables             # Ver variables
railway variables set KEY=VAL # Setear variable
railway shell                 # Shell interactivo

# === PROJECT ===
railway status                # Estado del proyecto
railway open                  # Abrir en browser
railway domain                # Gestionar dominios
```

## 🔒 Security Checklist Railway

- [x] ✅ **HTTPS Automático** - SSL/TLS configurado
- [x] ✅ **Environment Variables** - Secrets encriptados
- [x] ✅ **Database Security** - PostgreSQL aislado
- [x] ✅ **Network Security** - Firewall configurado
- [x] ✅ **Header Security** - Headers de seguridad activos
- [x] ✅ **Rate Limiting** - Protección DDoS activada
- [x] ✅ **Health Monitoring** - Checks automáticos
- [x] ✅ **Backup System** - Backups automáticos
- [x] ✅ **Logging** - Logs estructurados
- [x] ✅ **Monitoring** - Métricas en tiempo real

## 💰 Costos Railway

- **Hobby Plan**: $5/mes - Perfecto para desarrollo
- **Pro Plan**: $20/mes - Recomendado para producción
- **Base de datos**: Incluida en el plan
- **Escalado**: Automático según uso

## 📞 Soporte

- 📚 **Docs**: https://docs.railway.app
- 💬 **Discord**: https://discord.gg/railway
- 🐛 **Issues**: https://github.com/railwayapp/railway-cli/issues

---

**🚂 Railway + Sistema de Seguridad = Deployment Perfecto para Producción!**
