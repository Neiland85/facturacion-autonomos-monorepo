# 🔐 Configuración de GitHub Secrets

Para que el pipeline de GitHub Actions funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio.

## 📍 Ubicación de Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**

## 🔑 Secrets Requeridos

### AWS Credentials (para Terraform y EKS)
```
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
```

### Kubernetes Configs
```
KUBE_CONFIG_STAGING=<base64_encoded_kubeconfig_staging>
KUBE_CONFIG_PRODUCTION=<base64_encoded_kubeconfig_production>
```

Para generar el base64 del kubeconfig:
```bash
cat ~/.kube/config | base64 -w 0
```

### Database
```
DATABASE_PASSWORD=tu_password_seguro
```

### JWT y Otros
```
JWT_SECRET=tu_jwt_secret_muy_seguro
ENCRYPTION_KEY=tu_encryption_key
```

### Notificaciones (Opcional)
```
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
CODECOV_TOKEN=tu_token_codecov
```

## 🚀 Configuración por Entorno

### Staging Environment
1. Ve a **Settings** → **Environments**
2. Click **New environment**
3. Nombre: `staging`
4. Protection rules: `Required reviewers` (opcional)

### Production Environment
1. Ve a **Settings** → **Environments**
2. Click **New environment**
3. Nombre: `production`
4. Protection rules: `Required reviewers` (recomendado)

## 🔧 Configuración de AWS

### 1. Crear IAM User
```bash
aws iam create-user --user-name github-actions
```

### 2. Crear Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:*",
        "ecr:*",
        "ec2:*",
        "rds:*",
        "elasticache:*",
        "route53:*",
        "cloudwatch:*",
        "s3:*",
        "iam:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Asignar Policy
```bash
aws iam attach-user-policy --user-name github-actions --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### 4. Crear Access Keys
```bash
aws iam create-access-key --user-name github-actions
```

## 🔧 Configuración de Kubernetes

### 1. Configurar kubectl para EKS
```bash
aws eks update-kubeconfig --name tributariapp-production --region us-east-1
```

### 2. Verificar conexión
```bash
kubectl get nodes
```

### 3. Crear namespaces
```bash
kubectl create namespace tributariapp
kubectl create namespace tributariapp-staging
```

## 🔧 Configuración de Terraform

### 1. Crear S3 Bucket para estado
```bash
aws s3 mb s3://tributariapp-terraform-state
```

### 2. Habilitar versioning
```bash
aws s3api put-bucket-versioning --bucket tributariapp-terraform-state --versioning-configuration Status=Enabled
```

### 3. Configurar variables
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Editar terraform.tfvars con tus valores
```

## 🧪 Testing de Secrets

### 1. Test AWS Credentials
```bash
aws sts get-caller-identity
```

### 2. Test Kubernetes
```bash
kubectl get pods -n tributariapp
```

### 3. Test Terraform
```bash
cd terraform
terraform init
terraform plan
```

## 🚨 Troubleshooting

### Error: "No AWS credentials found"
- Verificar que `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` estén configurados
- Verificar que las credenciales tengan permisos suficientes

### Error: "Unable to connect to the server"
- Verificar que `KUBE_CONFIG_*` esté en base64
- Verificar que el cluster EKS esté funcionando

### Error: "Terraform state not found"
- Verificar que el bucket S3 exista
- Verificar permisos de S3

## 📋 Checklist

- [ ] AWS credentials configuradas
- [ ] Kubernetes configs en base64
- [ ] Database password configurado
- [ ] JWT secret configurado
- [ ] Environments creados (staging, production)
- [ ] S3 bucket para Terraform creado
- [ ] EKS cluster configurado
- [ ] Namespaces creados
- [ ] Secrets testeados

## 🔒 Seguridad

### Best Practices:
1. **Rotar credenciales** regularmente
2. **Usar IAM roles** cuando sea posible
3. **Limitar permisos** al mínimo necesario
4. **Auditar logs** regularmente
5. **Usar Vault** para secretos críticos

### Rotación de Secrets:
```bash
# Generar nuevo JWT secret
openssl rand -base64 32

# Generar nueva encryption key
openssl rand -base64 32

# Rotar AWS keys
aws iam create-access-key --user-name github-actions
# Eliminar la antigua después de actualizar
aws iam delete-access-key --user-name github-actions --access-key-id AKIA...
```
