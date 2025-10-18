# 🏗️ Diagrama de Arquitectura de Microservicios

## Flujo de Peticiones

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (Frontend)                          │
│                     (React + Vite @ 5173)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │ /api/auth/*
                          │ /api/invoices/*
                          │ /api/clients/*
                          │ /api/companies/*
                          │ /api/subscriptions/*
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Puerto 3000)                     │
│                   (http-proxy-middleware)                        │
│                                                                   │
│  ├─ /api/auth/* ──────────────► Auth Service (3003)             │
│  ├─ /api/subscriptions/* ─────► Subscription Service (3006)     │
│  ├─ /api/invoices/* ──────────► Invoice Service (3002)          │
│  ├─ /api/clients/* ───────────► Invoice Service (3002)          │
│  └─ /api/companies/* ─────────► Invoice Service (3002)          │
│                                                                   │
│  Middleware: helmet, CORS, compression, morgan, rate-limit      │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    PORT 3003            PORT 3006            PORT 3002
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────────┐   ┌─────────────────┐   ┌──────────────┐
    │   AUTH      │   │  SUBSCRIPTION   │   │   INVOICE    │
    │  SERVICE    │   │    SERVICE      │   │   SERVICE    │
    │             │   │                 │   │              │
    │ Endpoints:  │   │ Endpoints:      │   │ Endpoints:   │
    │ • register  │   │ • POST /        │   │ • GET /      │
    │ • login     │   │ • GET /:id      │   │ • POST /     │
    │ • refresh   │   │ • PUT /cancel   │   │ • GET /stats │
    │ • logout    │   │ • PUT /react.   │   │ • GET /:id   │
    │ • me        │   │ • GET /plans    │   │ • PUT /:id   │
    │ • forgot-pw │   │ • GET /user     │   │ • DELETE /:id│
    │ • reset-pw  │   │ • GET /methods  │   │ • GET /pdf   │
    │ • verify    │   │                 │   │ • GET /xml   │
    │             │   │ Webhooks:       │   │ • POST /send │
    │ State: ✅   │   │ • stripe        │   │              │
    │ 8/8 (100%)  │   │ • aeat          │   │ State: ⚠️    │
    │             │   │                 │   │ 8/9 (89%)    │
    └──────┬──────┘   │ State: ⚠️       │   │              │
           │          │ 5/9 (56%)       │   │              │
           │          │ 4 stubs         │   │ Clients:     │
           │          └────────┬────────┘   │ • GET /      │
           │                   │            │ • POST /     │
           │                   │            │ • GET /:id   │
           │                   │            │ • PUT /:id   │
           │                   │            │ • DELETE/:id │
           │                   │            │              │
           │                   │            │ State: ✅    │
           │                   │            │ 5/5 (100%)   │
           │                   │            │              │
           │                   │            │ Companies:   │
           │                   │            │ • GET /me    │
           │                   │            │ • POST /     │
           │                   │            │ • PUT /me    │
           │                   │            │              │
           │                   │            │ State: ✅    │
           │                   │            │ 3/3 (100%)   │
           │                   │            └──────────────┘
           │                   │
           ▼                   ▼
    ┌─────────────┐   ┌─────────────────┐
    │  PRISMA ORM │   │   DATABASE      │
    │  (Shared)   │   │  (PostgreSQL)   │
    │             │   │                 │
    │ • Users     │   │ 6 tablas        │
    │ • Invoices  │   │ (normalized)    │
    │ • Clients   │   │                 │
    │ • Companies │   │ Connection pool │
    │ • Subs      │   │                 │
    │ • Webhooks  │   │                 │
    └─────────────┘   └─────────────────┘
```

---

## 📊 Tabla de Path Rewriting

```
┌──────────────────────────────────────────────────────────────────┐
│                    PATH REWRITING EN GATEWAY                      │
├────────────────┬─────────────────┬─────────────────┬──────────────┤
│  Prefijo       │  Destino        │  Rewrite Rule   │  Resultado   │
├────────────────┼─────────────────┼─────────────────┼──────────────┤
│  /api/auth/*   │  localhost:3003 │  ^/auth → ""    │  /login      │
│  /api/subs/*   │  localhost:3006 │  ^/subs → ""    │  /plans      │
│  /api/inv/*    │  localhost:3002 │  ^/inv → /api   │  /api/inv/:id│
│  /api/cli/*    │  localhost:3002 │  ^/cli → /api   │  /api/clients│
│  /api/comp/*   │  localhost:3002 │  ^/comp → /api  │  /api/comp   │
└────────────────┴─────────────────┴─────────────────┴──────────────┘
```

---

## 🔄 Flujo de Autenticación

```
┌─────────────────────────────────────┐
│   Cliente intenta login             │
│  POST /api/auth/login               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Gateway recibe request            │
│   Proxy → Auth Service (3003)       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Auth Service procesa              │
│   • Valida credenciales             │
│   • Consulta BD (User)              │
│   • Genera JWT tokens               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Response al Cliente               │
│   {                                 │
│     accessToken: "jwt...",          │
│     refreshToken: "jwt..."          │
│   }                                 │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Cliente guarda tokens             │
│   • localStorage (accessToken)      │
│   • localStorage (refreshToken)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Peticiones futuras incluyen token │
│   Headers: {                        │
│     Authorization: "Bearer jwt..."  │
│   }                                 │
└─────────────────────────────────────┘
```

---

## 🧩 Estructura de Middleware por Servicio

```
┌─────────────────────────────────────────────┐
│        AUTH SERVICE MIDDLEWARE              │
├─────────────────────────────────────────────┤
│                                             │
│  POST /register                             │
│  ├─ idempotencyMiddleware                  │
│  ├─ validateBody                           │
│  └─ AuthController.register()              │
│                                             │
│  POST /login                                │
│  ├─ validateBody                           │
│  └─ AuthController.login()                 │
│                                             │
│  GET /me                                    │
│  ├─ authenticateToken (BD lookup)          │
│  └─ AuthController.me()                    │
│                                             │
└─────────────────────────────────────────────┘


┌─────────────────────────────────────────────┐
│      INVOICE SERVICE MIDDLEWARE             │
├─────────────────────────────────────────────┤
│                                             │
│  POST /invoices                             │
│  ├─ idempotencyMiddleware                  │
│  └─ InvoiceController.create()             │
│                                             │
│  GET /invoices/:id                         │
│  ├─ authenticateToken (JWT only)          │
│  └─ InvoiceController.getById()            │
│                                             │
│  PUT /invoices/:id                         │
│  ├─ idempotencyMiddleware                  │
│  └─ InvoiceController.update()             │
│                                             │
└─────────────────────────────────────────────┘


┌─────────────────────────────────────────────┐
│    SUBSCRIPTION SERVICE MIDDLEWARE          │
├─────────────────────────────────────────────┤
│                                             │
│  POST /subscriptions                        │
│  ├─ idempotencyMiddleware                  │
│  └─ SubscriptionController.create()        │
│                                             │
│  PUT /:id/cancel                            │
│  └─ SubscriptionController.cancel()        │
│                                             │
│  PUT /:id/reactivate ✅ VERIFIED           │
│  └─ SubscriptionController.reactivate()    │
│  [Stub eliminado, controlador único]       │
│                                             │
│  GET /:id (⚠️ PENDING)                     │
│  GET /plans (⚠️ PENDING)                   │
│  GET /user (⚠️ PENDING)                    │
│  GET /:id/payment-methods (⚠️ PENDING)     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📈 Cobertura de Endpoints

```
TOTAL: 34 endpoints | Implementados: 29 | Pendientes: 5

Auth Service       ████████████████ 100% (8/8)
Invoice Invoices   ████████████████░ 89% (8/9)    [PDF pendiente]
Invoice Clients    ████████████████ 100% (5/5)
Invoice Companies  ████████████████ 100% (3/3)
Subscription Subs  ████████░░░░░░░░ 43% (3/7)    [4 stubs]
Subscription Web   ████████████████ 100% (2/2)

Global Coverage:   ████████████████░ 85% (29/34)
```

---

## 🔐 Estado de Seguridad por Servicio

```
┌─────────────────────────────────────────────────────────────┐
│              MATRIZ DE SEGURIDAD                            │
├──────────────────┬────────────────┬────────────────┬────────┤
│  Servicio        │ JWT Validation │ DB Lookup      │ Cookies│
├──────────────────┼────────────────┼────────────────┼────────┤
│ Auth Service     │ ✅ Sí          │ ✅ Sí          │ ✅ Sí  │
│ Invoice Service  │ ✅ Sí          │ ❌ No          │ ✅ Sí  │
│ Subscription Svc │ ⚠️ Parcial     │ ❌ No          │ ❌ No  │
├──────────────────┼────────────────┼────────────────┼────────┤
│ Inconsistencia   │ BAJA           │ MEDIA          │ MEDIA  │
│ Risk Level       │ 🟢 LOW         │ 🟡 MEDIUM      │ 🟡 MED │
└──────────────────┴────────────────┴────────────────┴────────┘

⚠️ Recomendación: Estandarizar middleware compartido
   (Ver MIDDLEWARE_STANDARDIZATION.md)
```

---

**Generado:** 17 de octubre de 2025
