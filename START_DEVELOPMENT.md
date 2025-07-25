# 🚀 INSTRUCCIONES PARA EJECUTAR YARN DEV

## 📋 PASOS PARA INICIAR DESARROLLO

### ✅ **OPCIÓN 1: DESDE TERMINAL**

```bash
# 1. Navegar al directorio del proyecto
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo

# 2. Iniciar desarrollo (elige una opción)

# OPCIÓN A: Solo frontend web
cd apps/web
yarn dev

# OPCIÓN B: Todos los servicios (desde raíz)
yarn dev

# OPCIÓN C: Workspace específico
yarn workspace @facturacion/web dev
```

### ✅ **OPCIÓN 2: USAR TAREAS DE VS CODE**

En VS Code, abre la paleta de comandos (Cmd+Shift+P) y busca:

- "Tasks: Run Task"
- Selecciona: "🌐 Frontend Web - Desarrollo"

### ✅ **OPCIÓN 3: TERMINAL INTEGRADO DE VS CODE**

1. Abre terminal integrado: Ctrl+`
2. Ejecuta: `cd apps/web && yarn dev`

## 🎯 **URLS ESPERADAS**

Cuando funcione, deberías ver:

```
✓ Ready in 2.1s
✓ Local:    http://localhost:3000
✓ Network:  http://192.168.x.x:3000
```

## 🔍 **SI HAY ERRORES**

1. **Error de dependencias**:

   ```bash
   yarn install
   ```

2. **Error de puertos ocupados**:

   ```bash
   pkill -f "next dev"
   ```

3. **Error de TypeScript**:
   ```bash
   yarn workspace @facturacion/web type-check
   ```

## 📦 **VERIFICACIÓN RÁPIDA**

```bash
# Verificar que Node.js funciona
node --version  # Debería mostrar v20.x.x

# Verificar que Yarn funciona
yarn --version  # Debería mostrar 4.9.2

# Verificar estructura del proyecto
ls apps/web/  # Debería mostrar package.json, src/, etc.
```

## 🎉 **¡LISTO!**

Una vez que veas "Ready in X.Xs", abre tu navegador en:
**http://localhost:3000**

Tu aplicación de facturación estará ejecutándose con:

- ✅ Sistema de seguridad completo
- ✅ Validación española (NIF/CIF/IVA)
- ✅ Autenticación JWT
- ✅ Protección anti-XSS/SQL injection
- ✅ OCR con rate limiting

¡Tu aplicación está lista para desarrollo! 🌟
