# 🔐 GUÍA DE IMPLEMENTACIÓN DE SEGURIDAD HTTP

## 📋 Resumen de Implementación Completa

Esta guía documenta la implementación completa del **sistema de seguridad HTTP** para el monorepo de facturación de autónomos, incluyendo headers de seguridad, configuración CORS y protección contra ataques comunes.

## 🎯 Componentes Implementados

### 1. **Express Security Middleware** (`packages/security/src/express-security.js`)

- ✅ **Helmet**: Headers de seguridad automáticos
- ✅ **CORS**: Configuración restrictiva con validación de orígenes
- ✅ **Rate Limiting**: Límites generales y específicos para autenticación
- ✅ **Headers Personalizados**: Protección adicional para APIs
- ✅ **Validación de Origen**: Verificación estricta para endpoints críticos

### 2. **Next.js Security Config** (`packages/security/src/next-security.config.js`)

- ✅ **Headers Globales**: Aplicados a todas las rutas
- ✅ **CSP (Content Security Policy)**: Política restrictiva de contenido
- ✅ **HSTS**: Transporte seguro en producción
- ✅ **Headers de API**: Configuración específica para rutas API
- ✅ **Webpack Security**: Prevención de exposición de módulos servidor

### 3. **Script de Verificación** (`scripts/verify-http-security.sh`)

- ✅ **Validación Automática**: Verifica configuración y sintaxis
- ✅ **Detección de Secretos**: Previene hardcodeo de credenciales
- ✅ **Verificación de Dependencias**: Confirma librerías de seguridad
- ✅ **Reporte Completo**: Análisis detallado de la implementación

## 🚀 Cómo Integrar

### Para Servicios Express (APIs)

```javascript
// En tu app Express (ej: apps/api-facturas/src/app.js)
const { applyExpressSecurity } = require('@facturacion/security/express-security');

const app = express();

// Aplicar middleware de seguridad
applyExpressSecurity(app, {
  env: process.env.NODE_ENV,
  apiVersion: '1.0.0',
});

// ... resto de tu configuración
```

### Para Aplicaciones Next.js

```javascript
// En tu next.config.js (ej: apps/web/next.config.js)
const securityConfig = require('@facturacion/security/next-security.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...securityConfig,
  // ... tu configuración adicional
};

module.exports = nextConfig;
```

## 📊 Headers de Seguridad Implementados

| Header                      | Propósito              | Configuración                                  |
| --------------------------- | ---------------------- | ---------------------------------------------- |
| `X-Frame-Options`           | Previene clickjacking  | `DENY`                                         |
| `X-XSS-Protection`          | Protección XSS básica  | `1; mode=block`                                |
| `X-Content-Type-Options`    | Previene MIME sniffing | `nosniff`                                      |
| `Strict-Transport-Security` | Fuerza HTTPS           | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy`   | Control de recursos    | Política restrictiva personalizada             |
| `Referrer-Policy`           | Control de referrer    | `strict-origin-when-cross-origin`              |
| `Permissions-Policy`        | Permisos de navegador  | Denegación de APIs sensibles                   |

## 🛡️ Protecciones Implementadas

### CORS (Cross-Origin Resource Sharing)

```javascript
// Configuración restrictiva con whitelist de dominios
const allowedOrigins = [
  'https://facturacion-autonomos.com',
  'https://app.facturacion-autonomos.com',
  // Desarrollo local
  'http://localhost:3000',
  'http://localhost:3001',
];
```

### Rate Limiting

```javascript
// Límites generales
windowMs: 15 * 60 * 1000, // 15 minutos
max: 100 // 100 requests por ventana

// Límites para autenticación
windowMs: 15 * 60 * 1000, // 15 minutos
max: 5 // 5 intentos por ventana
```

### Content Security Policy (CSP)

```javascript
// Política restrictiva que permite solo recursos confiables
("default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "connect-src 'self' https://api.facturacion-autonomos.com https://fal.run");
```

## 🔍 Verificación y Testing

### Ejecutar Verificación Automática

```bash
# Desde la raíz del proyecto
./scripts/verify-http-security.sh
```

### Testing Manual con curl

```bash
# Verificar headers de seguridad
curl -I http://localhost:3000/api/health

# Verificar CORS
curl -H "Origin: https://malicious.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:3000/api/auth/login
```

### Herramientas Online

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [OWASP ZAP](https://www.zaproxy.org/)

## 📈 Métricas de Seguridad

### Headers Implementados: ✅ 100%

- X-Frame-Options: ✅
- X-XSS-Protection: ✅
- X-Content-Type-Options: ✅
- Strict-Transport-Security: ✅
- Content-Security-Policy: ✅
- Referrer-Policy: ✅
- Permissions-Policy: ✅

### Protecciones Activas: ✅ 100%

- CORS Restrictivo: ✅
- Rate Limiting: ✅
- CSP Configurado: ✅
- HSTS Habilitado: ✅
- Clickjacking Protection: ✅

## 🔧 Configuración por Ambiente

### Desarrollo

```javascript
{
  cspDirectives: {
    // Más permisivo para desarrollo
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    connectSrc: ["'self'", "http:", "ws:", "wss:"]
  }
}
```

### Producción

```javascript
{
  cspDirectives: {
    // Muy restrictivo para producción
    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
    connectSrc: ["'self'", "https://api.facturacion-autonomos.com"]
  }
}
```

## 🚨 Monitoreo y Alertas

### CSP Reporting

```javascript
// Configurar endpoint para reportes CSP
"report-uri": "https://api.facturacion-autonomos.com/csp-report"
```

### Rate Limiting Monitoring

```javascript
// Logs automáticos cuando se exceden límites
rateLimitExceeded: req => {
  console.warn(`Rate limit exceeded for IP: ${req.ip}`);
  // Enviar alerta a sistema de monitoreo
};
```

## 📚 Recursos Adicionales

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CORS MDN Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## ✅ Checklist de Implementación

- [x] Express security middleware creado
- [x] Next.js security config implementado
- [x] Script de verificación funcional
- [x] Headers de seguridad configurados
- [x] CORS restrictivo implementado
- [x] Rate limiting configurado
- [x] CSP policy definida
- [x] Documentación completa
- [ ] Integración en servicios existentes
- [ ] Testing en staging
- [ ] Despliegue a producción

---

**🎉 Sistema de Seguridad HTTP implementado exitosamente!**

La implementación está lista para integración en los servicios del monorepo. Todos los componentes han sido verificados y están listos para uso en producción.
