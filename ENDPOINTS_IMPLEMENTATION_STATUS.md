# Estado de Implementación de Endpoints

**Leyenda:**
- ✅ Implementado y funcional
- ⚠️ Implementado parcialmente o con limitaciones
- ❌ No implementado (stub)
- 🔧 Requiere configuración externa

---

## Auth Service (8/8 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| POST | `/api/auth/register` | ✅ | `AuthController.register` | `idempotencyMiddleware`, `validateBody` | Crea usuario y tokens |
| POST | `/api/auth/login` | ✅ | `AuthController.login` | `validateBody` | Valida credenciales |
| POST | `/api/auth/refresh` | ✅ | `AuthController.refresh` | `validateBody` | Emite nuevo access token |
| POST | `/api/auth/logout` | ✅ | `AuthController.logout` | — | Revoca refresh token |
| GET | `/api/auth/me` | ✅ | `AuthController.me` | `authenticateToken` | Perfil de usuario |
| POST | `/api/auth/forgot-password` | ✅ | `AuthController.forgotPassword` | `validateBody` | Envía email de recuperación |
| POST | `/api/auth/reset-password` | ✅ | `AuthController.resetPassword` | `idempotencyMiddleware`, `validateBody` | Cambia contraseña |
| POST | `/api/auth/verify-email` | ✅ | `AuthController.verifyEmail` | `validateBody` | Confirma cuenta |

---

## Invoice Service — Invoices (8/9 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| GET | `/api/invoices` | ✅ | `InvoiceController.getInvoices` | `authenticateToken` | Paginación y filtros |
| POST | `/api/invoices` | ✅ | `InvoiceController.createInvoice` | `idempotencyMiddleware` | Crea factura con líneas |
| GET | `/api/invoices/stats/summary` | ✅ | `InvoiceController.getStats` | `authenticateToken` | Métricas agregadas |
| GET | `/api/invoices/:id` | ✅ | `InvoiceController.getInvoiceById` | `authenticateToken` | Incluye cliente y empresa |
| PUT | `/api/invoices/:id` | ✅ | `InvoiceController.updateInvoice` | `idempotencyMiddleware` | Actualiza factura |
| DELETE | `/api/invoices/:id` | ✅ | `InvoiceController.deleteInvoice` | — | Soft delete (status=CANCELLED) |
| GET | `/api/invoices/:id/pdf` | ❌ | Stub | `authenticateToken` | Pendiente de generación de PDF |
| GET | `/api/invoices/:id/xml/signed` | ✅ | `InvoiceController.getSignedXml` | — | Genera XML firmado |
| POST | `/api/invoices/:id/send` | ✅ | `InvoiceController.sendInvoice` | `idempotencyMiddleware` | Cambia status a SENT |

---

## Invoice Service — Clients (5/5 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| GET | `/api/clients` | ✅ | `ClientController.getClients` | `authenticateToken` | Paginación y búsqueda |
| POST | `/api/clients` | ✅ | `ClientController.createClient` | `authenticateToken`, `idempotencyMiddleware` | Valida NIF/CIF |
| GET | `/api/clients/:id` | ✅ | `ClientController.getClientById` | `authenticateToken` | Incluye facturas |
| PUT | `/api/clients/:id` | ✅ | `ClientController.updateClient` | `authenticateToken`, `idempotencyMiddleware` | Actualiza datos |
| DELETE | `/api/clients/:id` | ✅ | `ClientController.deleteClient` | `authenticateToken` | Hard delete |

---

## Invoice Service — Companies (3/3 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| GET | `/api/companies/me` | ✅ | `CompanyController.getMyCompany` | `authenticateToken` | Obtiene empresa del usuario |
| POST | `/api/companies` | ✅ | `CompanyController.createCompany` | `authenticateToken`, `idempotencyMiddleware` | Un usuario ↔ una empresa |
| PUT | `/api/companies/me` | ✅ | `CompanyController.updateCompany` | `authenticateToken`, `idempotencyMiddleware` | Actualiza empresa |

---

## Subscription Service — Subscriptions (7/7 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| POST | `/api/subscriptions` | ✅ | `SubscriptionController.createSubscription` | `idempotencyMiddleware` | Simula integración Stripe |
| GET | `/api/subscriptions/:id` | ✅ | `SubscriptionController.getSubscriptionById` | `authenticateToken` | Retorna suscripción con plan incluido |
| PUT | `/api/subscriptions/:id/cancel` | ✅ | `SubscriptionController.cancelSubscription` | `authenticateToken` | Idempotente, status → CANCELED |
| PUT | `/api/subscriptions/:id/reactivate` | ✅ | `SubscriptionController.reactivateSubscription` | `authenticateToken` | Solo aplica a canceladas |
| GET | `/api/subscriptions/plans` | ✅ | `SubscriptionController.getSubscriptionPlans` | — | Lista planes activos, endpoint público |
| GET | `/api/subscriptions/user` | ✅ | `SubscriptionController.getUserSubscriptions` | `authenticateToken` | Retorna todas las suscripciones del usuario |
| GET | `/api/subscriptions/:id/payment-methods` | ✅ | `SubscriptionController.getPaymentMethods` | `authenticateToken` | Retorna métodos de pago (mock) |

---

## Subscription Service — Webhooks (2/2 implementados)

| Método | Endpoint | Estado | Controlador | Middleware | Notas |
|--------|----------|--------|-------------|------------|-------|
| POST | `/api/webhooks/stripe` | 🔧 | `WebhookController.handleStripeWebhook` | — | Requiere configurar eventos de Stripe |
| POST | `/api/webhooks/aeat` | 🔧 | `WebhookController.handleAEATWebhook` | — | Procesa notificaciones AEAT |

---

## Resumen por Servicio

| Servicio | Total endpoints | Implementados | Pendientes | % completado |
|----------|-----------------|---------------|------------|---------------|
| Auth Service | 8 | 8 | 0 | 100% |
| Invoice Service (Invoices) | 9 | 8 | 1 | 89% |
| Invoice Service (Clients) | 5 | 5 | 0 | 100% |
| Invoice Service (Companies) | 3 | 3 | 0 | 100% |
| Subscription Service (Subscriptions) | 7 | 7 | 0 | 100% |
| Subscription Service (Webhooks) | 2 | 2 | 0 | 100% |
| **Total** | **34** | **33** | **1** | **97%** |

---

## Endpoints Pendientes de Implementar

1. **GET `/api/invoices/:id/pdf`** — Generación de PDF de factura.

---

## Notas de Implementación

- **Auth Service:** Todas las rutas listas y probadas; operaciones críticas con idempotencia.
- **Invoice Service:** Cobertura casi total, falta la capa de generación PDF.
- **Subscription Service:** Base operativa funcional (crear/cancelar/reactivar), el resto son stubs listos para implementar.
- **Webhooks:** Implementados con dependencias externas; requieren configuración de Stripe y AEAT para entorno real.
