# 🚀 Guía de Uso - AEAT SII Integration

## Tabla de Contenidos
1. [Habilitación del servicio](#habilitación-del-servicio)
2. [Configuración](#configuración)
3. [Uso del API](#uso-del-api)
4. [Troubleshooting](#troubleshooting)
5. [Ejemplos](#ejemplos)

---

## Habilitación del Servicio

### Paso 1: Configurar variables de entorno

En tu archivo `.env`:

```bash
# Habilitar AEAT SII
AEAT_SII_ENABLED=true

# Ruta al certificado P12/PFX (requerido)
AEAT_CERTIFICATE_PATH=/ruta/a/tu/certificado.p12

# Contraseña del certificado (requerido)
AEAT_CERTIFICATE_PASSWORD=tu_contraseña

# Configuración opcional
AEAT_RETRY_ATTEMPTS=3           # Número de reintentos (default: 3)
AEAT_RETRY_DELAY=5000           # Delay inicial en ms (default: 5000)
AEAT_TIMEOUT=60000              # Timeout en ms (default: 60000)

# Para usar entorno de prueba (recomendado inicialmente)
AEAT_TEST_MODE=true
```

### Paso 2: Obtener certificado

1. Descarga tu certificado AEAT en formato P12/PFX desde:
   - Portal de la AEAT
   - Gestoría o asesor fiscal

2. Guarda el certificado en una ubicación segura

3. Obtén la contraseña del certificado

### Paso 3: Verificar instalación

```bash
# Las dependencias ya están incluidas:
- axios (cliente HTTP)
- xml-js (parsing XML)
- node-forge (certificates)
- Stripe SDK (webhooks)

# Verificar que funciona (opcional)
npm test -- sii.service.ts
```

---

## Configuración

### Variables de Entorno Completas

```bash
# ========================================
# AEAT SII CONFIGURATION
# ========================================

# Habilitar/deshabilitar integración
AEAT_SII_ENABLED=true|false

# Ruta absoluta al certificado P12/PFX
AEAT_CERTIFICATE_PATH=/path/to/certificate.p12

# Contraseña del certificado
AEAT_CERTIFICATE_PASSWORD=your_password

# NIF de la empresa que envía las facturas
AEAT_NIF=12345678A

# Endpoint de AEAT
# Producción: https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd
# Pruebas: https://www1aeat.es/wlpl/SiiStd/ws/SiiStd
AEAT_API_URL=https://www1aeat.es/wlpl/SiiStd/ws/SiiStd

# Reintentos automáticos
AEAT_RETRY_ATTEMPTS=3

# Delay inicial entre reintentos (ms)
# Con backoff exponencial: 5000, 10000, 20000
AEAT_RETRY_DELAY=5000

# Timeout para respuesta de AEAT (ms)
AEAT_TIMEOUT=60000

# ========================================
# STRIPE CONFIGURATION
# ========================================

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_API_VERSION=2023-10-16
```

### Recomendaciones de Seguridad

1. **Nunca commitear secretos:**
   ```bash
   # ✅ Usar .env.local o .env.production
   # ❌ No commitear AEAT_CERTIFICATE_PASSWORD
   ```

2. **Certificados en producción:**
   - Usar gestor de secretos (AWS Secrets Manager, Vault, etc.)
   - No guardar en repositorio
   - Rotar periódicamente

3. **Variables de entorno:**
   - Diferentes para test y producción
   - Usar URLs diferentes para endpoints

---

## Uso del API

### Endpoint: Enviar factura a AEAT

**URL:**
```
POST /api/invoices/{invoiceId}/submit-aeat
```

**Headers requeridos:**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Parámetros:**
- `invoiceId` (path) - ID de la factura a enviar

**Respuestas:**

#### 200 OK - Enviada exitosamente
```json
{
  "success": true,
  "message": "Factura enviada a AEAT exitosamente",
  "data": {
    "invoice": {
      "id": "inv-123",
      "invoiceNumber": "FAC-2024-001",
      "siiSent": true,
      "siiReference": "ABC1234567890XYZ",
      "siiSentAt": "2024-10-17T10:30:00Z"
    },
    "siiReference": "ABC1234567890XYZ"
  }
}
```

#### 400 Bad Request - Datos inválidos
```json
{
  "success": false,
  "message": "Validación fallida",
  "error": "NIF cliente inválido"
}
```

#### 401 Unauthorized - No autenticado
```json
{
  "success": false,
  "message": "Usuario no autorizado"
}
```

#### 404 Not Found - Factura no existe
```json
{
  "success": false,
  "message": "Factura no encontrada"
}
```

#### 409 Conflict - Ya enviada
```json
{
  "success": false,
  "message": "Factura ya enviada a AEAT",
  "data": {
    "siiReference": "ABC1234567890XYZ",
    "siiSentAt": "2024-10-17T10:00:00Z"
  }
}
```

#### 503 Service Unavailable - AEAT no habilitado
```json
{
  "success": false,
  "message": "Integración AEAT SII no está habilitada"
}
```

#### 500 Internal Server Error - Error al enviar
```json
{
  "success": false,
  "message": "Error al enviar factura a AEAT",
  "error": "Certificado inválido o expirado"
}
```

---

## Troubleshooting

### "Certificate not found" Error

**Causa:** Ruta del certificado incorrecta

**Solución:**
```bash
# 1. Verificar que el archivo existe
ls -la /path/to/certificate.p12

# 2. Verificar permisos de lectura
chmod 644 /path/to/certificate.p12

# 3. Usar ruta absoluta en .env
AEAT_CERTIFICATE_PATH=/absolute/path/to/certificate.p12

# 4. Verificar que es válido
file /path/to/certificate.p12
# Debe mostrar: PKCS 12 data
```

### "Invalid certificate password" Error

**Causa:** Contraseña incorrecta

**Solución:**
```bash
# 1. Verificar contraseña (sin caracteres especiales mal escapados)
# 2. Si tiene caracteres especiales, probar con comillas:
AEAT_CERTIFICATE_PASSWORD='p@ssw0rd!#'

# 3. Testear certificado manualmente con openssl:
openssl pkcs12 -in certificate.p12 -passin pass:tu_contraseña -noout
```

### "Connection refused" Error

**Causa:** No hay conexión a AEAT

**Solución:**
```bash
# 1. Verificar conectividad a internet
ping 8.8.8.8

# 2. Verificar que el endpoint es correcto
# Desarrollo: https://www1aeat.es/wlpl/SiiStd/ws/SiiStd
# Producción: https://www1.agenciatributaria.es/wlpl/SiiStd/ws/SiiStd

# 3. Verificar firewall/proxy
curl -v https://www1aeat.es/wlpl/SiiStd/ws/SiiStd

# 4. Aumentar timeout
AEAT_TIMEOUT=90000
```

### "AEAT returned error" Error

**Causa:** AEAT rechazó la factura

**Solución:**
```
Errores comunes de AEAT:
- 3001: NIF formato inválido
- 3003: NIF receptor no válido
- 3004: NIF empresa no válido
- 3100: Datos de factura incorrectos
- 3300: Contraparte sin identificación

Verificar:
1. NIFs de empresa y cliente en formato correcto
2. Importes calculados correctamente
3. Desglose de IVA válido
4. Fechas en formato DD-MM-YYYY
```

### "Retry attempts exceeded" Error

**Causa:** Fallos de red persistentes

**Solución:**
```bash
# 1. Aumentar número de reintentos
AEAT_RETRY_ATTEMPTS=5

# 2. Aumentar delay entre reintentos
AEAT_RETRY_DELAY=10000

# 3. Verificar estado de AEAT
# Visitar: https://www.agenciatributaria.es/

# 4. Reintenttar manualmente más tarde
# El endpoint es idempotente (use mismo ID de factura)
```

### "SII Service disabled" Error

**Causa:** `AEAT_SII_ENABLED` no es true

**Solución:**
```bash
# 1. Habilitar en .env
AEAT_SII_ENABLED=true

# 2. Verificar que el valor es booleano, no string
# ✅ CORRECTO: AEAT_SII_ENABLED=true
# ❌ INCORRECTO: AEAT_SII_ENABLED='true' (es string!)

# 3. Reiniciar aplicación
npm run dev
```

---

## Ejemplos

### Ejemplo 1: cURL

```bash
# Enviar factura a AEAT
curl -X POST http://localhost:3002/api/invoices/inv-123/submit-aeat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Respuesta:
# {
#   "success": true,
#   "message": "Factura enviada a AEAT exitosamente",
#   "data": {
#     "siiReference": "ABC1234567890XYZ"
#   }
# }
```

### Ejemplo 2: JavaScript/TypeScript

```typescript
// Cliente HTTP
const apiClient = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Enviar a AEAT
async function submitToAEAT(invoiceId: string) {
  try {
    const response = await apiClient.post(
      `/api/invoices/${invoiceId}/submit-aeat`
    );
    
    console.log('✅ Enviada:', response.data.data.siiReference);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Ya enviada:', error.response.data.data.siiReference);
    } else {
      console.error('❌ Error:', error.response?.data?.message);
    }
    throw error;
  }
}

// Usar
await submitToAEAT('inv-123');
```

### Ejemplo 3: Frontend (React)

```typescript
// Hook para enviar factura
const useSubmitToAEAT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (invoiceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/invoices/${invoiceId}/submit-aeat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const result = await response.json();
      console.log('CSV:', result.data.siiReference);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
};

// Uso en componente
function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const { submit, loading, error } = useSubmitToAEAT();

  return (
    <div>
      <button onClick={() => submit(invoiceId)} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar a AEAT'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Ejemplo 4: Modo batch (enviar múltiples)

```typescript
// Enviar todas las facturas pendientes
async function submitAllPending() {
  const invoices = await prisma.invoice.findMany({
    where: {
      siiSent: false,
      status: 'SENT', // Solo facturas enviadas al cliente
    },
  });

  for (const invoice of invoices) {
    try {
      await siiIntegrationService.submitInvoiceToAEAT(invoice);
      console.log(`✅ ${invoice.invoiceNumber}`);
    } catch (error) {
      console.error(`❌ ${invoice.invoiceNumber}:`, error.message);
      // Continuar con la siguiente
    }
  }
}

// Ejecutar periódicamente (ej. cada hora)
cron.schedule('0 * * * *', submitAllPending);
```

---

## Verificación de Estado

### Verificar que AEAT SII está habilitado

```typescript
import { siiIntegrationService } from '@/services/sii-integration.service';

if (siiIntegrationService.isEnabled()) {
  console.log('✅ AEAT SII está habilitado');
} else {
  console.log('⚠️ AEAT SII está deshabilitado');
}
```

### Obtener estado de factura

```typescript
const invoice = await prisma.invoice.findUnique({
  where: { id: invoiceId },
});

if (invoice.siiSent) {
  console.log('✅ Enviada a AEAT');
  console.log('CSV:', invoice.siiReference);
  console.log('Fecha envío:', invoice.siiSentAt);
} else {
  console.log('⏳ Pendiente de envío a AEAT');
}
```

---

## Documentos de Referencia

- [CLOUD_INTEGRATIONS_STATUS.md](./CLOUD_INTEGRATIONS_STATUS.md) - Estado completo
- [IMPLEMENTATION_SUMMARY_AEAT_SII.md](./IMPLEMENTATION_SUMMARY_AEAT_SII.md) - Detalles técnicos
- [.env.example](./.env.example) - Template de configuración
- [API Documentation](./README.md) - API general

---

## Contacto y Soporte

Para preguntas o problemas:
1. Revisar Troubleshooting arriba
2. Consultar documentación AEAT
3. Contactar a gestoría/asesor fiscal
4. Ver logs de aplicación

---

**Última actualización:** 17 de octubre de 2025
**Versión:** 1.0
