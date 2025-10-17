# 🧪 Guía de Tests E2E - Facturación Autónomos

Esta guía documenta la suite completa de tests End-to-End (E2E) implementada con Playwright para validar la funcionalidad crítica de la plataforma de facturación para autónomos.

## 📋 Cobertura de Tests

### 🔐 Tests de Autenticación (`e2e/auth/`)

- **Login exitoso**: Validación de credenciales correctas y redirección
- **Login fallido**: Manejo de errores de credenciales inválidas
- **Sesión persistente**: Verificación de estado de login entre páginas
- **Logout**: Cierre de sesión y limpieza de estado
- **Validación de formularios**: Campos requeridos y formatos
- **Rate limiting**: Protección contra ataques de fuerza bruta

### 📄 Tests de Facturas (`e2e/invoices/`)

- **Creación completa de facturas**: Desde formulario hasta PDF generado
- **Validación de campos**: NIF, importes, fechas, conceptos
- **Cálculos automáticos**: IVA, totales, retenciones
- **Múltiples líneas**: Agregar/quitar items dinámicamente
- **Guardado de borradores**: Persistencia de estado parcial
- **Generación de PDF**: Descarga y verificación de contenido
- **Edición de facturas**: Modificar facturas existentes
- **Eliminación**: Borrado con confirmación

### 💳 Tests de Suscripciones (`e2e/subscriptions/`)

- **Visualización de planes**: Mostrar planes con características
- **Selección de plan**: Interfaz de selección y navegación
- **Proceso de pago**: Integración completa con Stripe
- **Manejo de errores de pago**: Tarjetas rechazadas, fondos insuficientes
- **Suscripción activa**: Dashboard con estado de suscripción
- **Cancelación**: Cancelar suscripción con confirmación
- **Límites de uso**: Validación de límites por plan
- **Cambio de plan**: Upgrade/downgrade con prorrateo

## 🛠️ Configuración del Entorno

### Prerrequisitos

1. **Node.js** >= 20.0.0
2. **PNPM** >= 8.0.0
3. **Playwright** instalado y configurado

### Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
pnpm install

# Instalar Playwright y navegadores
pnpm run playwright:install

# Instalar dependencias del sistema (Linux)
pnpm run playwright:install-deps
```

### Configuración de Variables de Entorno

Crear archivo `.env.test` en la raíz del proyecto:

```env
# Base URL de la aplicación para tests
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Configuración de base de datos de test
DATABASE_URL=postgresql://postgres:postgres_test@localhost:5432/facturacion_test

# Claves de API para mocks (no usar claves reales)
STRIPE_PUBLIC_KEY=pk_test_mock
STRIPE_SECRET_KEY=sk_test_mock

# Configuración de AEAT (mock)
AEAT_API_URL=https://mock.aeat.es/api
AEAT_API_KEY=mock_aeat_key
```

### Inicio de Servicios para Testing

```bash
# Iniciar todos los servicios en modo desarrollo
pnpm run dev

# O usar el script de integración completa
./setup-integration.sh
./start-all-services.sh
```

## 🚀 Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests E2E
pnpm run test:e2e

# Ejecutar tests en modo UI (interactivo)
pnpm run test:e2e:ui

# Ejecutar tests con navegador visible
pnpm run test:e2e:headed

# Ejecutar tests en modo debug
pnpm run test:e2e:debug
```

### Tests Específicos por Módulo

```bash
# Solo tests de autenticación
pnpm run test:e2e:auth

# Solo tests de facturas
pnpm run test:e2e:invoices

# Solo tests de suscripciones
pnpm run test:e2e:subscriptions
```

### Tests para CI/CD

```bash
# Tests optimizados para CI (solo Chromium, reporter GitHub)
pnpm run test:e2e:ci

# Tests de humo (funcionalidades críticas)
pnpm run test:e2e:smoke
```

## 📊 Reportes y Resultados

### Ver Reportes

```bash
# Mostrar reporte HTML interactivo
pnpm run playwright:show-report
```

Los reportes se generan automáticamente en `playwright-report/` y incluyen:

- Capturas de pantalla en caso de fallos
- Videos de ejecución completa
- Traces de Playwright para debugging
- Métricas de rendimiento

### Estructura de Reportes

```
playwright-report/
├── index.html          # Reporte principal
├── data/              # Datos JSON
└── test-results/      # Capturas y videos
    ├── auth-login-failed/
    ├── invoice-creation-success/
    └── subscription-payment-error/
```

## 🔧 Mocks y Configuración

### Servicios Externos Mockeados

#### Stripe (`e2e/mocks/external-services-mock.ts`)

- ✅ Creación de Payment Intents
- ✅ Confirmación de pagos
- ✅ Manejo de errores de tarjetas
- ✅ Webhooks de Stripe

#### AEAT (Agencia Tributaria Española)

- ✅ Validación de NIF/CIF
- ✅ Envío de facturas electrónicas
- ✅ Consulta de estado de envíos
- ✅ Cálculo de retenciones

#### Otros Servicios

- ✅ Envío de emails (SendGrid/Mailgun)
- ✅ SMS (Twilio)
- ✅ Almacenamiento de archivos (AWS S3/Cloudinary)
- ✅ Geolocalización
- ✅ Conversión de divisas

### Configuraciones de Mock Predefinidas

```typescript
import { mockConfigs, applyMockConfig } from './e2e/mocks/external-services-mock';

// Aplicar configuración de pago exitoso
await applyMockConfig(page, mockConfigs.successfulPayment);

// Aplicar configuración de pago fallido
await applyMockConfig(page, mockConfigs.failedPayment);

// Aplicar configuración de red lenta
await applyMockConfig(page, mockConfigs.slowNetwork);
```

## 🐛 Debugging y Troubleshooting

### Modo Debug Interactivo

```bash
# Ejecutar test específico en modo debug
pnpm run test:e2e:debug -- e2e/auth/login.spec.ts

# Generar código con codegen
pnpm run playwright:codegen localhost:3000
```

### Capturas de Pantalla en Fallos

Los tests automáticamente generan capturas en caso de fallo:

- `test-results/screenshots/` - Capturas de pantalla
- `test-results/videos/` - Videos completos de ejecución

### Logs y Tracing

```typescript
// Habilitar tracing en test específico
test('mi test', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });

  // ... código del test ...

  await page.context().tracing.stop({
    path: 'trace.zip',
  });
});
```

## 📈 Mejores Prácticas

### Estructura de Tests

```typescript
test.describe('Mi Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup común: login, mocks, navegación
  });

  test('escenario exitoso', async ({ page }) => {
    // Test del flujo happy path
  });

  test('escenario de error', async ({ page }) => {
    // Test de manejo de errores
  });
});
```

### Mocks Efectivos

```typescript
// Mock de API responses
await page.route('**/api/endpoint', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});
```

### Selectores Estables

```typescript
// Usar data-testid en lugar de clases/CSS
await page.locator('[data-testid="submit-button"]').click();

// Usar roles de accesibilidad
await page.getByRole('button', { name: 'Crear Factura' }).click();
```

## 🔄 Integración con CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm run playwright:install
      - run: pnpm run dev &
      - run: pnpm run test:e2e:ci
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Configuración de Paralelización

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
});
```

## 📚 Recursos Adicionales

- [Documentación Oficial de Playwright](https://playwright.dev/)
- [Mejores Prácticas de Testing E2E](https://playwright.dev/docs/best-practices)
- [Debugging con Playwright](https://playwright.dev/docs/debug)
- [Integración con CI/CD](https://playwright.dev/docs/ci)

## 🤝 Contribución

### Agregar Nuevos Tests

1. Crear archivo en directorio apropiado (`e2e/auth/`, `e2e/invoices/`, etc.)
2. Seguir patrón de nomenclatura: `feature-action.spec.ts`
3. Incluir mocks necesarios en `e2e/mocks/`
4. Actualizar esta documentación

### Mantener Tests

- Ejecutar tests regularmente en desarrollo
- Revisar tests fallidos en CI/CD
- Actualizar mocks cuando cambien APIs
- Mantener cobertura de funcionalidades críticas
