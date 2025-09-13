# 🔐 Guía de Seguridad

## Variables de Entorno y Secretos

### ⚠️ IMPORTANTE: Nunca commits secretos reales

Los archivos `.env*` en este repositorio contienen **plantillas y ejemplos**. Para uso en producción:

1. **Desarrollo Local:**

   ```bash
   export POSTGRES_DEV_PASSWORD="tu_password_desarrollo_seguro"
   export NEXTAUTH_SECRET="tu_secret_nextauth_desarrollo"
   ```

2. **Producción:**
   - Usar variables de entorno del sistema
   - Configurar en el dashboard de Netlify/Vercel
   - Usar servicios de gestión de secretos (AWS Secrets Manager, Azure Key Vault)

### 🛡️ Passwords de Base de Datos

**✅ Buenas prácticas:**

- Usar variables de entorno reales: `${POSTGRES_PASSWORD}`
- Mínimo 16 caracteres con mayúsculas, minúsculas, números y símbolos
- Rotar passwords regularmente
- Usar diferentes passwords para desarrollo, staging y producción

**❌ No hacer:**

- Hardcodear passwords en archivos `.env`
- Usar passwords simples como "password123"
- Reutilizar passwords entre entornos

### 🔑 Secrets de Autenticación

**NextAuth Secret:**

```bash
# Generar secret seguro
openssl rand -base64 32
```

**JWT Secrets:**

```bash
# Para desarrollo
export JWT_SECRET=$(openssl rand -base64 64)
```

### 🚀 Configuración por Entorno

#### Desarrollo

```bash
cp .env.example .env.local
# Editar .env.local con tus valores reales
# NUNCA commitear .env.local
```

#### Producción

- Configurar variables en el proveedor de hosting
- Usar servicios de gestión de secretos
- Implementar rotación automática de secrets

### 📋 Checklist de Seguridad

- [ ] Variables de entorno no contienen secrets reales
- [ ] `.env.local` está en `.gitignore`
- [ ] Passwords de producción son únicos y complejos
- [ ] Secrets se rotan regularmente
- [ ] Acceso a base de datos está restringido por IP
- [ ] Logs no exponen información sensible

### 🆘 Si se compromete un secret

1. **Rotar inmediatamente** el secret comprometido
2. **Revisar logs** de acceso para actividad sospechosa
3. **Notificar al equipo** de seguridad
4. **Documentar el incidente** para prevención futura

## Service Accounts (Kubernetes)

### 🎯 Principio de Menor Privilegio

Cada service account debe tener **solo los permisos mínimos** necesarios:

```yaml
# Ejemplo de RBAC restrictivo
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: facturacion
rules:
  - apiGroups: ['']
    resources: ['pods']
    verbs: ['get', 'list']
    # NO usar ["*"] en verbs
```

### 🔒 Configuración Segura

```yaml
spec:
  template:
    spec:
      # Deshabilitar automount de service account si no es necesario
      automountServiceAccountToken: false

      # Usar service account específico
      serviceAccountName: facturacion-api-sa

      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
```

### 📊 Monitoreo de Seguridad

- Auditar uso de service accounts
- Monitorear accesos anómalos a la API
- Implementar alertas de actividad sospechosa
- Revisar permisos regularmente
