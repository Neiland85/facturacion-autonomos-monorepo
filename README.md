# TributariApp - Plataforma de Gestión Fiscal para Autónomos

![TributariApp](https://img.shields.io/badge/TributariApp-v1.0.0-blue)
![License](https://img.shields.io/badge/license-Apache%202.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)

## 🚀 Descripción

TributariApp es una plataforma integral de gestión fiscal diseñada específicamente para autónomos y pequeñas empresas en España. Ofrece una solución completa para la facturación electrónica, cálculos fiscales automatizados, y cumplimiento normativo con integraciones PEPPOL y AEAT.

## 🏗️ Arquitectura

### Microservicios

El sistema está construido con una arquitectura de microservicios para garantizar escalabilidad, mantenibilidad y desarrollo independiente:

- **api-facturas**: Gestión completa de facturas electrónicas
- **api-tax-calculator**: Cálculos fiscales automatizados (IVA, IRPF, retenciones)
- **api-gateway**: Punto único de entrada, autenticación y enrutamiento
- **auth-service**: Autenticación y autorización con JWT
- **invoice-service**: Procesamiento avanzado de facturas
- **api-clientes** (próximamente): Gestión de clientes
- **api-integraciones** (próximamente): Integraciones PEPPOL/AEAT

### Stack Tecnológico

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Next.js 14, React, TailwindCSS
- **Base de datos**: PostgreSQL con Prisma ORM
- **Cache**: Redis
- **Contenedores**: Docker, Kubernetes
- **CI/CD**: GitHub Actions
- **Observabilidad**: Prometheus, Grafana, Winston, Datadog (opcional)
- **Documentación API**: OpenAPI 3.0, Swagger UI

## 📋 Características Principales

### ✅ Implementadas

- ✅ **Gestión de Facturas**
  - CRUD completo con validación Zod
  - Estados de factura con transiciones validadas
  - Generación automática de números de factura
  - Cálculos automáticos de IVA y retenciones

- ✅ **Arquitectura Robusta**
  - Patrón Repository y Service Layer
  - Validación de datos con Zod
  - Logging estructurado con Winston
  - Métricas con Prometheus
  - Rate limiting y seguridad con Helmet

- ✅ **DevOps y CI/CD**
  - Pipelines automatizados con GitHub Actions
  - Despliegue en Kubernetes con auto-escalado
  - Configuración de NetworkPolicies
  - Health checks y readiness probes

- ✅ **Documentación**
  - OpenAPI/Swagger para todas las APIs
  - ADRs (Architecture Decision Records)
  - Documentación técnica completa

### 🚧 En Desarrollo

- 🚧 **Integraciones Fiscales**
  - Integración con PEPPOL para facturación B2B europea
  - Conexión con AEAT (SII, Modelo 130/131)
  - Generación de informes fiscales trimestrales

- 🚧 **Frontend Mejorado**
  - Dashboard interactivo con gráficos
  - PWA para acceso móvil
  - Validación en tiempo real

## 🛠️ Instalación

### Prerrequisitos

- Node.js >= 20.0.0
- Yarn 4.x
- PostgreSQL 15+
- Redis (opcional, para caché)
- Docker y Docker Compose (para desarrollo)

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/tributariapp.git
cd tributariapp
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**
```bash
# Copiar archivos de ejemplo
cp .env.example .env
cp apps/api-facturas/.env.example apps/api-facturas/.env
cp apps/api-tax-calculator/.env.example apps/api-tax-calculator/.env
```

4. **Iniciar servicios con Docker**
```bash
docker-compose up -d
```

5. **Ejecutar migraciones**
```bash
yarn db:migrate
```

6. **Iniciar en modo desarrollo**
```bash
yarn dev
```

## 📚 Documentación API

La documentación interactiva de las APIs está disponible en:

- API Facturas: http://localhost:3001/api-docs
- API Tax Calculator: http://localhost:3002/api-docs

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests con coverage
yarn test:coverage

# Tests E2E
yarn test:e2e

# Linting
yarn lint

# Type checking
yarn type-check
```

## 🚀 Despliegue

### Kubernetes

```bash
# Aplicar manifiestos
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/api-facturas/
kubectl apply -f k8s/api-tax-calculator/

# Verificar estado
kubectl get pods -n tributariapp
kubectl get svc -n tributariapp
```

### Docker

```bash
# Construir imágenes
docker build -t tributariapp/api-facturas:latest -f apps/api-facturas/Dockerfile .
docker build -t tributariapp/api-tax-calculator:latest -f apps/api-tax-calculator/Dockerfile .

# Ejecutar con docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo

### Métricas Prometheus

Las métricas están expuestas en `/metrics` en cada servicio:

- Request duration
- Request count by status
- Active connections
- Business metrics (invoices created, tax calculations, etc.)

### Logs

Los logs se generan en formato JSON estructurado, facilitando su análisis con herramientas como ELK Stack o Datadog.

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Rate limiting por IP
- ✅ Validación de entrada con Zod
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado
- ✅ Secretos manejados con Kubernetes Secrets
- 🚧 Integración con Vault para gestión avanzada de secretos

## 🤝 Contribuir

Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia Apache 2.0 - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Arquitectura y Backend**: [@tuusuario](https://github.com/tuusuario)
- **Frontend**: [@frontend-dev](https://github.com/frontend-dev)
- **DevOps**: [@devops-team](https://github.com/devops-team)

## 📞 Soporte

- 📧 Email: soporte@tributariapp.com
- 💬 Slack: [tributariapp.slack.com](https://tributariapp.slack.com)
- 📖 Documentación: [docs.tributariapp.com](https://docs.tributariapp.com)

---

Made with ❤️ by the TributariApp Team
