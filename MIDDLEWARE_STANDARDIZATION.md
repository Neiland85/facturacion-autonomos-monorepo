# Estandarización de Middleware de Autenticación

## 1. Análisis de Inconsistencias Actuales

### 1.1 Auth Service (`apps/auth-service/src/middleware/auth.middleware.ts`)
- Define `AuthenticatedRequest` con campos `userId: string` y `email: string`.
- Utiliza `AuthService.verifyAccessToken()` para validar JWT.
- Realiza consulta a base de datos mediante `AuthService.findUserById()` para asegurar que el usuario exista y esté activo.
- Verifica estado del usuario y lanza error si está deshabilitado.
- Middleware orientado a endpoints que requieren confianza máxima.

### 1.2 Invoice Service (`apps/invoice-service/src/middleware/auth.middleware.ts`)
- Define `AuthenticatedRequest` con `id: string`, `email: string`, `role: string`, `sessionId?: string`.
- Valida el JWT directamente con `jwt.verify()` sin consultar la base de datos.
- Acepta token desde `Authorization` header o cookie `accessToken`.
- Verifica que el `role` esté incluido en `['user', 'admin', 'premium']`.
- Está optimizado para bajo acoplamiento con Auth Service, pero pierde consistencia de datos.

### 1.3 Subscription Service
- No dispone de middleware dedicado.
- Los controladores acceden a `req.user?.userId` esperando que el gateway o el cliente rellene el campo.
- No hay validación de JWT ni consulta de base de datos en el servicio.

## 2. Problemas Identificados

1. **Estructura de usuario inconsistente:** `userId` vs `id`, presencia opcional de `role` y `sessionId`.
2. **Niveles de validación diferentes:** Auth Service verifica contra base de datos, Invoice Service no.
3. **Falta de autenticación en Subscription Service:** no existe middleware que garantice la integridad del usuario.
4. **Duplicación de lógica JWT:** lógica similar repetida en múltiples archivos.
5. **Manejo desigual de cookies:** solo Invoice Service contempla tokens via cookies.

## 3. Propuesta de Estandarización

### 3.1 Middleware compartido
- Crear un paquete compartido, por ejemplo `packages/validation/src/middleware/auth.middleware.ts`.
- Definir una interfaz unificada `AuthenticatedRequest` con propiedades:
  ```ts
  interface AuthenticatedUserPayload {
    id: string;
    email: string;
    role: string;
    sessionId?: string;
  }
  ```
- Exponer dos variantes de middleware:
  - `authenticateToken`: validación de JWT ligera (solo firma y expiración).
  - `authenticateTokenWithDB`: validación completa, incluyendo consulta a la base de datos mediante un `UserService` compartido.
- Incluir soporte para extracción de tokens desde header `Authorization` y cookies.

### 3.2 Migración por servicio
- **Auth Service:** Utilizar `authenticateTokenWithDB` en endpoints que necesitan estado actualizado del usuario (`/me`, `/logout`).
- **Invoice Service:** Sustituir su middleware por `authenticateToken` para mantener bajo acoplamiento y añadir consulta opcional si se requiere.
- **Subscription Service:** Incorporar `authenticateToken` en todas las rutas protegidas, con posibilidad de migrar a la variante con base de datos cuando el dominio lo exija.

### 3.3 Configuración JWT unificada
- Estandarizar variables de entorno (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`).
- Alinear algoritmos (HS256) y tiempos de expiración.
- Definir payload JWT consistente con los campos de `AuthenticatedUserPayload`.

## 4. Plan de Implementación

1. Crear el paquete compartido y exportar las funciones de middleware.
2. Actualizar Auth Service para emitir tokens con la estructura unificada y adoptar el middleware compartido.
3. Migrar Invoice Service al middleware compartido, eliminando lógica duplicada.
4. Agregar middleware de autenticación al Subscription Service.
5. Ajustar pruebas unitarias e integración para reflejar la nueva estructura de payload.
6. Documentar el flujo en los README de cada servicio y en documentación general.

## 5. Consideraciones de Seguridad

- Validar expiración de tokens y manejar errores explícitos (`TokenExpiredError`).
- Gestionar refresh tokens con revocación controlada y almacenamiento seguro.
- Aplicar rate limiting por usuario autenticado para mitigar abuso.
- Registrar intents de autenticación fallidos y analizar patrones sospechosos.
- Planificar rotación periódica de secretos JWT con mecanismos de doble firma durante la transición.
