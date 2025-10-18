# Configuración de URLs del Frontend

## 🎯 Objetivo

Guía completa para configurar correctamente la URL base de la API en el frontend (Vite React). Asegura comunicación correcta entre el frontend en el navegador y el API Gateway.

---

## 📋 Valor Predeterminado

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

**Componentes:**
- **`http://localhost:3001`** → Puerta de entrada al API Gateway (puerto 3001)
- **`/api`** → Prefijo requerido; el gateway necesita identificar rutas que deben proxearse

---

## 🔌 Tabla de Puertos del Sistema

| Servicio | Puerto | Propósito |
|----------|--------|----------|
| Frontend (Vite Dev) | 5173 | Servidor de desarrollo React |
| API Gateway | 3001 | Enrutador central, proxy a microservicios |
| Auth Service | 3003 | Autenticación, tokens, usuarios |
| Invoice Service | 3002 | Facturas, clientes, empresas |
| Subscription Service | 3006 | Suscripciones, planes, webhooks |
| Database (PostgreSQL) | 5432 | Base de datos compartida |

---

## 📍 Por Qué el Sufijo `/api`

El API Gateway está configurado para:
- Recibir peticiones en `/api/*`
- Rutearlas según el prefijo a los microservicios correspondientes

**Ejemplo de flujo:**

```
Frontend: GET /api/invoices/123
    ↓
Gateway (3001) intercepta /api/invoices/*
    ↓
Reescribe a: /api/invoices/123
    ↓
Envía a Invoice Service (3002)
    ↓
Retorna respuesta al frontend
```

Sin el sufijo `/api`, el gateway no podría identificar la ruta.

---

## 🖥️ Configuración Local (Desarrollo)

### Paso 1: Crear o editar `.env.local`

En la carpeta raíz del frontend (`apps/web/`), crea un archivo `.env.local`:

```bash
GEMINI_API_KEY=tu_gemini_api_key
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_MOCK_DATA=false
```

### Paso 2: Reiniciar el servidor de desarrollo

```bash
cd apps/web
npm run dev
```

Vite recargará la configuración y usará la URL correcta.

### Paso 3: Verificar

Abre el navegador y revisa la consola de desarrollador (F12 → Network):
- Las peticiones a la API deben ir a `http://localhost:3001/api/...`
- Las respuestas deben incluir código 200 (o códigos HTTP esperados)

---

## 🐳 Configuración en Docker

Dentro de un contenedor Docker, los nombres de dominio interno difieren. El frontend en el contenedor `web` debe alcanzar el gateway en el contenedor `api-gateway`.

### En `docker-compose.yml`

```yaml
services:
  web:
    image: node:18-alpine
    environment:
      VITE_API_BASE_URL=http://api-gateway:3001/api
    ports:
      - "5173:5173"
    depends_on:
      - api-gateway
```

**Nota:** Dentro de la red Docker Compose, el nombre del servicio (`api-gateway`) actúa como host interno accesible.

---

## 🚀 Configuración en Producción

En un entorno de producción, la URL cambia según la infraestructura:

### Ejemplo 1: Con dominio propio

```bash
VITE_API_BASE_URL=https://api.tuempresa.com/api
```

### Ejemplo 2: Con CDN y servidor backend

```bash
VITE_API_BASE_URL=https://backend-prod.tuempresa.com/api
```

### Ejemplo 3: Con ruta relativa (recomendado)

```bash
VITE_API_BASE_URL=/api
```

En este caso, el frontend y el gateway se sirven desde el mismo dominio, eliminando necesidad de ajustar puertos.

---

## 🔍 Verificación de Configuración

### Checklist

- ✅ `VITE_API_BASE_URL` está definido en `.env.local`
- ✅ El valor incluye el sufijo `/api`
- ✅ El servidor de desarrollo se reinició después de actualizar `.env.local`
- ✅ En navegador, las peticiones van a `http://localhost:3001/api/...`
- ✅ El API Gateway está corriendo en puerto 3001 (`docker-compose up` o `pnpm dev`)
- ✅ Las respuestas del API no tienen errores de CORS

### Comando para revisar URL en el navegador

Abre la consola (F12 → Console) y ejecuta:

```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

Debe imprimir: `http://localhost:3001/api`

---

## 🛠️ Troubleshooting

### Error: "Cannot reach http://localhost:3001/api"

**Causa:** El API Gateway no está corriendo.

**Solución:**
```bash
# En otra terminal
docker-compose up api-gateway
# o
cd apps/api-gateway && pnpm dev
```

### Error: CORS error en navegador

**Causa:** El gateway o los microservicios no tienen CORS configurado, o la URL es incorrecta.

**Solución:**
1. Verifica que `VITE_API_BASE_URL` sea exactamente `http://localhost:3001/api`
2. Revisa que el gateway está en `http://localhost:3001`
3. Consulta `apps/api-gateway/src/index.ts` y verifica que `cors()` está habilitado

### Error: "Peticiones van a localhost:3000"

**Causa:** `.env.local` no fue actualizado o el servidor no se reinició.

**Solución:**
```bash
# 1. Verifica el archivo
cat apps/web/.env.local

# 2. Si no está correcto, edita:
VITE_API_BASE_URL=http://localhost:3001/api

# 3. Reinicia el servidor
npm run dev
```

---

## 📚 Referencias Relacionadas

- **`apps/web/services/httpClient.ts`** → Configura el cliente HTTP con `VITE_API_BASE_URL`
- **`API_GATEWAY_ROUTING.md`** → Detalle de cómo el gateway rutea peticiones
- **`docker-compose.yml`** → Configuración Docker con variables de entorno
- **`.env.example`** → Ejemplo de variables de entorno (ver sección FRONTEND CONFIGURATION)

---

## 📝 Resumen Rápido

| Ambiente | URL | Notas |
|----------|-----|-------|
| Desarrollo local | `http://localhost:3001/api` | Gateway en puerto 3001 |
| Docker Compose | `http://api-gateway:3001/api` | Nombre interno de servicio |
| Producción | `https://api.tuempresa.com/api` | Dominio real + sufijo `/api` |
| Mismo servidor | `/api` | Ruta relativa (recomendado) |

---

**Última actualización:** 17 de octubre de 2025  
**Versión:** 1.0
