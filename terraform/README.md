# TributariApp - Terraform Infrastructure

Este directorio contiene la configuración de Terraform para desplegar la infraestructura de TributariApp en AWS.

## 🏗️ Arquitectura

### Componentes principales:
- **EKS Cluster**: Kubernetes para orquestar microservicios
- **RDS PostgreSQL**: Base de datos principal
- **ElastiCache Redis**: Caché y sesiones
- **Application Load Balancer**: Balanceador de carga
- **ECR**: Registro de contenedores
- **Route53**: DNS y routing
- **CloudWatch**: Logs y métricas

## 🚀 Despliegue

### Prerrequisitos:
1. **AWS CLI** configurado
2. **Terraform** >= 1.0
3. **kubectl** configurado
4. **Docker** para construir imágenes

### Configuración inicial:

1. **Configurar variables**:
```bash
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores
```

2. **Inicializar Terraform**:
```bash
terraform init
```

3. **Planificar cambios**:
```bash
terraform plan
```

4. **Aplicar infraestructura**:
```bash
terraform apply
```

### Despliegue de aplicaciones:

1. **Construir y push imágenes**:
```bash
# API Facturas
docker build -t tributariapp/api-facturas:latest -f apps/api-facturas/Dockerfile .
docker push tributariapp/api-facturas:latest

# API Tax Calculator
docker build -t tributariapp/api-tax-calculator:latest -f apps/api-tax-calculator/Dockerfile .
docker push tributariapp/api-tax-calculator:latest

# Frontend
docker build -t tributariapp/frontend:latest -f apps/web/Dockerfile .
docker push tributariapp/frontend:latest
```

2. **Desplegar en Kubernetes**:
```bash
kubectl apply -f k8s/
```

## 📊 Monitoreo

### URLs de acceso:
- **Aplicación**: https://app.tributariapp.com
- **API**: https://api.tributariapp.com
- **Grafana**: https://grafana.tributariapp.com
- **Prometheus**: https://prometheus.tributariapp.com

### Logs:
```bash
# Ver logs de pods
kubectl logs -f deployment/api-facturas -n tributariapp
kubectl logs -f deployment/api-tax-calculator -n tributariapp

# Ver métricas
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
```

## 🔧 Mantenimiento

### Escalado:
```bash
# Escalar manualmente
kubectl scale deployment api-facturas --replicas=5 -n tributariapp

# Ver HPA
kubectl get hpa -n tributariapp
```

### Actualizaciones:
```bash
# Rolling update
kubectl set image deployment/api-facturas api-facturas=tributariapp/api-facturas:v2.0.0 -n tributariapp
```

### Backup:
```bash
# Backup de base de datos
aws rds create-db-snapshot --db-instance-identifier tributariapp-production
```

## 🛡️ Seguridad

### Secretos:
- Usar AWS Secrets Manager para credenciales
- Rotar certificados SSL automáticamente
- Implementar NetworkPolicies en Kubernetes

### Compliance:
- Todos los recursos tienen tags de costos
- Logs centralizados en CloudWatch
- Métricas de seguridad con AWS Config

## 💰 Costos estimados

### Producción (mensual):
- EKS: ~$150
- RDS: ~$50
- ALB: ~$20
- ElastiCache: ~$30
- **Total**: ~$250/mes

### Desarrollo (mensual):
- EKS: ~$75
- RDS: ~$25
- ALB: ~$10
- ElastiCache: ~$15
- **Total**: ~$125/mes

## 🆘 Troubleshooting

### Problemas comunes:

1. **Pods no arrancan**:
```bash
kubectl describe pod <pod-name> -n tributariapp
kubectl logs <pod-name> -n tributariapp
```

2. **Problemas de red**:
```bash
kubectl get networkpolicies -n tributariapp
kubectl describe networkpolicy <policy-name> -n tributariapp
```

3. **Problemas de base de datos**:
```bash
aws rds describe-db-instances --db-instance-identifier tributariapp-production
```

## 📚 Referencias

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
