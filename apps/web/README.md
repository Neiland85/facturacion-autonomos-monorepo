<div align="center"><div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" /><img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

</div></div>

# Run and deploy your AI Studio app# Run and deploy your AI Studio app

This contains everything you need to run your app locally.This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ezTwApsNa01mmPuSaom1X7-gL50s10OMView your app in AI Studio: https://ai.studio/apps/drive/1ezTwApsNa01mmPuSaom1X7-gL50s10OM

## Run Locally## Run Locally

**Prerequisites:** Node.js**Prerequisites:** Node.js

1. Install dependencies:1. Install dependencies:

   `npm install` `npm install`

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Set the `VITE_API_BASE_URL` in [.env.local](.env.local) to your API Gateway URL (default: `http://localhost:3000/api`)3. Set the `VITE_API_BASE_URL` in [.env.local](.env.local) to your API Gateway URL (default: `http://localhost:3000/api`)

4. Run the app:4. Run the app:

   `npm run dev` `npm run dev`

## Environment Variables## Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key for AI features- `GEMINI_API_KEY`: Your Gemini API key for AI features

- `VITE_API_BASE_URL`: Base URL for the API Gateway (default: `http://localhost:3000/api`)- `VITE_API_BASE_URL`: Base URL for the API Gateway (default: `http://localhost:3000/api`)

- `VITE_ENABLE_MOCK_DATA`: Set to `true` to use mock data instead of real API calls (default: `false`)- `VITE_ENABLE_MOCK_DATA`: Set to `true` to use mock data instead of real API calls (default: `false`)

## Autenticación

### Arquitectura

El sistema de autenticación usa cookies httpOnly para máxima seguridad:

- **Access Token**: Cookie httpOnly con TTL de 15 minutos
- **Refresh Token**: Cookie httpOnly con TTL de 7-30 días
- **Backend**: Auth service en puerto 3001, accesible vía API Gateway (puerto 3000)
- **Frontend**: Next.js App Router con middleware para protección de rutas

### Flujo de Login

1. Usuario envía credenciales a `POST /api/auth/login`
2. Backend valida y retorna cookies httpOnly automáticamente
3. Navegador almacena cookies automáticamente
4. Requests subsecuentes incluyen cookies automáticamente con `credentials: 'include'`
5. Si access token expira, el backend usa refresh token para renovarlo

### Flujo de Registro

1. Usuario envía datos a `POST /api/auth/register`
2. Backend crea usuario y establece sesión automáticamente
3. Usuario es redirigido al dashboard sin necesidad de login adicional

### Protección de Rutas

- **Middleware**: `src/middleware.ts` verifica cookies y redirige a `/login` si no autenticado
- **Hook**: `useAuth()` provee estado de autenticación en componentes cliente
- **Server Components**: Verifican auth con `authService.getCurrentUser()` antes de renderizar

### Desarrollo Local

1. Iniciar auth-service: `cd apps/auth-service && npm run dev` (puerto 3001)
2. Iniciar API gateway: `cd apps/api-gateway && npm run dev` (puerto 3000)
3. Iniciar frontend: `cd apps/web && npm run dev` (puerto 3001)
4. Acceder a http://localhost:3001/login

### Seguridad

- ✅ Cookies httpOnly (inmunes a XSS)
- ✅ SameSite=strict (protección CSRF)
- ✅ Secure en producción (solo HTTPS)
- ✅ Rate limiting en backend
- ✅ Soporte para 2FA (opcional)

### Troubleshooting

**Problema**: Cookies no se establecen

- Verificar que API Gateway preserve headers `Set-Cookie`
- Verificar CORS con `credentials: true`
- Verificar que `NEXT_PUBLIC_API_BASE_URL` apunte al gateway

**Problema**: Redirect loop en login

- Verificar que middleware detecte cookies correctamente
- Verificar que auth-service esté corriendo

**Problema**: 401 en requests autenticados

- Verificar que `credentials: 'include'` esté configurado en `api-client.ts`
- Verificar que cookies no hayan expirado

## 🚨 Manejo de Errores

### Sistema de Toasts

La aplicación usa [Sonner](https://sonner.emilkowalski.com/) para notificaciones toast.

**Uso básico:**

```typescript
import { toast } from 'sonner';

toast.success('Factura creada exitosamente');
toast.error('Error al guardar');
toast.warning('Campos incompletos');
toast.info('Procesando...');
```

### Hook useErrorHandler

Hook centralizado para manejo de errores con toasts automáticos y redirección.

**Uso en componentes:**

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError, showSuccess } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await someApiCall();
      showSuccess('Operación exitosa');
    } catch (error) {
      handleError(error, 'Error al procesar');
    }
  };
}
```

**Funciones disponibles:**

- `handleError(error, context?)`: Maneja cualquier error con toast apropiado
- `handleAuthError()`: Maneja errores 401 con redirección a login
- `showError(message)`: Muestra toast de error manual
- `showSuccess(message)`: Muestra toast de éxito
- `showWarning(message)`: Muestra toast de advertencia

**Comportamiento automático:**

- Errores 401: Redirige a `/login` con prevención de loops
- Errores 403: Toast "No tienes permisos para realizar esta acción"
- Errores 404: Toast "Recurso no encontrado"
- Errores 422/400: Toast con detalles de validación si existen
- Errores 500+: Toast "Error del servidor. Intenta de nuevo más tarde"
- Errores de red: Toast "Error de conexión. Verifica tu internet"

### Error Boundaries

La aplicación tiene error boundaries en dos niveles:

**1. Error de ruta (`app/error.tsx`):**

- Captura errores en páginas individuales
- Muestra UI de error con botón "Intentar de nuevo"
- No afecta otras rutas

**2. Error global (`app/global-error.tsx`):**

- Captura errores en el root layout
- Red de seguridad final
- Solo se activa en producción

**Componente ErrorFallback:**
Componente reutilizable para mostrar errores de forma consistente.

```typescript
import { ErrorFallback } from '@/components/error/ErrorFallback';

<ErrorFallback
  error={error}
  reset={reset}
  title="Error personalizado"
  description="Descripción del error"
/>
```

### Clase ApiError

Todos los errores HTTP lanzan `ApiError` con metadata:

```typescript
try {
  await apiClient.get('/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.statusCode); // 404, 500, etc.
    console.log(error.code); // 'NOT_FOUND', 'VALIDATION_ERROR', etc.
    console.log(error.details); // Detalles adicionales del backend
  }
}
```

**Métodos helper:**

- `error.isAuthError()`: true si es 401
- `error.isForbiddenError()`: true si es 403
- `error.isNotFoundError()`: true si es 404
- `error.isServerError()`: true si es 500+
- `error.isClientError()`: true si es 400-499

### Mejores Prácticas

1. **Usar el hook en componentes:**

   ```typescript
   const { handleError } = useErrorHandler();
   try { ... } catch (error) { handleError(error); }
   ```

2. **Agregar contexto a errores:**

   ```typescript
   handleError(error, 'Error al crear factura');
   ```

3. **No capturar errores de autenticación manualmente:**
   El hook ya redirige a login automáticamente en errores 401.

4. **Usar toasts para feedback:**

   ```typescript
   showSuccess('Factura guardada');
   showWarning('Campos incompletos');
   ```

5. **Dejar que error boundaries capturen errores no manejados:**
   No es necesario try-catch en todo. Los error boundaries son la red de seguridad.

### Integración con Servicios de Logging

Para integrar con Sentry, LogRocket, etc.:

1. Agregar en `app/error.tsx` y `app/global-error.tsx`:

   ```typescript
   useEffect(() => {
     Sentry.captureException(error);
   }, [error]);
   ```

2. Agregar en `useErrorHandler`:
   ```typescript
   const handleError = error => {
     Sentry.captureException(error);
     // ... resto de la lógica
   };
   ```

## 💳 Servicios de Suscripción

### Arquitectura Consolidada

Los servicios de suscripción siguen el patrón establecido de singleton con ApiClient centralizado.

**Servicio principal:** `subscriptionService` (singleton)

```typescript
import { subscriptionService } from '@/services/subscription.service';

// Obtener planes disponibles
const plans = await subscriptionService.getSubscriptionPlans();

// Obtener suscripción actual del usuario
const subscription = await subscriptionService.getUserSubscription();

// Crear nueva suscripción (con idempotency automática)
const newSubscription = await subscriptionService.createSubscription({
  planId: 'plan_123',
});

// Cancelar suscripción
await subscriptionService.cancelSubscription(subscriptionId, {
  immediate: false, // Cancelar al final del período
});

// Reactivar suscripción
await subscriptionService.reactivateSubscription(subscriptionId);
```

**Tipos de respuesta:** Todos los métodos retornan `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Migración desde servicios antiguos

**❌ Servicio obsoleto (deprecated):**

```typescript
// NO USAR - Deprecated
import { subscriptionApiService } from '@/services/subscriptionApi.service';
const plans = await subscriptionApiService.getSubscriptionPlans();
```

**✅ Servicio recomendado:**

```typescript
// USAR - Nuevo servicio consolidado
import { subscriptionService } from '@/services/subscription.service';
const response = await subscriptionService.getSubscriptionPlans();
if (response.success) {
  setPlans(response.data);
} else {
  handleError(new Error(response.error));
}
```

### Integración con useErrorHandler

Los componentes deben usar el hook de manejo de errores centralizado:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { subscriptionService } from '@/services/subscription.service';

function SubscriptionComponent() {
  const { handleError } = useErrorHandler();

  const loadPlans = async () => {
    try {
      const response = await subscriptionService.getSubscriptionPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        handleError(new Error(response.error || 'Error al cargar planes'));
      }
    } catch (error) {
      handleError(error);
    }
  };

  const createSubscription = async (planId: string) => {
    try {
      const response = await subscriptionService.createSubscription({ planId });
      if (response.success && response.data) {
        showSuccess('Suscripción creada exitosamente');
        // Recargar página o navegar
        window.location.reload();
      } else {
        handleError(new Error(response.error || 'Error al crear suscripción'));
      }
    } catch (error) {
      handleError(error);
    }
  };
}
```

### Características del servicio

- **Idempotency automática:** Las operaciones de creación usan UUID v4
- **Manejo de errores centralizado:** Compatible con `useErrorHandler`
- **Singleton pattern:** Una instancia compartida en toda la aplicación
- **ApiClient integrado:** Cookies, headers y manejo de errores automático
- **TypeScript completo:** Tipos compartidos con backend

### Próximos pasos

1. **Actualizar componentes:** Migrar todos los componentes a usar `subscriptionService`
2. **Eliminar código obsoleto:** Remover imports de `subscriptionApiService`
3. **Testing:** Verificar que todas las operaciones funcionan correctamente
4. **Documentación:** Actualizar guías de desarrollo con el nuevo patrón
