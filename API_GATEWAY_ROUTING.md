# Documentación de Enrutamiento del API Gateway

## 1. Arquitectura de Proxy

El API Gateway (`apps/api-gateway/src/routes/gateway.routes.ts`) utiliza `http-proxy-middleware` para dirigir peticiones entrantes hacia los microservicios internos. Cada servicio se configura a través de la función `createServiceProxy`, que establece:

- `prefix`: prefijo del path a interceptar.
- `targetEnvVar`: variable de entorno que contiene la URL del servicio.
- `fallbackUrl`: URL base utilizada si la variable de entorno no está definida.
- `serviceLabel`: etiqueta para logs y métricas.
- `errorMessage`: respuesta enviada al cliente cuando el servicio destino no está disponible.
- `pathRewrite`: reglas de reescritura de path específicas para el servicio.

La aplicación principal (`apps/api-gateway/src/index.ts`) monta estas rutas bajo el prefijo `/api` y aplica middleware global de seguridad, CORS, logging y rate limiting.

## 2. Configuración de Servicios

| Ruta Gateway | Servicio destino | Puerto destino | Path Rewrite | Variable de entorno | Fallback |
|--------------|------------------|----------------|--------------|---------------------|----------|
| `/api/auth/*` | Auth Service | 3003 | `^/auth` → `` | `AUTH_SERVICE_URL` | `http://localhost:3003` |
| `/api/subscriptions/*` | Subscription Service | 3006 | `^/subscriptions` → `` | `SUBSCRIPTION_SERVICE_URL` | `http://localhost:3006` |
| `/api/invoices/*` | Invoice Service | 3002 | `^/invoices` → `/api/invoices` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |
| `/api/clients/*` | Invoice Service | 3002 | `^/clients` → `/api/clients` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |
| `/api/companies/*` | Invoice Service | 3002 | `^/companies` → `/api/companies` | `INVOICE_SERVICE_URL` | `http://localhost:3002` |

## 3. Función `createServiceProxy`

```ts
const createServiceProxy = ({
  prefix,
  targetEnvVar,
  fallbackUrl,
  serviceLabel,
  errorMessage,
  pathRewrite,
}: ProxyConfig) => {
  const target = process.env[targetEnvVar] || fallbackUrl;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    pathRewrite: pathRewrite ?? { [`^/${prefix}`]: "" },
    on: {
      proxyReq: (_proxyReq, req) => {
        console.log(`[Gateway] Proxying ${req.method} ${req.path} to ${serviceLabel}`);
      },
      error: (err, req, res) => {
        console.error(`[Gateway] ${serviceLabel} proxy error:`, err);
        // Manejo de sockets y respuesta 502
      },
    },
  });
};
```

Esta función garantiza logging por cada petición proxyeada y maneja errores devolviendo un `502 Bad Gateway` con un mensaje específico por servicio.

## 4. Path Rewriting Explicado

### 4.1 Auth Service
- **Petición cliente:** `GET /api/auth/login`
- **Interceptación:** prefijo `/auth/*`
- **Reescritura:** `^/auth` → `` (elimina `/auth`)
- **Servicio recibe:** `GET /login`
- **Nota:** El Auth Service expone rutas montadas bajo `/api/auth` en su `index.ts`. Requiere ajuste futuro o documentación clara para alinear paths.

### 4.2 Subscription Service
- **Petición cliente:** `GET /api/subscriptions/plans`
- **Interceptación:** prefijo `/subscriptions/*`
- **Reescritura:** `^/subscriptions` → ``
- **Servicio recibe:** `GET /plans`
- **Nota:** Al igual que Auth, las rutas internas están bajo `/api/subscriptions`. Se recomienda revisar esta diferencia para evitar confusiones.

### 4.3 Invoice Service
- **Petición cliente:** `GET /api/invoices/123`
- **Reescritura:** `^/invoices` → `/api/invoices`
- **Servicio recibe:** `GET /api/invoices/123`
- **Resultado:** Coincide exactamente con las rutas del servicio, evitando desajustes.

### 4.4 Clients y Companies
- Se aplica la misma lógica que en invoices, reescribiendo a `/api/clients` y `/api/companies` respectivamente para que coincidan con el montaje interno en `index.ts` del Invoice Service.

## 5. Configuración de Variables de Entorno

En el archivo `.env.example` deben declararse:

```
AUTH_SERVICE_URL=http://localhost:3003
SUBSCRIPTION_SERVICE_URL=http://localhost:3006
INVOICE_SERVICE_URL=http://localhost:3002
```

Si las variables no están definidas, el gateway utiliza los `fallbackUrl` establecidos previamente.

## 6. Manejo de Errores

- Se loguea cualquier error de proxy con el nombre del servicio afectado.
- Si la respuesta ya envió headers, se aborta sin modificar el flujo.
- Para conexiones tipo `Socket`, se llama `destroy()` y se corta la conexión.
- Para el resto, se devuelve un JSON con `{ success: false, message: errorMessage }` y código `502`.

## 7. Headers y Opciones Adicionales

- `changeOrigin: true`: ajusta el header `Origin` a la URL destino.
- `preserveHeaderKeyCase: true`: mantiene la capitalización original de los headers.
- Se utiliza `express.json` y `express.urlencoded` para parsear payloads antes del proxy.
- Rate limiting global: 100 peticiones cada 15 minutos.

## 8. Problemas y Recomendaciones

1. Verificar y documentar claramente la reescritura de paths para Auth y Subscription Services, que actualmente reciben paths sin el prefijo `/api`.
2. Elaborar una tabla de rutas "end-to-end" para equipos de frontend (cliente → gateway → servicio).
3. Agregar health checks específicos del gateway para cada servicio destino.
4. Configurar timeouts en el proxy para evitar conexiones colgadas.
5. Considerar un patrón de circuit breaker para tolerancia a fallos.
6. Añadir inyección de `X-Request-ID` para trazabilidad en logs.

## 9. Testing del Gateway

```bash
# Auth Service
curl http://localhost:3001/api/auth/health

# Invoice Service
curl http://localhost:3001/api/invoices

# Subscription Service
curl http://localhost:3001/api/subscriptions/plans
```

Estos comandos permiten validar rápidamente la conectividad y las reglas de reescritura configuradas.
