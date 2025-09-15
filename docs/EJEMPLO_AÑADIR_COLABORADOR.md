# 💼 Ejemplo Práctico: Añadir Compañero con Permisos de Escritura

> **Caso de uso**: Necesitas añadir un compañero al repositorio `facturacion-autonomos-monorepo` con permisos de escritura pero sin permisos de administración.

## 🎯 Escenario Real

**Situación**: Tu compañero de trabajo necesita acceso al repositorio para:
- Hacer commits y push de código
- Crear branches para nuevas features
- Crear y gestionar pull requests
- Trabajar con issues

**Pero NO debe poder**:
- Cambiar configuraciones del repositorio
- Añadir o remover otros colaboradores
- Acceder a secrets o configuraciones de seguridad
- Eliminar el repositorio

## 📋 Pasos Detallados

### Paso 1: Navegar a Configuraciones
1. Ve a: https://github.com/Neiland85/facturacion-autonomos-monorepo
2. Click en **⚙️ Settings** (esquina superior derecha)
3. En el menú lateral izquierdo, scroll hasta **🔐 Access**
4. Click en **👥 Collaborators and teams**

### Paso 2: Añadir el Colaborador
1. Click en **🟢 Add people** (botón verde)
2. En el campo de búsqueda, introduce:
   - **Username de GitHub** de tu compañero (ej: `@juan-perez`)
   - O su **email** asociado a GitHub
3. GitHub mostrará sugerencias - selecciona la correcta
4. En el dropdown de permisos, **asegúrate de seleccionar: Write** ✅
5. Click en **Add [username] to this repository**

### Paso 3: Verificación
Verás en la lista de colaboradores:
```
👤 juan-perez (ejemplo)
🔐 Role: Write
📧 Status: Pending invitation
```

### Paso 4: Confirmación del Colaborador
Tu compañero debe:
1. Revisar su **email** (bandeja de entrada)
2. O ir a **GitHub.com** y revisar notificaciones 🔔
3. Click en **Accept invitation**
4. El status cambiará de "Pending" a "Active"

## ✅ Verificar que Funciona

Tu compañero ahora puede:

```bash
# 1. Clonar el repositorio
git clone git@github.com:Neiland85/facturacion-autonomos-monorepo.git
cd facturacion-autonomos-monorepo

# 2. Crear nueva branch
git checkout -b feature/mi-nueva-funcionalidad

# 3. Hacer cambios y commit
echo "// Mi código" >> nuevo-archivo.js
git add .
git commit -m "feat: añadir nueva funcionalidad"

# 4. Push directamente (sin fork)
git push origin feature/mi-nueva-funcionalidad

# 5. Crear PR desde GitHub UI
```

## 🔒 Confirmar Permisos Correctos

Para verificar que los permisos están bien configurados:

### ✅ Tu compañero PUEDE hacer:
- Ver todo el código del repositorio
- Clonar y fetch
- Crear, modificar y eliminar branches
- Hacer commits y push
- Crear pull requests
- Comentar en issues y PRs
- Crear nuevos issues
- Asignar issues a sí mismo
- Añadir labels a issues/PRs

### ❌ Tu compañero NO puede hacer:
- Ir a **Settings** del repositorio (no aparece el tab)
- Añadir otros colaboradores
- Modificar branch protection rules
- Acceder a **Secrets and variables**
- Cambiar configuración de GitHub Actions
- Eliminar el repositorio
- Cambiar la visibilidad del repositorio

## 🧪 Prueba Rápida

Para confirmar que todo funciona:

1. **Pide a tu compañero** que haga un pequeño test:
   ```bash
   git clone git@github.com:Neiland85/facturacion-autonomos-monorepo.git
   cd facturacion-autonomos-monorepo
   git checkout -b test/verificar-permisos
   echo "# Test de permisos - $(date)" > test-permisos.md
   git add test-permisos.md
   git commit -m "test: verificar permisos de escritura"
   git push origin test/verificar-permisos
   ```

2. **Verificar** que el push fue exitoso en GitHub

3. **Limpiar** eliminando la branch de test desde GitHub UI

## 🚨 Si Algo Sale Mal

### Problema: "Permission denied" al hacer push
**Solución**:
- Verificar que el colaborador aceptó la invitación
- Confirmar que tiene permisos "Write" (no "Read")
- Revisar que la URL de clonación sea correcta (SSH vs HTTPS)

### Problema: No puede ver el repositorio
**Solución**:
- Confirmar que la invitación se envió al username/email correcto
- Verificar que el colaborador está logueado en GitHub
- Reenviar invitación si es necesario

### Problema: Aparece "Settings" tab
**Solución**:
- Verificar permisos - puede que tenga "Admin" en lugar de "Write"
- Cambiar permisos a "Write" desde la lista de colaboradores

## 📞 Contacto para Dudas

Si hay problemas durante el proceso:
1. Consultar [documentación completa](./COLABORADORES_REPOSITORIO.md)
2. Revisar [troubleshooting detallado](./COLABORADORES_REPOSITORIO.md#solución-de-problemas)
3. Contactar al administrador del repositorio

---

**🎉 ¡Listo!** Tu compañero ahora tiene acceso completo para desarrollo sin comprometer la seguridad del repositorio.