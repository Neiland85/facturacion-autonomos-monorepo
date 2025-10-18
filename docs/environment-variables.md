# 📋 Guía Completa de Variables de Entorno

Esta guía documenta todas las variables de entorno utilizadas en el proyecto de Facturación para Autónomos.

## 🎯 Variables Requeridas

### Base de Datos

| Variable       | Descripción                 | Ejemplo                                               | Requerido |
| -------------- | --------------------------- | ----------------------------------------------------- | --------- |
| `DATABASE_URL` | Conexión PostgreSQL con SSL | `postgresql://user:pass@host:5432/db?sslmode=require` | ✅        |

### Autenticación

| Variable         | Descripción                            | Valor por Defecto | Requerido |
| ---------------- | -------------------------------------- | ----------------- | --------- |
| `JWT_SECRET`     | Clave secreta para JWT (mín. 32 chars) | -                 | ✅        |
| `JWT_EXPIRES_IN` | Tiempo de expiración de tokens         | `24h`             | ✅        |

### Caché y Rate Limiting

| Variable    | Descripción               | Ejemplo                          | Requerido |
| ----------- | ------------------------- | -------------------------------- | --------- |
| `REDIS_URL` | Conexión Redis para cache | `redis://user:pass@host:port/db` | ✅        |

## 📧 Variables Opcionales

### Email (SMTP)

| Variable    | Descripción     | Valor por Defecto | Requerido |
| ----------- | --------------- | ----------------- | --------- |
| `SMTP_HOST` | Servidor SMTP   | -                 | ❌        |
| `SMTP_PORT` | Puerto SMTP     | `587`             | ❌        |
| `SMTP_USER` | Usuario SMTP    | -                 | ❌        |
| `SMTP_PASS` | Contraseña SMTP | -                 | ❌        |

### Webhooks

| Variable         | Descripción                   | Requerido |
| ---------------- | ----------------------------- | --------- |
| `WEBHOOK_SECRET` | Secreto para validar webhooks | ❌        |

## 🔧 Variables de CI/CD (Vercel)

### Configuración de Vercel

| Variable            | Descripción            | Obtener en                                            | Requerido |
| ------------------- | ---------------------- | ----------------------------------------------------- | --------- |
| `VERCEL_TOKEN`      | Token de API de Vercel | [Account Settings](https://vercel.com/account/tokens) | ✅        |
| `VERCEL_PROJECT_ID` | ID del proyecto        | Dashboard > Settings > General                        | ✅        |
| `VERCEL_ORG_ID`     | ID de organización     | Dashboard > Settings > General                        | ✅        |

## 🌍 Configuración por Entorno

### Producción

```bash
# Valores reales para producción
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db?sslmode=require
JWT_SECRET=tu_jwt_secret_produccion_muy_seguro_32_chars_min
REDIS_URL=redis://prod_user:prod_pass@prod_host:port/prod_db
```

### Staging/Development

```bash
# Valores de desarrollo/staging
DATABASE_URL=postgresql://dev_user:dev_pass@dev_host:5432/dev_db?sslmode=require
JWT_SECRET=tu_jwt_secret_desarrollo_seguro_32_chars_min
REDIS_URL=redis://dev_user:dev_pass@dev_host:port/dev_db
```

## 🛠️ Servicios Recomendados

### Base de Datos

- **Neon** (Serverless PostgreSQL)
- **Supabase** (PostgreSQL + Auth)
- **Railway** (PostgreSQL integrado)
- **PlanetScale** (MySQL compatible)

### Redis

- **Upstash** (Redis serverless)
- **Redis Labs** (Redis Cloud)
- **Railway** (Redis integrado)

### Email

- **SendGrid** (SMTP + API)
- **Mailgun** (SMTP + API)
- **Resend** (API moderna)

## 🔐 Seguridad

### Mejores Prácticas

- ✅ Usa contraseñas fuertes y únicas
- ✅ Habilita SSL/TLS en todas las conexiones
- ✅ No commits valores sensibles al repositorio
- ✅ Usa diferentes valores por entorno
- ✅ Rota secrets periódicamente

### Validación

- JWT_SECRET: Mínimo 32 caracteres, caracteres aleatorios
- DATABASE_URL: Debe incluir `sslmode=require` en producción
- REDIS_URL: Debe usar autenticación en producción

## 📝 Checklist de Configuración

### Antes del Despliegue

- [ ] DATABASE_URL configurada y probada
- [ ] JWT_SECRET generado (32+ caracteres)
- [ ] REDIS_URL configurada
- [ ] VERCEL_TOKEN obtenido
- [ ] VERCEL_PROJECT_ID obtenido
- [ ] VERCEL_ORG_ID obtenido
- [ ] Variables configuradas en Vercel Dashboard
- [ ] SSL habilitado en base de datos
- [ ] Conexiones probadas localmente

### Verificación

```bash
# Probar conexión a BD
psql "$DATABASE_URL" -c "SELECT 1;"

# Verificar JWT_SECRET
node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)"

# Probar Redis
redis-cli -u "$REDIS_URL" ping
```
