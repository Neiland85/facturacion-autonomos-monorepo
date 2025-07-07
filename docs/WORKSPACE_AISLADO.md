# 🏢 Workspace Aislado VS Code - Guía de Uso

## 🎯 ¿Qué es un Workspace Aislado?

Un **workspace aislado** te permite tener configuraciones específicas para este proyecto sin afectar tu configuración global de VS Code. Es perfecto para proyectos con herramientas específicas como Copilot, ESLint, Prettier, etc.

## 📂 Archivos de Configuración

### 1. **Archivo Principal**: `facturacion-autonomos.code-workspace`

Este archivo contiene toda la configuración específica del proyecto:

- ✅ **Folders organizados** por apps y packages
- ✅ **Settings específicos** para TypeScript, ESLint, Prettier, Copilot
- ✅ **Extensiones recomendadas** solo para este proyecto
- ✅ **Tasks predefinidas** para desarrollo
- ✅ **Launch configs** para debugging

### 2. **Configuración Local**: `.vscode/` (Opcional)

Se mantiene para compatibilidad, pero el workspace tiene prioridad.

## 🚀 Cómo Usar el Workspace Aislado

### Opción 1: Abrir desde VS Code

1. Abre VS Code
2. `File` → `Open Workspace from File...`
3. Selecciona `facturacion-autonomos.code-workspace`
4. ¡Listo! Tendrás todas las configuraciones específicas

### Opción 2: Desde Terminal

```bash
# Navega al directorio del proyecto
cd /ruta/al/proyecto

# Abre el workspace
code facturacion-autonomos.code-workspace
```

### Opción 3: Doble clic

Simplemente haz doble clic en el archivo `.code-workspace` desde el explorador.

## 🎨 Características del Workspace

### 📁 **Folders Organizados**

```
🏠 Monorepo Root      # Raíz del proyecto
🌐 Web App           # Frontend Next.js
🧾 API Facturas      # API de facturación
🧮 API Tax Calculator # API de impuestos
🎨 UI Package         # Componentes UI
⚙️ Core Package       # Lógica central
🔧 Services Package   # Servicios compartidos
📝 Types Package      # Tipos TypeScript
🗄️ Prisma Schema     # Base de datos
📚 Documentation     # Documentación
```

### ⚙️ **Settings Automáticos**

- **Auto-formato** al guardar con Prettier
- **Auto-fix ESLint** al guardar
- **Imports automáticos** de TypeScript
- **Copilot habilitado** para todos los archivos
- **Tailwind IntelliSense** configurado
- **Prisma syntax highlighting**
- **Jest integration** para testing

### 🔧 **Tasks Predefinidas**

Accede con `Ctrl+Shift+P` → `Tasks: Run Task`:

- 🚀 **Dev: All Services** - Inicia todo en desarrollo
- 🌐 **Dev: Web Only** - Solo el frontend
- 🔨 **Build: All** - Build completo
- 🧪 **Test: All** - Ejecuta todos los tests
- 🔍 **Lint: All** - Linting completo
- 📝 **Type Check: All** - Verificación de tipos
- 🗄️ **Prisma: Generate** - Genera cliente Prisma
- 🗄️ **Prisma: Studio** - Abre Prisma Studio
- 📚 **ADR: New** - Crea nuevo ADR
- 🧹 **Clean: All** - Limpia archivos generados

### 🐛 **Debug Configurations**

Acceso desde el panel de Debug (`F5`):

- 🌐 **Debug Web App** - Debug del frontend
- 🧾 **Debug API Facturas** - Debug API facturas
- 🧮 **Debug API Tax Calculator** - Debug API impuestos
- 🧪 **Debug Jest Tests** - Debug de tests

### 🧩 **Extensiones Específicas**

Solo se instalarán cuando abras este workspace:

```
✅ GitHub Copilot & Copilot Chat
✅ TypeScript & JavaScript
✅ Tailwind CSS IntelliSense
✅ Prisma
✅ ESLint & Prettier
✅ Jest & Playwright
✅ GraphQL
✅ Markdown All in One
✅ Error Lens
✅ Path IntelliSense
✅ Thunder Client (para APIs)
```

## 🔒 Ventajas del Workspace Aislado

### ✅ **Aislamiento Completo**

- No afecta otros proyectos de VS Code
- Configuración específica para este monorepo
- Extensiones que solo se activan aquí

### ✅ **Desarrollo en Equipo**

- Todos los miembros del equipo tienen la misma configuración
- Versionable en Git
- Reduce problemas de configuración

### ✅ **Productividad Maximizada**

- Tasks predefinidas para workflows comunes
- Debug configurations listas
- Shortcuts específicos del proyecto

### ✅ **Flexibilidad**

- Fácil de modificar para necesidades específicas
- Se puede compartir entre equipos
- Compatible con VS Code local y remoto

## 🔄 Comparación: Global vs Workspace

| Aspecto           | VS Code Global              | Workspace Aislado            |
| ----------------- | --------------------------- | ---------------------------- |
| **Extensiones**   | Afectan todos los proyectos | Solo este proyecto           |
| **Settings**      | Configuración universal     | Específica del proyecto      |
| **Tasks**         | Genéricas                   | Optimizadas para el monorepo |
| **Debugging**     | Manual                      | Preconfigurado               |
| **Equipo**        | Inconsistente               | Uniforme                     |
| **Mantenimiento** | Individual                  | Versionado                   |

## 📝 Personalización

### Agregar Nuevas Tasks

Edita la sección `tasks` en el `.code-workspace`:

```json
{
  "label": "Mi Nueva Task",
  "type": "shell",
  "command": "mi-comando",
  "group": "build"
}
```

### Agregar Debug Configs

Edita la sección `launch` en el `.code-workspace`:

```json
{
  "name": "Mi Debug Config",
  "type": "node",
  "request": "launch",
  "program": "mi-script.js"
}
```

### Modificar Settings

Edita la sección `settings` en el `.code-workspace`:

```json
"mi.extension.setting": "valor"
```

## 🚨 Importante

### ⚠️ **Prioridad de Configuración**

1. **Workspace settings** (mayor prioridad)
2. Folder settings (.vscode/settings.json)
3. User settings (global)

### 📁 **Estructura Recomendada**

```
proyecto/
├── facturacion-autonomos.code-workspace  # ← Configuración principal
├── .vscode/                              # ← Configuración de respaldo
│   ├── extensions.json
│   └── settings.json
└── resto-del-proyecto/
```

### 🔄 **Sincronización**

- El workspace file está en Git (se comparte)
- Settings personales NO están en Git
- Cada developer puede tener sus ajustes adicionales

## 🆘 Troubleshooting

### Problema: No se cargan las extensiones

**Solución**: Abre el workspace file directamente, no la carpeta.

### Problema: Settings no se aplican

**Solución**: Verifica que estés en workspace mode (esquina inferior izquierda).

### Problema: Tasks no aparecen

**Solución**: `Ctrl+Shift+P` → `Tasks: Configure Task` → `Refresh`

---

## ✅ Resultado

Con este workspace aislado tendrás:

- 🔒 **Configuración aislada** que no afecta otros proyectos
- 🚀 **Desarrollo optimizado** con tools específicos
- 👥 **Experiencia consistente** en todo el equipo
- 📦 **Fácil de compartir** y versionar

**¡Empieza abriendo el archivo `facturacion-autonomos.code-workspace` y disfruta del desarrollo optimizado!**
