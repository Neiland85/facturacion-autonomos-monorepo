# Configuración de Seguridad - Prevención de Secretos Expuestos

## ⚠️ **NUNCA** comitear los siguientes archivos:

### Archivos de Entorno:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `*.env` (excepto `.env.example`)

### Archivos de Configuración con Secretos:
- Archivos con credenciales de base de datos reales
- Archivos con API keys reales
- Archivos con tokens de autenticación
- Certificados SSL/TLS privados

## ✅ **Archivos Seguros para Commitear:**

### Archivos de Ejemplo:
- `.env.example`
- `.env.template`
- Archivos de configuración con valores placeholder

### Patrones Seguros:
```bash
# ✅ Correcto - usando variables de entorno
DATABASE_URL="${DATABASE_URL}"
API_KEY="${API_KEY}"

# ✅ Correcto - valores de desarrollo/ejemplo
DATABASE_URL="postgresql://postgres:postgres_dev_password@localhost:5432/facturacion_dev"
API_KEY="your-api-key-here"

# ❌ Incorrecto - valores reales hardcodeados
DATABASE_URL="postgresql://admin:myRealPassword123@prod-server:5432/production_db"
API_KEY="sk-1234567890abcdef1234567890abcdef"
```

## 🛡️ **Medidas de Protección Implementadas:**

### 1. GitIgnore Configurado:
```gitignore
.env
.env.*
!.env.example
```

### 2. Variables de Entorno en Docker:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres_dev_password}
```

### 3. Archivos de Ejemplo Seguros:
- Todos los archivos `.env.example` contienen solo valores de desarrollo
- Documentación clara sobre qué variables usar

## 🚨 **Qué Hacer Si Se Detecta un Secreto:**

1. **Eliminar inmediatamente** el secreto del código
2. **Cambiar/rotar** el secreto comprometido
3. **Reescribir historial git** si es necesario
4. **Configurar pre-commit hooks** para prevenir futuros problemas

## 📋 **Checklist Pre-commit:**

- [ ] ¿Los archivos .env están en .gitignore?
- [ ] ¿Solo se comitean archivos .env.example?
- [ ] ¿Las contraseñas usan variables de entorno?
- [ ] ¿Los valores hardcodeados son solo de desarrollo?
- [ ] ¿Se ejecutó git-secrets o herramienta similar?

## 🔧 **Herramientas Recomendadas:**

- **GitGuardian**: Detección automática de secretos
- **git-secrets**: Pre-commit hook para prevenir commits con secretos
- **truffleHog**: Scanner de secretos en repositorios
- **detect-secrets**: Herramienta de pre-commit para Python
