# Sistema de Webhooks AEAT

## Resumen

Este documento describe el sistema de webhooks implementado para recibir notificaciones de la AEAT (Agencia Estatal de
Administración Tributaria) sobre el estado de presentaciones de modelos fiscales.

## Arquitectura

### Componentes Principales

1. **WebhookController** - Controlador REST para manejar endpoints de webhooks
2. **WebhookProcessorService** - Servicio para procesar webhooks y actualizar estados
3. **WebhookSignatureService** - Servicio para verificar firmas digitales
4. **Middlewares de Seguridad** - IP whitelist y rate limiting

## Endpoints

### POST /api/webhooks/aeat

**Descripción**: Endpoint principal para recibir webhooks de AEAT

**Headers requeridos**:

- `X-AEAT-Signature`: Firma digital del payload
- `X-AEAT-Timestamp`: Timestamp de la petición
- `Content-Type`: application/json

**Payload de ejemplo**:

```json
{
  "modeloId": "modelo-123",
  "estado": "ACEPTADO",
  "timestamp": "2024-01-01T00:00:00Z",
  "numeroJustificante": "J123456789",
  "observaciones": "Presentación aceptada correctamente"
}
```

**Respuesta exitosa**:

```json
{
  "status": "success",
  "message": "Webhook procesado correctamente",
  "webhookId": "webhook-uuid"
}
```

### GET /api/webhooks/aeat/:webhookId/status

**Descripción**: Obtener estado de un webhook específico

**Respuesta**:

```json
{
  "status": "success",
  "data": {
    "id": "webhook-uuid",
    "estado": "PROCESADO",
    "tipoNotificacion": "PRESENTACION_ACEPTADA",
    "origen": "AEAT",
    "fechaRecepcion": "2024-01-01T00:00:00Z",
    "fechaProcesamiento": "2024-01-01T00:01:00Z",
    "metodoVerificacion": "HMAC-SHA256",
    "usuarioId": "user-uuid",
    "intentos": 1,
    "ultimoError": null
  }
}
```

### POST /api/webhooks/aeat/:webhookId/retry

**Descripción**: Reintentar procesamiento de un webhook fallido

**Respuesta**:

```json
{
  "status": "success",
  "message": "Webhook reintentado correctamente"
}
```

### GET /api/webhooks/aeat

**Descripción**: Listar webhooks con paginación y filtros

**Parámetros de consulta**:

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `estado`: Filtrar por estado (PENDIENTE, PROCESADO, ERROR)
- `fechaDesde`: Fecha de inicio (ISO 8601)
- `fechaHasta`: Fecha de fin (ISO 8601)

## Seguridad

### Verificación de Firmas

El sistema soporta dos métodos de verificación:

1. **HMAC-SHA256**: Para entornos de desarrollo/sandbox
2. **RSA**: Para entornos de producción

### IP Whitelist

Solo se aceptan webhooks desde IPs autorizadas:

- Rangos de AEAT: 193.146.16.0/20, 193.146.32.0/19
- Localhost para desarrollo: 127.0.0.1, ::1

### Rate Limiting

- Máximo 100 webhooks por minuto por IP
- Configuración ajustable por entorno

## Procesamiento de Webhooks

### Flujo de Procesamiento

1. **Validación de IP**: Verificar IP en whitelist
2. **Verificación de Firma**: Validar integridad del payload
3. **Parseo y Validación**: Verificar estructura del payload
4. **Guardado**: Crear registro en base de datos
5. **Procesamiento**: Actualizar estado según tipo de notificación
6. **Marcado**: Marcar como procesado o error

### Tipos de Notificaciones

- `PRESENTACION_ACEPTADA`: Presentación aceptada por AEAT
- `PRESENTACION_RECHAZADA`: Presentación rechazada por AEAT
- `RECORDATORIO`: Recordatorio de presentación pendiente
- `CONFIRMACION`: Confirmación de recepción

### Estados de Webhook

- `PENDIENTE`: Recibido pero no procesado
- `PROCESADO`: Procesado correctamente
- `ERROR`: Error en el procesamiento

## Manejo de Errores

### Errores Comunes

1. **Firma Inválida**: Webhook rechazado por firma incorrecta
2. **Payload Malformado**: JSON inválido o estructura incorrecta
3. **Modelo No Encontrado**: Modelo referenciado no existe
4. **Error de Base de Datos**: Fallo en operaciones de BD

### Reintentos

- Los webhooks fallidos se pueden reintentar manualmente
- Contador de intentos para evitar loops infinitos
- Logging detallado para debugging

## Configuración

### Variables de Entorno

```bash
# Configuración de seguridad
WEBHOOK_ALLOWED_IPS=193.146.16.0/20,193.146.32.0/19
AEAT_WEBHOOK_SECRET=your-hmac-secret
AEAT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...

# Configuración de rate limiting
WEBHOOK_RATE_LIMIT_WINDOW=60000  # 1 minuto
WEBHOOK_RATE_LIMIT_MAX=100       # 100 requests por ventana
```

### Configuración de Desarrollo

En desarrollo, se desactivan:

- IP whitelist (acepta localhost)
- Rate limiting
- Verificación RSA estricta

## Monitoreo y Logging

### Métricas

- Webhooks recibidos por minuto
- Tasa de éxito/error
- Tiempo de procesamiento promedio
- Distribución por tipo de notificación

### Logging

- Todos los webhooks se registran con nivel INFO
- Errores se registran con nivel ERROR
- Headers sensibles se ocultan en logs

## Ejemplo de Uso

### Configurar Webhook en AEAT

1. Registrar URL del webhook: `https://tu-dominio.com/api/webhooks/aeat`
2. Configurar método de verificación (HMAC o RSA)
3. Especificar eventos a notificar

### Procesar Webhook

```typescript
// El endpoint procesará automáticamente:
// 1. Verificación de IP
// 2. Verificación de firma
// 3. Procesamiento del payload
// 4. Actualización en base de datos
// 5. Respuesta al cliente
```

## Mantenimiento

### Limpieza de Datos

- Implementar job para limpiar webhooks antiguos
- Retener logs por período configurable
- Archivar webhooks procesados exitosamente

### Monitoreo de Salud

- Endpoint de salud para verificar estado
- Alertas por alta tasa de errores
- Monitoreo de latencia de procesamiento

## Troubleshooting

### Problemas Comunes

1. **Webhook no recibido**: Verificar IP whitelist y DNS
2. **Firma inválida**: Verificar configuración de claves
3. **Timeouts**: Revisar performance de base de datos
4. **Duplicados**: Implementar idempotencia si es necesario

### Debugging

```bash
# Ver logs de webhooks
tail -f logs/webhook.log

# Verificar estado de webhook específico
curl -X GET https://tu-dominio.com/api/webhooks/aeat/{webhook-id}/status

# Reintentar webhook fallido
curl -X POST https://tu-dominio.com/api/webhooks/aeat/{webhook-id}/retry
```
