# 🐳 Docker Compose - Desarrollo Local

## Configuración Rápida

### 1. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tus necesidades
nano .env
```

### 2. Iniciar Servicios
```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# Verificar estado
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. Acceder a los Servicios

| Servicio | URL | Credenciales |
|----------|-----|-------------|
| Adminer (PostgreSQL) | http://localhost:8080 | postgres/[POSTGRES_PASSWORD] |
| Redis Commander | http://localhost:8081 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin/[GRAFANA_ADMIN_PASSWORD] |

### 4. Configurar Base de Datos
```bash
# Ejecutar migraciones de Prisma
cd apps/api-facturas
yarn prisma migrate dev --name init

# Generar cliente de Prisma
yarn prisma generate
```

## Servicios Incluidos

### 📊 Base de Datos
- **PostgreSQL 15** - Base de datos principal
- **Adminer** - Interfaz web para gestión de PostgreSQL

### 🚀 Cache
- **Redis 7** - Cache y sesiones
- **Redis Commander** - Interfaz web para gestión de Redis

### 📈 Monitoreo
- **Prometheus** - Recolección de métricas
- **Grafana** - Visualización de métricas

## Comandos Útiles

```bash
# Parar todos los servicios
docker-compose -f docker-compose.dev.yml down

# Parar y eliminar volúmenes
docker-compose -f docker-compose.dev.yml down -v

# Reconstruir imágenes
docker-compose -f docker-compose.dev.yml build --no-cache

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f postgres

# Ejecutar comando en contenedor
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d facturacion_dev
```

## Troubleshooting

### Puerto Ya en Uso
```bash
# Verificar qué proceso usa el puerto
lsof -i :5432

# Cambiar puerto en docker-compose.dev.yml
ports:
  - "5433:5432"  # Puerto 5433 en lugar de 5432
```

### Problemas de Permisos
```bash
# Limpiar volúmenes Docker
docker-compose -f docker-compose.dev.yml down -v
docker volume prune
```

### Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose -f docker-compose.dev.yml ps postgres

# Probar conexión
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

## Configuración de Desarrollo

### Variables de Entorno Principales
- `POSTGRES_PASSWORD` - Contraseña de PostgreSQL
- `GRAFANA_ADMIN_PASSWORD` - Contraseña de admin de Grafana
- `DATABASE_URL` - URL completa de conexión a la base de datos

### Volúmenes Persistentes
- `postgres_data` - Datos de PostgreSQL
- `redis_data` - Datos de Redis
- `prometheus_data` - Datos de Prometheus
- `grafana_data` - Configuración de Grafana

## Seguridad

⚠️ **IMPORTANTE**: Este archivo está configurado para desarrollo local únicamente. 

- Las contraseñas están parametrizadas con variables de entorno
- Usar `.env` para configurar credenciales locales
- Nunca subir archivos `.env` al repositorio
- Cambiar todas las credenciales en producción
