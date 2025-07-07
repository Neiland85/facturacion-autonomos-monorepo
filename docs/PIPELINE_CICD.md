# Pipeline CI/CD - Facturación Autónomos Monorepo

## Descripción General

Este documento describe el pipeline de CI/CD implementado para el monorepo de facturación de autónomos, incluyendo la configuración de despliegue en Kubernetes.

## Arquitectura del Pipeline

### Stages del Pipeline

1. **Build** - Construcción del monorepo
2. **Test** - Pruebas unitarias, integración y linting
3. **Docker Build** - Construcción de imágenes Docker
4. **Deploy Staging** - Despliegue automático en staging
5. **Deploy Production** - Despliegue manual en producción
6. **Cleanup** - Limpieza de recursos

### Aplicaciones Incluidas

- **API Facturas** (`@facturacion/api-facturas`) - Puerto 3000
- **API Tax Calculator** (`@facturacion/api-tax-calculator`) - Puerto 3001
- **Web Frontend** (`@facturacion/web`) - Puerto 3002

## Configuración de Variables

### Variables de GitLab CI/CD

#### Configuración de Base de Datos
```bash
POSTGRES_PASSWORD_B64     # Password de PostgreSQL (base64)
DATABASE_URL_B64         # URL de conexión a la base de datos (base64)
POSTGRES_TEST_PASSWORD       # Password para PostgreSQL en tests (configurable)
```

#### Configuración de Secretos
```bash
JWT_SECRET_B64           # Secret para JWT (base64)
JWT_REFRESH_SECRET_B64   # Secret para refresh tokens (base64)
AEAT_CERTIFICATE_B64     # Certificado AEAT (base64)
AEAT_PRIVATE_KEY_B64     # Clave privada AEAT (base64)
ENCRYPTION_KEY_B64       # Clave de encriptación (base64)
```

#### Configuración de Monitoreo
```bash
SLACK_WEBHOOK_URL        # URL del webhook de Slack
SENTRY_DSN_B64          # DSN de Sentry (base64)
GRAFANA_ADMIN_PASSWORD  # Password de admin de Grafana
```

## Estructura de Kubernetes

### Namespaces
- `facturacion-staging` - Ambiente de staging
- `facturacion-production` - Ambiente de producción

### Recursos Deployados

#### Servicios de Base de Datos
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones

#### Servicios de Aplicación
- **API Facturas** - API principal de facturas
- **API Tax Calculator** - API de cálculos tributarios
- **Web** - Frontend Next.js

#### Servicios de Monitoreo
- **Prometheus** - Recolección de métricas
- **Grafana** - Visualización de métricas

### Ingress Configuration

#### Producción
- Frontend: `https://facturacion.${KUBE_DOMAIN}`
- API: `https://api-facturacion.${KUBE_DOMAIN}`

#### Staging
- Frontend: `https://facturacion-staging.${KUBE_DOMAIN}`
- API: `https://api-facturacion-staging.${KUBE_DOMAIN}`

## Proceso de Despliegue

### Staging (Automático)
1. Trigger: Push a `develop`
2. Build y test automático
3. Construcción de imágenes Docker
4. Despliegue automático en staging
5. Verificación de health checks

### Producción (Manual)
1. Trigger: Push a `main` + aprobación manual
2. Build y test automático
3. Construcción de imágenes Docker
4. Despliegue manual en producción
5. Verificación de health checks
6. Notificaciones a Slack

## Health Checks

### Endpoints de Salud
- API Facturas: `GET /health`
- API Tax Calculator: `GET /health`
- Web: `GET /` (homepage)

### Configuración de Probes
```yaml
livenessProbe:
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

startupProbe:
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 12
```

## Monitoreo y Alertas

### Métricas Recolectadas
- Request rate y latencia
- Error rate
- Uso de CPU y memoria
- Conexiones a base de datos
- Estado de pods y deployments

### Alertas Configuradas
- High Response Time (>500ms)
- High Error Rate (>5%)
- Database Connection Failure
- Pod Crash Looping
- Deployment Replicas Mismatch

## Seguridad

### Configuración de Contenedores
- Uso de usuarios no-root
- Imágenes Alpine para menor superficie de ataque
- Health checks configurados
- Resource limits aplicados

### Configuración de Red
- CORS configurado apropiadamente
- Rate limiting habilitado
- SSL/TLS forzado
- Certificados Let's Encrypt

## Comandos Útiles

### Despliegue Manual
```bash
# Staging
./deploy.sh staging

# Production
./deploy.sh production
```

### Verificación del Estado
```bash
# Ver pods
kubectl get pods -n facturacion-staging

# Ver logs
kubectl logs -f deployment/api-facturas -n facturacion-staging

# Ver métricas
kubectl top pods -n facturacion-staging
```

### Rollback
```bash
# Rollback de un deployment
kubectl rollout undo deployment/api-facturas -n facturacion-production

# Ver historial de rollouts
kubectl rollout history deployment/api-facturas -n facturacion-production
```

## Troubleshooting

### Problemas Comunes

1. **Imagen no encontrada**
   - Verificar que las imágenes se hayan construido correctamente
   - Verificar permisos del registry

2. **Pods en estado CrashLoopBackOff**
   - Verificar logs del pod
   - Verificar variables de entorno
   - Verificar conexiones a base de datos

3. **Servicios no accesibles**
   - Verificar configuración de Ingress
   - Verificar certificados SSL
   - Verificar DNS

### Logs Importantes
```bash
# Logs de aplicación
kubectl logs -f deployment/api-facturas -n facturacion-production

# Logs de Ingress
kubectl logs -f -n ingress-nginx deployment/ingress-nginx-controller

# Eventos del namespace
kubectl get events -n facturacion-production --sort-by=.metadata.creationTimestamp
```

## Mejoras Futuras

1. **Implementar GitOps con ArgoCD**
2. **Configurar backup automático de base de datos**
3. **Implementar blue-green deployments**
4. **Configurar auto-scaling (HPA)**
5. **Implementar service mesh (Istio)**
6. **Configurar disaster recovery**

## Contacto

Para soporte técnico o dudas sobre el pipeline, contactar al equipo de DevOps.
