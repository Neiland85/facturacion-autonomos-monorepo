# 🔧 Guía Rápida: Añadir Colaborador con Permisos de Escritura

> **Objetivo**: Añadir un compañero al repositorio con permisos de escritura pero sin permisos de administración/edición de configuraciones.

## 🚀 Pasos Rápidos

### 1. Ir a Configuraciones
```
Repositorio → Settings → Collaborators and teams
```

### 2. Añadir Colaborador
```
Click "Add people" → Introducir username/email → Seleccionar "Write" → Add
```

### 3. Verificar
```
✅ Colaborador recibe email/notificación
✅ Debe aceptar invitación
✅ Puede hacer push/PR pero NO cambiar configuraciones
```

## 📊 Niveles de Permisos

| Permiso | Push | Crear Branches | Issues/PR | Configurar Repo | Gestionar Usuarios |
|---------|------|----------------|-----------|-----------------|-------------------|
| **Read** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Write** ⭐ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Maintain** | ✅ | ✅ | ✅ | 🔸 | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

**⭐ Write = Perfecto para desarrolladores del equipo**

## 🔐 Lo que PUEDE hacer con permisos Write:
- ✅ Clonar repositorio
- ✅ Crear y eliminar branches
- ✅ Hacer push y commit
- ✅ Crear pull requests
- ✅ Gestionar issues
- ✅ Crear releases

## 🚫 Lo que NO puede hacer con permisos Write:
- ❌ Cambiar configuraciones del repositorio
- ❌ Añadir/remover colaboradores
- ❌ Acceder a GitHub Secrets
- ❌ Modificar protección de branches
- ❌ Eliminar el repositorio

## 📚 Documentación Completa
Ver: [docs/COLABORADORES_REPOSITORIO.md](./COLABORADORES_REPOSITORIO.md)

---
**💡 Consejo**: Los permisos Write son ideales para colaboradores de desarrollo - proporcionan acceso necesario sin comprometer la seguridad.