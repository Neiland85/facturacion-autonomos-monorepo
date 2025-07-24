# Auth Service - Servicio de Autenticación Segura

Microservicio de autenticación y autorización con características de seguridad avanzadas para el sistema de facturación de autónomos.

## 🔐 Características de Seguridad

### Autenticación Segura

- **JWT en cookies HttpOnly**: Tokens almacenados en cookies seguras, no accesibles desde JavaScript
- **Configuración de cookies**: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- **Prevención de XSS**: Los tokens no están expuestos al JavaScript del cliente
- **Prevención de CSRF**: Configuración SameSite y validación de origen

### Gestión de Sesiones

- **Express Session con Redis**: Almacén de sesiones robusto y escalable
- **Regeneración de sesión**: ID de sesión regenerado después del login para prevenir session fixation
- **TTL automático**: Expiración automática de sesiones inactivas
- **Revocación de sesiones**: Capacidad de invalidar sesiones específicas o todas las sesiones del usuario

### Autenticación de Dos Factores (2FA)

- **TOTP**: Time-based One-Time Passwords usando `speakeasy`
- **Códigos QR**: Generación automática para apps como Google Authenticator
- **Códigos de backup**: 10 códigos de un solo uso para recuperación
- **Ventana de tiempo**: Tolerancia de ±60 segundos para códigos TOTP

### Protección contra Ataques

- **Rate Limiting**:
  - 5 intentos de login por sesión cada 15 minutos
  - 100 requests generales por IP cada 15 minutos
- **Validación robusta**: Esquemas Zod para validación de entrada
- **Sanitización**: Limpieza automática de datos de entrada
- **Headers de seguridad**: Helmet.js para headers HTTP seguros

### Gestión de Contraseñas

- **Bcrypt**: Hash seguro con 12 salt rounds
- **Validación de fortaleza**: Requisitos estrictos de complejidad
- **Cambio seguro**: Invalidación de todas las sesiones al cambiar contraseña

## 🚀 Configuración y Uso

### Variables de Entorno Requeridas

```bash
# Servidor
NODE_ENV=production
PORT=3001

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT Secrets (¡CAMBIAR EN PRODUCCIÓN!)
JWT_ACCESS_SECRET=your_super_secure_access_secret_256_bits_minimum
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_256_bits_minimum

# Session Secret
SESSION_SECRET=your_super_secure_session_secret_256_bits_minimum

# CORS
ALLOWED_ORIGINS=https://yourapp.com,https://api.yourapp.com
```

### Instalación

```bash
cd apps/auth-service
yarn install
```

### Desarrollo

```bash
yarn dev
```

### Producción

```bash
yarn build
yarn start
```

## 📡 API Endpoints

### Autenticación Base

#### `POST /api/auth/register`

Registrar nuevo usuario con validación de fortaleza de contraseña.

```json
{
  "email": "usuario@ejemplo.com",
  "password": "ContraseñaSegura123!",
  "name": "Juan Pérez"
}
```

#### `POST /api/auth/login`

Login con email y contraseña. Establece cookies HttpOnly.

```json
{
  "email": "usuario@ejemplo.com",
  "password": "ContraseñaSegura123!"
}
```

#### `POST /api/auth/logout`

Logout seguro con limpieza de cookies y revocación de tokens.

#### `POST /api/auth/refresh`

Renovación automática de access token usando refresh token.

### Autenticación de Dos Factores

#### `POST /api/auth/2fa/setup`

Iniciar configuración 2FA. Retorna secreto y código QR.

#### `POST /api/auth/2fa/verify-setup`

Confirmar configuración 2FA con código del authenticator.

```json
{
  "token": "123456"
}
```

#### `POST /api/auth/2fa/verify`

Verificar código 2FA durante login.

```json
{
  "token": "123456"
}
```

#### `POST /api/auth/2fa/disable`

Deshabilitar 2FA (requiere autenticación).

#### `POST /api/auth/2fa/backup-codes`

Regenerar códigos de backup.

### Gestión de Usuario

#### `POST /api/auth/change-password`

Cambiar contraseña con validación de contraseña actual.

```json
{
  "currentPassword": "ContraseñaActual123!",
  "newPassword": "NuevaContraseña456!"
}
```

#### `GET /api/auth/profile`

Obtener perfil del usuario autenticado.

#### `GET /api/auth/sessions`

Listar sesiones activas del usuario.

## 🔧 Arquitectura de Seguridad

### Flujo de Autenticación

1. **Registro/Login**: Validación, hash de contraseña, creación de sesión
2. **Token Generation**: JWT access (15 min) + refresh (7 días) en cookies HttpOnly
3. **Session Fixation Prevention**: Regeneración de ID de sesión post-login
4. **2FA Check**: Verificación opcional de segundo factor
5. **Session Storage**: Almacenamiento en Redis con TTL

### Flujo de Autorización

1. **Cookie Extraction**: Lectura de tokens desde cookies HttpOnly
2. **Token Verification**: Validación de JWT access token
3. **Auto-refresh**: Renovación automática si el access token expiró
4. **User Context**: Inyección de datos de usuario en request
5. **Role Check**: Verificación de permisos basada en roles

### Almacenamiento Redis

```
# Usuarios (temporal - en producción usar DB)
user:{userId} -> JSON con datos de usuario
user:email:{email} -> userId para lookup

# Sesiones
facturacion_sess:{sessionId} -> Datos de sesión Express

# Refresh Tokens
refresh_token:{userId}:{tokenId} -> Metadata del token

# 2FA
2fa:{userId} -> Configuración 2FA permanente
2fa_setup:{userId} -> Setup temporal (10 min TTL)
```

## 🛡️ Medidas de Seguridad Implementadas

### Prevención XSS

- Cookies HttpOnly (no accesibles desde JS)
- Headers CSP con Helmet
- Sanitización de entrada

### Prevención CSRF

- Cookies SameSite=Strict
- Validación de origen
- Rate limiting por sesión

### Prevención Session Fixation

- Regeneración de session ID post-login
- Invalidación al cambio de contraseña
- TTL de sesiones

### Prevención Brute Force

- Rate limiting (5 intentos/15min por sesión)
- Bloqueo temporal por IP
- Logging de intentos sospechosos

### Protección de Datos

- Hash bcrypt con 12 salt rounds
- Secrets en variables de entorno
- Rotación automática de tokens

## 🔍 Monitoreo y Logging

### Eventos Loggeados

- Intentos de login (exitosos y fallidos)
- Cambios de contraseña
- Configuración/deshabilitación 2FA
- Tokens expirados o inválidos
- Intentos de acceso sospechosos

### Métricas Recomendadas

- Tiempo de respuesta de endpoints
- Tasa de éxito/fallo de autenticación
- Uso de códigos de backup 2FA
- Sesiones activas por usuario
- Rate limiting activations

## 🚨 Alertas de Seguridad

### Alertas Críticas

- Múltiples fallos de login desde la misma IP
- Uso de códigos de backup 2FA
- Cambios de contraseña sin verificación 2FA
- Tokens JWT inválidos o manipulados

### Alertas de Monitoreo

- Picos inusuales en registros
- Sesiones de larga duración
- Errores de conexión a Redis
- Rate limiting frecuente

## 📚 Referencias de Seguridad

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## 🔧 Desarrollo y Testing

### Comandos Disponibles

```bash
yarn dev          # Desarrollo con hot reload
yarn build        # Compilar TypeScript
yarn start        # Producción
yarn test         # Ejecutar tests
yarn type-check   # Verificar tipos TypeScript
yarn lint         # Linting con ESLint
```

### Testing de Seguridad

```bash
# Test de endpoints de autenticación
yarn test:auth

# Test de rate limiting
yarn test:rate-limit

# Test de 2FA
yarn test:2fa

# Test de seguridad general
yarn test:security
```
