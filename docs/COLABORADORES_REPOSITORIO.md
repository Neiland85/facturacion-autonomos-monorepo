# 👥 Gestión de Colaboradores del Repositorio

Esta guía explica cómo añadir y gestionar colaboradores en el repositorio con diferentes niveles de permisos, especialmente cómo otorgar **permisos de escritura sin permisos de administración**.

## 📋 Tabla de Contenidos

- [Niveles de Permisos en GitHub](#niveles-de-permisos-en-github)
- [Añadir Colaboradores con Permisos de Escritura](#añadir-colaboradores-con-permisos-de-escritura)
- [Mejores Prácticas](#mejores-prácticas)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)
- [Solución de Problemas](#solución-de-problemas)

## 🔐 Niveles de Permisos en GitHub

GitHub ofrece diferentes niveles de acceso para colaboradores:

### 📖 **Read** (Lectura)
- Ver repositorio y su contenido
- Clonar y fetch del repositorio
- Crear issues y comentarios
- **No puede**: Hacer push, crear branches, o modificar configuraciones

### ✍️ **Write** (Escritura) ⭐ **RECOMENDADO PARA COLABORADORES**
- Todos los permisos de lectura
- Push a branches
- Crear y eliminar branches
- Crear y editar releases
- Gestionar issues y pull requests
- **No puede**: Modificar configuraciones del repositorio, gestionar colaboradores, o cambiar configuraciones de seguridad

### 🛠️ **Maintain** (Mantenimiento)
- Todos los permisos de escritura
- Gestionar issues sin permisos de escritura
- Gestionar configuraciones del repositorio (limitado)
- **No puede**: Gestionar colaboradores o configuraciones críticas de seguridad

### 👑 **Admin** (Administración)
- **Control total** sobre el repositorio
- Gestionar colaboradores y sus permisos
- Modificar configuraciones críticas
- Eliminar el repositorio
- ⚠️ **Solo para propietarios de confianza**

## 👤 Añadir Colaboradores con Permisos de Escritura

### Paso 1: Acceder a Configuraciones del Repositorio

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, selecciona **Collaborators and teams** (Colaboradores y equipos)

### Paso 2: Invitar Colaborador

1. Haz clic en **Add people** (Añadir personas)
2. Introduce el **username** o **email** del colaborador
3. GitHub sugerirá usuarios - selecciona el correcto
4. En el dropdown de permisos, selecciona **Write** ✅
5. Haz clic en **Add [username] to [repository]**

### Paso 3: Verificar la Invitación

El colaborador recibirá:
- 📧 **Email de invitación** (si configurado)
- 🔔 **Notificación en GitHub**
- Invitación visible en su dashboard de GitHub

### Paso 4: Confirmación del Colaborador

El colaborador debe:
1. Iniciar sesión en GitHub
2. Ir a la notificación de invitación
3. Hacer clic en **Accept invitation** (Aceptar invitación)
4. ✅ Ya tiene acceso de escritura al repositorio

## 🎯 Ejemplo de Configuración Recomendada

Para colaboradores del equipo de desarrollo:

```
👤 Colaborador: @nombre-usuario
🔐 Permiso: Write (Escritura)
📁 Acceso: Todo el repositorio
🚫 No puede: Modificar configuraciones, gestionar otros colaboradores
✅ Puede: Push, crear branches, PRs, issues
```

## 📋 Mejores Prácticas

### ✅ Hacer

1. **Usar permisos Write para desarrolladores**
   - Es suficiente para trabajo de desarrollo diario
   - Mantiene la seguridad del repositorio

2. **Revisar colaboradores regularmente**
   ```bash
   # Ir a Settings → Collaborators para auditar accesos
   ```

3. **Documentar roles del equipo**
   - Crear un archivo `TEAM.md` con roles y responsabilidades
   - Mantener actualizada la lista de colaboradores activos

4. **Configurar protección de branches**
   - Proteger `main` y `develop`
   - Requerir pull requests para cambios importantes
   - Configurar revisiones obligatorias

### ❌ Evitar

1. **No dar permisos Admin innecesariamente**
   - Solo para propietarios de confianza absoluta
   - Puede comprometer la seguridad del proyecto

2. **No usar permisos Read para desarrolladores activos**
   - Limita la productividad
   - Requiere flujo fork/PR para todo

3. **No olvidar revocar accesos**
   - Remover colaboradores que dejan el proyecto
   - Auditar permisos trimestralmente

## 🔒 Consideraciones de Seguridad

### Protección de Branches Principales

```yaml
# Configuración recomendada para main/develop
Branch Protection Rules:
  ✅ Require pull request reviews before merging
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Include administrators (recomendado)
  ❌ Allow force pushes (no recomendado)
  ❌ Allow deletions (no recomendado)
```

### Monitoreo de Actividad

- Revisar el **Activity tab** regularmente
- Configurar notificaciones para cambios importantes
- Usar **GitHub's security features** (Dependabot, code scanning)

### Gestión de Secretos

Los colaboradores con permisos Write **NO** pueden:
- Acceder a **GitHub Secrets**
- Modificar **Actions settings**
- Cambiar **security settings**

## 🔧 Solución de Problemas

### Problema: El colaborador no puede hacer push

**Solución:**
1. Verificar que aceptó la invitación
2. Confirmar que tiene permisos Write
3. Revisar que no hay protección de branch bloqueando

### Problema: El colaborador no ve el repositorio

**Solución:**
1. Confirmar que la invitación fue enviada al email/username correcto
2. Verificar que el colaborador está logueado en GitHub
3. Reenviar invitación si es necesario

### Problema: Error de permisos al crear PR

**Solución:**
1. Verificar configuración de branch protection
2. Confirmar que las status checks están configuradas correctamente
3. Revisar que el colaborador está en el branch correcto

## 📞 Comandos Útiles para Colaboradores

Una vez añadido con permisos Write, el colaborador puede:

```bash
# Clonar el repositorio
git clone git@github.com:Neiland85/facturacion-autonomos-monorepo.git

# Crear nueva branch para desarrollo
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: añadir nueva funcionalidad"

# Push directamente al repositorio
git push origin feature/nueva-funcionalidad

# Crear PR desde GitHub UI
```

## 🔄 Flujo de Trabajo Recomendado

1. **Colaborador** hace fork (opcional) o trabaja directamente
2. **Colaborador** crea branch para feature
3. **Colaborador** desarrolla y hace push
4. **Colaborador** crea Pull Request
5. **Team Lead/Owner** revisa y aprueba
6. **Merge** a branch principal

---

## 📚 Referencias Adicionales

- [GitHub Docs: Managing access to your repositories](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
- [GitHub Docs: Repository permission levels](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-permission-levels-for-an-organization)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

---

**🔑 Recuerda**: Los permisos Write son ideales para colaboradores de desarrollo, proporcionando acceso necesario sin comprometer la seguridad del repositorio.