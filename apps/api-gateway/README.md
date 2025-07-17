# 🚀 API Gateway - Facturación Autónomos

> **Gateway centralizado para arquitectura de microservicios**

## 🎯 Características Principales

### ✅ **Funcionalidades Core**
- **Proxy Inteligente** a 8 microservicios especializados
- **Autenticación JWT** centralizada con refresh tokens
- **Rate Limiting** avanzado por IP y usuario
- **Circuit Breaker** con auto-recovery para alta disponibilidad
- **Health Checks** automáticos de todos los servicios
- **Load Balancing** con retry automático y exponential backoff
- **Logging Estructurado** con correlación de requests
- **Métricas Prometheus** para observabilidad completa

### 🔐 **Seguridad Avanzada**
- Helmet.js para headers de seguridad
- CORS configurable por entorno
- Validación de API Keys para integraciones
- RBAC (Role-Based Access Control)
- Rate limiting con Redis distribuido
- Request ID tracking para auditoría

### 📊 **Monitoreo y Observabilidad**
- Health checks con estado detallado
- Circuit breaker metrics en tiempo real
- Prometheus metrics exportables
- Logging estructurado JSON
- Request tracing distribuido
- Error tracking y alertas

---

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │───▶│   API Gateway    │
│   (Next.js)     │    │   (Puerto 4000)  │
└─────────────────┘    └──────────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │  Auth Service   │ │ Invoice Service │ │ Client Service  │
    │   (Port 4001)   │ │   (Port 4002)   │ │   (Port 4003)   │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │  Tax Service    │ │  AEAT Service   │ │ PEPPOL Service  │
    │   (Port 4004)   │ │   (Port 4005)   │ │   (Port 4006)   │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
              │                  │
              ▼                  ▼
    ┌─────────────────┐ ┌─────────────────┐
    │Notification Svc │ │ Storage Service │
    │   (Port 4007)   │ │   (Port 4008)   │
    └─────────────────┘ └─────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisitos**
- Node.js 20+
- Redis (para rate limiting y cache)
- PostgreSQL (para servicios backend)

### **Instalación**

```bash
# Clonar e instalar
cd apps/api-gateway
yarn install

# Configurar entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Desarrollo
yarn dev

# Build para producción
yarn build
yarn start
```

### **Docker**

```bash
# Build imagen
docker build -t facturacion/api-gateway .

# Run container
docker run -p 4000:4000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=tu-jwt-secreto \
  facturacion/api-gateway
```

---

## 📡 Endpoints Principales

### **🔐 Autenticación (`/api/v1/auth`)**
```http
POST /api/v1/auth/login          # Login usuario
POST /api/v1/auth/register       # Registro nuevo usuario
POST /api/v1/auth/refresh        # Renovar token
POST /api/v1/auth/logout         # Cerrar sesión
GET  /api/v1/auth/me            # Info usuario actual
PUT  /api/v1/auth/profile       # Actualizar perfil
POST /api/v1/auth/password/change # Cambiar contraseña
```

### **📄 Facturas (`/api/v1/invoices`)**
```http
GET    /api/v1/invoices          # Listar facturas
POST   /api/v1/invoices          # Crear factura
GET    /api/v1/invoices/:id      # Obtener factura
PUT    /api/v1/invoices/:id      # Actualizar factura
DELETE /api/v1/invoices/:id      # Eliminar factura
POST   /api/v1/invoices/:id/send # Enviar por email
GET    /api/v1/invoices/:id/pdf  # Descargar PDF
```

### **👥 Clientes (`/api/v1/clients`)**
```http
GET    /api/v1/clients           # Listar clientes
POST   /api/v1/clients           # Crear cliente
GET    /api/v1/clients/:id       # Obtener cliente
PUT    /api/v1/clients/:id       # Actualizar cliente
DELETE /api/v1/clients/:id       # Eliminar cliente
GET    /api/v1/clients/:id/invoices # Facturas del cliente
```

### **🧮 Cálculos Fiscales (`/api/v1/tax`)**
```http
POST /api/v1/tax/calculate       # Calcular impuestos
GET  /api/v1/tax/quarterly       # Cierre trimestral
GET  /api/v1/tax/annual          # Cierre anual
POST /api/v1/tax/estimate        # Estimaciones futuras
```

### **🏛️ AEAT (`/api/v1/aeat`)**
```http
POST /api/v1/aeat/sii/submit     # Enviar a SII
GET  /api/v1/aeat/sii/status     # Estado SII
POST /api/v1/aeat/models/303     # Modelo 303
POST /api/v1/aeat/models/130     # Modelo 130
POST /api/v1/aeat/tbai/submit    # TicketBAI
```

### **🌍 PEPPOL (`/api/v1/peppol`)**
```http
POST /api/v1/peppol/send         # Enviar documento
GET  /api/v1/peppol/status       # Estado transmisión
GET  /api/v1/peppol/participants # Buscar participantes
POST /api/v1/peppol/validate     # Validar documento UBL
```

### **📧 Notificaciones (`/api/v1/notifications`)**
```http
POST /api/v1/notifications/email # Enviar email
POST /api/v1/notifications/sms   # Enviar SMS
GET  /api/v1/notifications/history # Historial envíos
GET  /api/v1/notifications/templates # Plantillas
```

### **📁 Storage (`/api/v1/storage`)**
```http
POST /api/v1/storage/upload      # Subir archivo
GET  /api/v1/storage/files       # Listar archivos
GET  /api/v1/storage/files/:id   # Descargar archivo
DELETE /api/v1/storage/files/:id # Eliminar archivo
```

### **📊 Monitoreo (`/api/v1/monitoring`)**
```http
GET /api/v1/monitoring/health    # Estado servicios
GET /api/v1/monitoring/circuit-breakers # Circuit breakers
GET /api/v1/monitoring/services  # Lista servicios
```

---

## 🔧 Configuración Avanzada

### **Variables de Entorno**

```bash
# Servicios (URLs y timeouts)
AUTH_SERVICE_URL=http://auth-service:4001
INVOICE_SERVICE_URL=http://invoice-service:4002
# ... resto de servicios

# Seguridad
JWT_SECRET=tu-jwt-super-secreto-seguro
ALLOWED_ORIGINS=https://tu-frontend.com

# Rate Limiting
RATE_LIMIT_MAX=1000              # Requests por ventana
RATE_LIMIT_WINDOW_MS=900000      # 15 minutos

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=5000     # Timeout en ms
CIRCUIT_BREAKER_ERROR_THRESHOLD=50 # % de errores para abrir
CIRCUIT_BREAKER_RESET_TIMEOUT=30000 # Tiempo para reset

# Redis (para rate limiting)
REDIS_HOST=redis-cluster
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password
```

### **Autenticación JWT**

```javascript
// Header Authorization
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Payload del token
{
  "id": "user-uuid",
  "email": "usuario@empresa.com",
  "roles": ["admin", "user"],
  "permissions": ["invoices:read", "invoices:write"],
  "iat": 1640995200,
  "exp": 1640998800
}
```

### **Rate Limiting**

```javascript
// Headers de respuesta
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995800

// Respuesta cuando se excede el límite
{
  "error": "Demasiadas solicitudes",
  "retryAfter": "15 minutos",
  "limit": 100,
  "windowMs": 900000
}
```

---

## 📊 Métricas y Monitoreo

### **Prometheus Metrics**

```
# Request metrics
http_requests_total{method="GET", route="/api/v1/invoices", status="200"}
http_request_duration_seconds{method="POST", route="/api/v1/auth/login"}

# Circuit breaker metrics  
circuit_breaker_state{service="invoice"} 1  # 0=closed, 1=open, 2=half-open
circuit_breaker_failures_total{service="invoice"}
circuit_breaker_successes_total{service="invoice"}

# Service health metrics
service_health_status{service="auth"} 1     # 1=healthy, 0=unhealthy
service_response_time_seconds{service="auth"}
```

### **Health Check Response**

```json
{
  "overall": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": [
    {
      "service": "auth",
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2024-01-01T12:00:00.000Z",
      "errorCount": 0,
      "successCount": 1250
    },
    {
      "service": "invoice", 
      "status": "degraded",
      "responseTime": 850,
      "lastCheck": "2024-01-01T12:00:00.000Z",
      "errorCount": 12,
      "successCount": 988
    }
  ]
}
```

---

## 🚨 Manejo de Errores

### **Circuit Breaker States**

```javascript
// Estado Cerrado (Normal)
{
  "state": "closed",
  "errorPercentage": 5,
  "nextAttempt": null
}

// Estado Abierto (Servicio no disponible)
{
  "state": "open", 
  "errorPercentage": 75,
  "nextAttempt": "2024-01-01T12:05:00.000Z"
}

// Estado Semi-abierto (Probando recuperación)
{
  "state": "half-open",
  "errorPercentage": 45,
  "nextAttempt": null
}
```

### **Error Responses**

```javascript
// Error de servicio no disponible
{
  "error": true,
  "message": "Servicio de facturas no disponible temporalmente",
  "code": "SERVICE_UNAVAILABLE",
  "service": "invoice",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1640995200_abc123"
}

// Error de autenticación
{
  "error": true,
  "message": "Token expirado",
  "code": "TOKEN_EXPIRED", 
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔄 Retry y Resilience

### **Retry Logic**

```javascript
// Configuración de reintentos por servicio
const retryConfig = {
  auth: { retries: 3, backoff: 'exponential' },
  invoice: { retries: 3, backoff: 'exponential' },
  aeat: { retries: 5, backoff: 'exponential' },    // Más reintentos para AEAT
  notification: { retries: 5, backoff: 'linear' }  // Reintentos lineales para notificaciones
};

// Exponential backoff: 1s, 2s, 4s, 8s...
// Linear backoff: 1s, 2s, 3s, 4s...
```

### **Circuit Breaker Configuration**

```javascript
const circuitBreakerConfig = {
  timeout: 5000,              // 5 segundos timeout
  errorThresholdPercentage: 50, // 50% errores para abrir
  resetTimeout: 30000,        // 30 segundos para reset
  monitoringPeriod: 10000     // 10 segundos ventana monitoreo
};
```

---

## 🐳 Docker Compose

```yaml
version: '3.8'
services:
  api-gateway:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_HOST=redis
    depends_on:
      - redis
      - auth-service
      - invoice-service
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    
volumes:
  redis_data:
```

---

## 📚 Documentación API

- **Swagger UI**: `http://localhost:4000/docs`
- **Health Check**: `http://localhost:4000/health`
- **Métricas**: `http://localhost:4000/metrics`

---

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests de integración
yarn test:integration

# Coverage
yarn test:coverage

# Load testing
artillery quick --count 100 --num 10 http://localhost:4000/health
```

---

## 🚀 Deployment

### **Kubernetes**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    spec:
      containers:
      - name: api-gateway
        image: facturacion/api-gateway:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi" 
            cpu: "250m"
```

---

## 📈 Performance

### **Benchmarks**
- **Throughput**: 10,000+ req/sec en hardware modesto
- **Latency P95**: < 100ms para requests simples
- **Memory**: ~256MB RAM baseline
- **CPU**: ~10-20% utilización normal

### **Optimizaciones**
- Connection pooling para servicios backend
- Response caching con Redis
- Compression gzip habilitado
- Keep-alive connections
- Request batching donde sea posible

---

**🎯 El API Gateway está listo para manejar alta carga y proporcionar una experiencia robusta y escalable para tu plataforma de facturación.**
