# Auditoría de Rutas y Endpoints

## 1. Resumen Ejecutivo

| Componente | Puerto | Rutas base | Endpoints totales | Implementados | Pendientes |
|------------|--------|------------|-------------------|---------------|------------|
| API Gateway | 3000 | `/api/*` (proxy) | 5 | 5 | 0 |
| Auth Service | 3003 | `/api/auth/*` | 8 | 8 | 0 |
| Invoice Service | 3002 | `/api/invoices/*`, `/api/clients/*`, `/api/companies/*` | 19 | 18 | 1 |
| Subscription Service | 3006 | `/api/subscriptions/*`, `/api/webhooks/*` | 9 | 5 | 4 |

**Totales:** 41 endpoints identificados, 33 implementados, 8 pendientes. La arquitectura se compone de tres microservicios backend (Auth, Invoice, Subscription) detrás de un API Gateway.

## 2. API Gateway (puerto 3000)

- Archivo: `apps/api-gateway/src/routes/gateway.routes.ts`
- El gateway usa `http-proxy-middleware` para enrutar peticiones recibidas en `/api/*` hacia los servicios internos.
- Para cada servicio se define:
  - `prefix`: prefijo a interceptar.
  - `targetEnvVar`: variable de entorno con la URL del servicio.
  - `fallbackUrl`: URL por defecto.
  - `serviceLabel` y `errorMessage` para logging y respuestas 502.
  - `pathRewrite`: comportamiento específico por ruta.
- Configuración global: `changeOrigin: true`, `preserveHeaderKeyCase: true`, manejo de errores con respuesta 502 y logging.

| Ruta Gateway | Servicio destino | Path reescrito | Variable de entorno | URL fallback |
|--------------|------------------|----------------|---------------------|--------------|
| `/api/auth/*` | Auth Service | `^/auth` → `` | `AUTH_SERVICE_URL` | `http://localhost:3003` |
| `/api/subscriptions/*` | Subscription Service | `^/subscriptions` → `` | `SUBSCRIPTION_SERVICE_URL` | `http://localhost:3006` |
| `/api/invoices/*` | Invoice Service | `^/invoices` → `/api/invoices` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |
| `/api/clients/*` | Invoice Service | `^/clients` → `/api/clients` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |
| `/api/companies/*` | Invoice Service | `^/companies` → `/api/companies` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |

## 3. Auth Service (puerto 3003)

- Archivo de rutas: `apps/auth-service/src/routes/auth.routes.ts`
- Middleware disponibles: `authenticateToken`, `requireEmailVerification`, `idempotencyMiddleware`, `validateBody`.
- Todos los endpoints están implementados en `AuthController`.

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| POST | `/api/auth/register` | `idempotencyMiddleware`, `validateBody` | Implementado |
| POST | `/api/auth/login` | `validateBody` | Implementado |
| POST | `/api/auth/refresh` | `validateBody` | Implementado |
| POST | `/api/auth/logout` | — | Implementado |
| GET | `/api/auth/me` | `authenticateToken` | Implementado |
| POST | `/api/auth/forgot-password` | `validateBody` | Implementado |
| POST | `/api/auth/reset-password` | `idempotencyMiddleware`, `validateBody` | Implementado |
| POST | `/api/auth/verify-email` | `validateBody` | Implementado |

## 4. Invoice Service (puerto 3002)

### 4.1 Invoice Routes (`apps/invoice-service/src/routes/invoice.routes.ts`)

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| GET | `/api/invoices` | `authenticateToken` | Implementado |
| POST | `/api/invoices` | `idempotencyMiddleware` | Implementado |
| GET | `/api/invoices/stats/summary` | `authenticateToken` | Implementado |
| GET | `/api/invoices/:id` | `authenticateToken` | Implementado |
| PUT | `/api/invoices/:id` | `idempotencyMiddleware` | Implementado |
| DELETE | `/api/invoices/:id` | — | Implementado |
| GET | `/api/invoices/:id/pdf` | `authenticateToken` | Pendiente (stub) |
| GET | `/api/invoices/:id/xml/signed` | — | Implementado |
| POST | `/api/invoices/:id/send` | `idempotencyMiddleware` | Implementado |

### 4.2 Client Routes (`apps/invoice-service/src/routes/client.routes.ts`)

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| GET | `/api/clients` | `authenticateToken` | Implementado |
| POST | `/api/clients` | `authenticateToken`, `idempotencyMiddleware` | Implementado |
| GET | `/api/clients/:id` | `authenticateToken` | Implementado |
| PUT | `/api/clients/:id` | `authenticateToken`, `idempotencyMiddleware` | Implementado |
| DELETE | `/api/clients/:id` | `authenticateToken` | Implementado |

### 4.3 Company Routes (`apps/invoice-service/src/routes/company.routes.ts`)

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| GET | `/api/companies/me` | `authenticateToken` | Implementado |
| POST | `/api/companies` | `authenticateToken`, `idempotencyMiddleware` | Implementado |
| PUT | `/api/companies/me` | `authenticateToken`, `idempotencyMiddleware` | Implementado |

### Middleware

- `authenticateToken` presente en operaciones sensibles.
- `idempotencyMiddleware` aplicado en POST/PUT.
- Único endpoint pendiente: generación de PDF.

## 5. Subscription Service (puerto 3006)

### 5.1 Subscription Routes (`apps/subscription-service/src/routes/subscription.routes.ts`)

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| POST | `/api/subscriptions` | `idempotencyMiddleware` | Implementado |
| GET | `/api/subscriptions/:id` | — | Pendiente (stub) |
| PUT | `/api/subscriptions/:id/cancel` | — | Implementado |
| PUT | `/api/subscriptions/:id/reactivate` | — | Implementado (ruta duplicada detectada) |
| GET | `/api/subscriptions/plans` | — | Pendiente (stub) |
| GET | `/api/subscriptions/user` | — | Pendiente (stub) |
| GET | `/api/subscriptions/:id/payment-methods` | — | Pendiente (stub) |

### 5.2 Webhook Routes (`apps/subscription-service/src/routes/webhook.routes.ts`)

| Método | Ruta | Middleware | Estado |
|--------|------|------------|--------|
| POST | `/api/webhooks/stripe` | — | Implementado |
| POST | `/api/webhooks/aeat` | — | Implementado |

## 6. Análisis de Middleware

### 6.1 Inconsistencias de autenticación

- Auth Service emplea `AuthenticatedRequest` con `userId` y `email`; valida contra la base de datos.
- Invoice Service define `AuthenticatedRequest` con `id`, `email`, `role`, `sessionId?`; valida solo JWT.
- Subscription Service no cuenta con middleware propio; accede a `req.user` si existe.

### 6.2 Idempotency Middleware

- Presente en Auth e Invoice Services en operaciones POST/PUT.
- Implementado localmente en cada servicio, lógica redundante.

## 7. Problemas Identificados

1. **Ruta duplicada:** `PUT /api/subscriptions/:id/reactivate` se define dos veces (stub y control con controlador real).
2. **Endpoint pendiente:** `GET /api/invoices/:id/pdf` responde mensaje provisional.
3. **Suscripción incompleta:** cuatro endpoints de Subscription Service permanecen como stubs.
4. **Inconsistencia de `AuthenticatedRequest`:** estructura distinta entre servicios.
5. **Path rewriting complejo:** el gateway reescribe rutas (`/invoices` → `/api/invoices`), requiere documentación clara.
6. **Coordinación de puertos:** confirmar configuración en `.env.example` para evitar conflictos.

## 8. Patrones de Rutas

- Prefijo `/api/` consistente en todos los servicios.
- Documentación Swagger/OpenAPI integrada en cada archivo de rutas.
- Diseño RESTful con nouns y verbos HTTP estándar.
- Rate limiting aplicado en cada servicio mediante `express-rate-limit`.

## 9. Recomendaciones

1. Eliminar la ruta duplicada en `subscription.routes.ts` para evitar comportamientos impredecibles.
2. Completar los endpoints pendientes o documentar explícitamente su estado fuera de alcance.
3. Estandarizar `AuthenticatedRequest` y compartir middleware en `packages/`.
4. Documentar detalladamente el path rewriting del API Gateway para equipos de frontend/back.
5. Consolidar un middleware de autenticación compartido para reducir duplicación.
6. Verificar y documentar los puertos oficiales en `.env.example` y README.
